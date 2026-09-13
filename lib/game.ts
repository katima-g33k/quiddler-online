import { buildDeck, cardsToWord, shuffle, totalPoints } from "./deck";
import type {
	Card,
	CardId,
	GameSettings,
	GameState,
	LaidWord,
	Player,
	RoundPlayerResult,
	RoundResult,
} from "./types";

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 8;
export const FIRST_HAND_SIZE = 3;
export const LAST_HAND_SIZE = 10;
export const TOTAL_ROUNDS = LAST_HAND_SIZE - FIRST_HAND_SIZE + 1; // 8
export const BONUS_POINTS = 10;

export class GameError extends Error {
	status: number;
	details?: unknown;
	constructor(message: string, status = 400, details?: unknown) {
		super(message);
		this.name = "GameError";
		this.status = status;
		this.details = details;
	}
}

/* ------------------------------------------------------------------ */
/* Construction                                                        */
/* ------------------------------------------------------------------ */

export function createGame(): GameState {
	return {
		phase: "lobby",
		players: [],
		settings: { bonusLongestWord: false, bonusMostWords: false },
		round: 0,
		handSize: 0,
		dealerIndex: 0,
		turnIndex: 0,
		turnState: "draw",
		drawPile: [],
		discardPile: [],
		wentOutPlayerId: null,
		roundResults: [],
		log: [],
		nextLogId: 1,
		version: 0,
	};
}

export function addLog(state: GameState, text: string): void {
	state.log.push({ id: state.nextLogId++, at: Date.now(), text });
	// The log is only ever read as a feed; keep it from growing without bound.
	if (state.log.length > 300) state.log.splice(0, state.log.length - 300);
}

/* ------------------------------------------------------------------ */
/* Lookups                                                             */
/* ------------------------------------------------------------------ */

export function findPlayerByToken(
	state: GameState,
	token: string | null,
): Player | null {
	if (!token) return null;
	return state.players.find((p) => p.token === token) ?? null;
}

export function requirePlayer(state: GameState, token: string | null): Player {
	const player = findPlayerByToken(state, token);
	if (!player) throw new GameError("You are not in this game.", 401);
	return player;
}

export function hostId(state: GameState): string | null {
	return state.players[0]?.id ?? null;
}

export function requireHost(state: GameState, token: string | null): Player {
	const player = requirePlayer(state, token);
	if (player.id !== hostId(state)) {
		throw new GameError("Only the host can do that.", 403);
	}
	return player;
}

export function currentPlayer(state: GameState): Player | null {
	if (state.phase !== "playing") return null;
	return state.players[state.turnIndex] ?? null;
}

/** True when the given player's remaining action is their one last turn. */
export function isFinalTurnFor(state: GameState, player: Player): boolean {
	return state.wentOutPlayerId !== null && state.wentOutPlayerId !== player.id;
}

function requireTurn(state: GameState, player: Player): void {
	if (state.phase !== "playing")
		throw new GameError("The game is not in progress.", 409);
	if (currentPlayer(state)?.id !== player.id)
		throw new GameError("It is not your turn.", 409);
}

/* ------------------------------------------------------------------ */
/* Lobby                                                               */
/* ------------------------------------------------------------------ */

export function joinGame(state: GameState, rawName: string): Player {
	if (state.phase !== "lobby") {
		throw new GameError(
			"A game is already in progress. Wait for it to finish.",
			409,
		);
	}
	const name = rawName.trim().replace(/\s+/g, " ");
	if (name.length < 1 || name.length > 20) {
		throw new GameError("Pick a username between 1 and 20 characters.", 422);
	}
	if (state.players.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
		throw new GameError("That username is already taken.", 409);
	}
	if (state.players.length >= MAX_PLAYERS) {
		throw new GameError(`The game is full (${MAX_PLAYERS} players max).`, 409);
	}

	const player: Player = {
		id: crypto.randomUUID(),
		token: crypto.randomUUID(),
		name,
		totalScore: 0,
		hand: [],
		laid: [],
		finishedRound: false,
		connections: 0,
	};
	state.players.push(player);
	addLog(state, `${name} joined the game.`);

	// Bonus selection is only a choice in a two-player game.
	syncBonusLock(state);
	return player;
}

export function leaveGame(state: GameState, player: Player): void {
	if (state.phase === "playing" || state.phase === "roundEnd") {
		throw new GameError("You cannot leave while a game is in progress.", 409);
	}
	state.players = state.players.filter((p) => p.id !== player.id);
	addLog(state, `${player.name} left the game.`);
	syncBonusLock(state);
}

/** With 3+ players both bonuses are always in play, so the setting is forced on. */
export function bonusesLocked(state: GameState): boolean {
	return state.players.length >= 3;
}

