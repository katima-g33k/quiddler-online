export type CardId = string;

export interface Card {
	/** Unique per physical card, e.g. "QU#1". */
	id: CardId;
	/** Face of the card: a single letter, or one of the two-letter cards. */
	letter: string;
	points: number;
}

export type Phase = "lobby" | "playing" | "roundEnd" | "gameEnd";

/** A player must draw a card, then act (discard, or lay down words). */
export type TurnState = "draw" | "act";

export interface LaidWord {
	word: string;
	cards: Card[];
	points: number;
	/** Letter count, which is what the "longest word" bonus is measured on. */
	length: number;
}

export interface GameSettings {
	bonusLongestWord: boolean;
	bonusMostWords: boolean;
}

export interface Player {
	id: string;
	/** Secret. Never leaves the server. */
	token: string;
	name: string;
	totalScore: number;
	hand: Card[];
	/** Words laid down in the current round. */
	laid: LaidWord[];
	/** True once the player has taken their final action for the round. */
	finishedRound: boolean;
	/** Number of open SSE connections for this player. */
	connections: number;
}

export interface RoundPlayerResult {
	playerId: string;
	name: string;
	words: LaidWord[];
	unused: Card[];
	wordPoints: number;
	penalty: number;
	longestWordBonus: number;
	mostWordsBonus: number;
	roundScore: number;
	totalAfter: number;
	wentOut: boolean;
}

export interface RoundResult {
	round: number;
	handSize: number;
	wentOutPlayerId: string | null;
	results: RoundPlayerResult[];
}

export interface LogEntry {
	id: number;
	at: number;
	text: string;
}

export interface GameState {
	phase: Phase;
	players: Player[];
	settings: GameSettings;
	/** 0 while in the lobby, then 1..8. */
	round: number;
	handSize: number;
	dealerIndex: number;
	turnIndex: number;
	turnState: TurnState;
	drawPile: Card[];
	/** Last element is the visible top of the pile. */
	discardPile: Card[];
	/** Set once somebody lays down their whole hand; others get one last turn. */
	wentOutPlayerId: string | null;
	roundResults: RoundResult[];
	log: LogEntry[];
	nextLogId: number;
	version: number;
}

/* ------------------------------------------------------------------ */
/* Wire format (what the client actually receives)                     */
/* ------------------------------------------------------------------ */

export interface PublicPlayer {
	id: string;
	name: string;
	isHost: boolean;
	isYou: boolean;
	totalScore: number;
	handCount: number;
	laid: LaidWord[];
	finishedRound: boolean;
	online: boolean;
}

export interface PublicSelf {
	id: string;
	name: string;
	isHost: boolean;
	hand: Card[];
	finishedRound: boolean;
}

export interface PublicState {
	version: number;
	phase: Phase;
	settings: GameSettings;
	bonusesLocked: boolean;
	round: number;
	totalRounds: number;
	handSize: number;
	players: PublicPlayer[];
	you: PublicSelf | null;
	turnPlayerId: string | null;
	turnState: TurnState;
	/**
	 * True when this player's remaining action is a final turn after someone
	 * went out. A final turn is still a normal turn — words then one discard —
	 * it just does not have to use up the whole hand.
	 */
	isFinalTurn: boolean;
	wentOutPlayerId: string | null;
	drawPileCount: number;
	discardTop: Card | null;
	discardCount: number;
	roundResults: RoundResult[];
	log: LogEntry[];
	winnerIds: string[];
}

/**
 * Types for the Dictionnary API
 */
type Language = {
	code: string;
	name: string;
};

type Pronunciation = {
	type: string;
	text: string;
	tags: string[];
};

type Form = {
	word: string;
	tags: string[];
};

type Quote = {
	text: string;
	reference: string;
};

type Sense = {
	definition: string;
	tags: string[];
	examples: string[];
	quotes: Quote[];
	synonyms: string[];
	antonyms: string[];
	subsenses: Sense[];
};

type Entry = {
	language: Language;
	partOfSpeech: string;
	pronunciations: Pronunciation[];
	forms: Form[];
	senses: Sense[];
	synonyms: string[];
	antonyms: string[];
};

type License = {
	name: string;
	url: string;
};

type Source = {
	url: string;
	license: License;
};

export type FreeDictionaryApiResponse = {
	word: string;
	entries: Entry[];
	source: Source;
};