function syncBonusLock(state: GameState): void {
	if (bonusesLocked(state)) {
		state.settings.bonusLongestWord = true;
		state.settings.bonusMostWords = true;
	} else if (state.settings.bonusLongestWord && state.settings.bonusMostWords) {
		// Both on is only reachable while locked, so dropping back under 3 players
		// clears the pair and the host has to pick a single bonus again.
		state.settings.bonusLongestWord = false;
		state.settings.bonusMostWords = false;
	}
}

/** Under 3 players the host must have exactly one bonus in play before dealing. */
export function bonusChosen(state: GameState): boolean {
	return state.settings.bonusLongestWord || state.settings.bonusMostWords;
}

export function updateSettings(
	state: GameState,
	settings: Partial<GameSettings>,
): void {
	if (state.phase !== "lobby") {
		throw new GameError("Bonuses can only be changed in the lobby.", 409);
	}
	if (bonusesLocked(state)) {
		throw new GameError(
			"With 3 or more players both bonuses are always awarded.",
			409,
		);
	}
	if (settings.bonusLongestWord && settings.bonusMostWords) {
		throw new GameError(
			"With fewer than 3 players only one bonus can be in play.",
			409,
		);
	}
	// The two bonuses are mutually exclusive here, so turning one on turns the other off.
	if (typeof settings.bonusLongestWord === "boolean") {
		state.settings.bonusLongestWord = settings.bonusLongestWord;
		if (settings.bonusLongestWord) state.settings.bonusMostWords = false;
	}
	if (typeof settings.bonusMostWords === "boolean") {
		state.settings.bonusMostWords = settings.bonusMostWords;
		if (settings.bonusMostWords) state.settings.bonusLongestWord = false;
	}
	const on = [
		state.settings.bonusLongestWord ? "longest word" : null,
		state.settings.bonusMostWords ? "most words" : null,
	].filter(Boolean);
	addLog(state, `Bonus set to: ${on.length ? on.join(" + ") : "none"}.`);
}

/* ------------------------------------------------------------------ */
/* Round setup                                                         */
/* ------------------------------------------------------------------ */

export function startGame(state: GameState): void {
	if (state.phase !== "lobby")
		throw new GameError("The game has already started.", 409);
	if (state.players.length < MIN_PLAYERS) {
		throw new GameError(
			`You need at least ${MIN_PLAYERS} players to start.`,
			409,
		);
	}
	syncBonusLock(state);
	if (!bonusChosen(state)) {
		throw new GameError("Pick a round bonus before dealing.", 409);
	}
	for (const p of state.players) {
		p.totalScore = 0;
	}
	state.roundResults = [];
	state.round = 0;
	state.dealerIndex = Math.floor(Math.random() * state.players.length);
	addLog(
		state,
		`Game started with ${state.players.length} players. ${state.players[state.dealerIndex].name} deals first.`,
	);
	beginRound(state);
}

function beginRound(state: GameState): void {
	state.round += 1;
	state.handSize = FIRST_HAND_SIZE + state.round - 1;
	state.phase = "playing";
	state.wentOutPlayerId = null;

	const deck = shuffle(buildDeck());
	for (const p of state.players) {
		p.hand = deck.splice(0, state.handSize);
		p.laid = [];
		p.finishedRound = false;
	}
	const flipped = deck.pop();
	state.discardPile = flipped ? [flipped] : [];
	state.drawPile = deck;

	state.turnIndex = (state.dealerIndex + 1) % state.players.length;
	state.turnState = "draw";

	addLog(
		state,
		`Round ${state.round} of ${TOTAL_ROUNDS}: ${state.handSize}-card hands. ` +
			`${state.players[state.turnIndex].name} goes first.`,
	);
}

export function nextRound(state: GameState): void {
	if (state.phase !== "roundEnd") {
		throw new GameError("The round is not over.", 409);
	}
	if (state.round >= TOTAL_ROUNDS) {
		state.phase = "gameEnd";
		const best = Math.max(...state.players.map((p) => p.totalScore));
		const winners = state.players.filter((p) => p.totalScore === best);
		addLog(
			state,
			winners.length === 1
				? `${winners[0].name} wins with ${best} points!`
				: `Tie at ${best} points: ${winners.map((w) => w.name).join(", ")}.`,
		);
		return;
	}
	state.dealerIndex = (state.dealerIndex + 1) % state.players.length;
	beginRound(state);
}

/** Back to the lobby. Players are kept so a rematch is one click. */
export function resetGame(state: GameState, keepPlayers: boolean): void {
	const players = keepPlayers ? state.players : [];
	for (const p of players) {
		p.totalScore = 0;
		p.hand = [];
		p.laid = [];
		p.finishedRound = false;
	}
	state.phase = "lobby";
	state.players = players;
	state.round = 0;
	state.handSize = 0;
	state.dealerIndex = 0;
	state.turnIndex = 0;
	state.turnState = "draw";
	state.drawPile = [];
	state.discardPile = [];
	state.wentOutPlayerId = null;
	state.roundResults = [];
	if (!keepPlayers) {
		state.settings = { bonusLongestWord: false, bonusMostWords: false };
	}
	syncBonusLock(state);
	addLog(
		state,
		keepPlayers ? "Back to the lobby for a new game." : "Game reset.",
	);
}

/* ------------------------------------------------------------------ */
/* Turns                                                               */
/* ------------------------------------------------------------------ */

/** When the draw pile runs dry, all but the top discard is shuffled back in. */
function replenishDrawPile(state: GameState): void {
	if (state.drawPile.length > 0 || state.discardPile.length <= 1) return;
	const top = state.discardPile[state.discardPile.length - 1];
	state.drawPile = shuffle(state.discardPile.slice(0, -1));
	state.discardPile = [top];
	addLog(
		state,
		"The draw pile ran out; the discard pile was shuffled back in.",
	);
}

export function drawCard(
	state: GameState,
	player: Player,
	source: "deck" | "discard",
): Card {
	requireTurn(state, player);
	if (state.turnState !== "draw") {
		throw new GameError("You have already drawn this turn.", 409);
	}

	let card: Card | undefined;
	if (source === "deck") {
		replenishDrawPile(state);
		card = state.drawPile.pop();
		if (!card) {
			// Nothing left anywhere to draw: end the round rather than deadlock.
			addLog(state, "No cards left to draw. The round ends here.");
			endRound(state);
			throw new GameError(
				"There were no cards left to draw, so the round ended.",
				409,
			);
		}
	} else {
		card = state.discardPile.pop();
		if (!card) throw new GameError("The discard pile is empty.", 409);
	}

	player.hand.push(card);
	state.turnState = "act";
	addLog(
		state,
		source === "deck"
			? `${player.name} drew from the deck.`
			: `${player.name} took ${card.letter} from the discard pile.`,
	);
	return card;
}

function takeFromHand(player: Player, cardIds: CardId[]): Card[] {
	const seen = new Set<CardId>();
	const cards: Card[] = [];
	for (const id of cardIds) {
		if (seen.has(id))
			throw new GameError(`Card ${id} was used more than once.`, 422);
		seen.add(id);
		const card = player.hand.find((c) => c.id === id);
		if (!card) throw new GameError(`Card ${id} is not in your hand.`, 422);
		cards.push(card);
	}
	return cards;
}

function removeFromHand(player: Player, cards: Card[]): void {
	const ids = new Set(cards.map((c) => c.id));
	player.hand = player.hand.filter((c) => !ids.has(c.id));
}

export function discardCard(
	state: GameState,
	player: Player,
	cardId: CardId,
): void {
	requireTurn(state, player);
	if (state.turnState !== "act")
		throw new GameError("You must draw a card first.", 409);
	const [card] = takeFromHand(player, [cardId]);
	removeFromHand(player, [card]);
	state.discardPile.push(card);
	addLog(state, `${player.name} discarded ${card.letter}.`);
	endTurn(state);
}

export interface PlayRequest {
	/** One inner array per word, in card order. */
	words: CardId[][];
	/** Always required: every turn, last turn included, ends with one discard. */
	discardCardId?: CardId | null;
}

/** Resolves the requested words into cards + spelling without mutating anything. */
export function resolveWords(
	player: Player,
	words: CardId[][],
): { cards: Card[]; word: string }[] {
	const flat = words.flat();
	// validates ownership + no duplicates across all words
	const taken = takeFromHand(player, flat);
	const byId = new Map(taken.map((c) => [c.id, c]));
	return words.map((ids) => {
		if (ids.length === 0) throw new GameError("A word cannot be empty.", 422);
		const cards = ids.map((id) => {
			const card = byId.get(id);
			if (!card) throw new GameError(`Card ${id} is not in your hand.`, 422);
			return card;
		});
		return { cards, word: cardsToWord(cards) };
	});
}

/**
 * Lays down words. Every turn ends with exactly one discard; the two shapes
 * differ only in how much of the hand has to be used:
 *  - going out: every card in hand is used by a word except the discard;
 *  - final turn: use whatever you can, leftovers count against you.
 * Words must already have been dictionary-checked by the caller.
 */
export function playWords(
	state: GameState,
	player: Player,
	request: PlayRequest,
	resolved: { cards: Card[]; word: string }[],
): void {
	requireTurn(state, player);
	if (state.turnState !== "act")
		throw new GameError("You must draw a card first.", 409);

	const finalTurn = isFinalTurnFor(state, player);
	const usedCards = resolved.flatMap((r) => r.cards);

	if (!request.discardCardId) {
		throw new GameError(
			finalTurn
				? "You must still discard one card to end your last turn."
				: "To go out you must discard one card.",
			422,
		);
	}
	const [discard] = takeFromHand(player, [request.discardCardId]);
	if (usedCards.some((c) => c.id === discard.id)) {
		throw new GameError(
			"The discarded card cannot also be used in a word.",
			422,
		);
	}
	if (!finalTurn && usedCards.length + 1 !== player.hand.length) {
		throw new GameError(
			`To go out you must use every card in your hand. ` +
				`You have ${player.hand.length} cards: ${usedCards.length} in words plus 1 discard.`,
			422,
		);
	}
	state.discardPile.push(discard);
	removeFromHand(player, [discard]);

	player.laid = resolved.map<LaidWord>((r) => ({
		word: r.word,
		cards: r.cards,
		points: totalPoints(r.cards),
		length: r.word.length,
	}));
	removeFromHand(player, usedCards);

	const wordList = player.laid.map((w) => w.word.toUpperCase()).join(", ");
	if (finalTurn) {
		addLog(
			state,
			player.laid.length
				? `${player.name} laid down ${wordList}, discarded ${discard.letter} (${player.hand.length} card(s) left over).`
				: `${player.name} could not make a word and discarded ${discard.letter}.`,
		);
	} else {
		state.wentOutPlayerId = player.id;
		addLog(
			state,
			`${player.name} went out with ${wordList}! Everyone else gets one last turn.`,
		);
	}

	endTurn(state);
}

function endTurn(state: GameState): void {
	const player = state.players[state.turnIndex];
	// A player is done for the round once they have laid down (going out, or their last turn).
	if (state.wentOutPlayerId !== null) player.finishedRound = true;

	const n = state.players.length;
	for (let step = 1; step <= n; step++) {
		const idx = (state.turnIndex + step) % n;
		if (!state.players[idx].finishedRound) {
			state.turnIndex = idx;
			state.turnState = "draw";
			return;
		}
	}
	endRound(state);
}

/* ------------------------------------------------------------------ */
/* Scoring                                                            */
/* ------------------------------------------------------------------ */

export function endRound(state: GameState): void {
	const { bonusLongestWord, bonusMostWords } = state.settings;

	const longestLength = Math.max(
		0,
		...state.players.flatMap((p) => p.laid.map((w) => w.length)),
	);
	const longestHolders = longestLength
		? state.players.filter((p) =>
				p.laid.some((w) => w.length === longestLength),
			)
		: [];

	const mostWordsCount = Math.max(
		0,
		...state.players.map((p) => p.laid.length),
	);
	const mostWordsHolders = mostWordsCount
		? state.players.filter((p) => p.laid.length === mostWordsCount)
		: [];

	// A bonus is only awarded when a single player holds it outright.
	const longestWinner =
		bonusLongestWord && longestHolders.length === 1 ? longestHolders[0] : null;
	const mostWordsWinner =
		bonusMostWords && mostWordsHolders.length === 1
			? mostWordsHolders[0]
			: null;

	const results: RoundPlayerResult[] = state.players.map((p) => {
		const wordPoints = p.laid.reduce((n, w) => n + w.points, 0);
		const penalty = totalPoints(p.hand);
		const longestWordBonus = longestWinner?.id === p.id ? BONUS_POINTS : 0;
		const mostWordsBonus = mostWordsWinner?.id === p.id ? BONUS_POINTS : 0;
		const roundScore = wordPoints - penalty + longestWordBonus + mostWordsBonus;
		p.totalScore += roundScore;
		return {
			playerId: p.id,
			name: p.name,
			words: p.laid,
			unused: p.hand,
			wordPoints,
			penalty,
			longestWordBonus,
			mostWordsBonus,
			roundScore,
			totalAfter: p.totalScore,
			wentOut: state.wentOutPlayerId === p.id,
		};
	});

	const result: RoundResult = {
		round: state.round,
		handSize: state.handSize,
		wentOutPlayerId: state.wentOutPlayerId,
		results,
	};
	state.roundResults.push(result);
	state.phase = "roundEnd";

	if (longestWinner) {
		addLog(
			state,
			`${longestWinner.name} gets +${BONUS_POINTS} for the longest word (${longestLength} letters).`,
		);
	}
	if (mostWordsWinner) {
		addLog(
			state,
			`${mostWordsWinner.name} gets +${BONUS_POINTS} for the most words (${mostWordsCount}).`,
		);
	}
	addLog(state, `Round ${state.round} scored.`);
}
