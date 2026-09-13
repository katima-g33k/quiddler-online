import {
	bonusesLocked,
	currentPlayer,
	hostId,
	isFinalTurnFor,
	TOTAL_ROUNDS,
} from "./game";
import type { GameState, Player, PublicPlayer, PublicState } from "./types";

/** Builds the view of the game a single player is allowed to see. */
export function serializeState(
	state: GameState,
	viewer: Player | null,
): PublicState {
	const host = hostId(state);
	const turn = currentPlayer(state);

	const players: PublicPlayer[] = state.players.map((p) => ({
		id: p.id,
		name: p.name,
		isHost: p.id === host,
		isYou: viewer?.id === p.id,
		totalScore: p.totalScore,
		handCount: p.hand.length,
		laid: p.laid,
		finishedRound: p.finishedRound,
		online: p.connections > 0,
	}));

	const best = state.players.length
		? Math.max(...state.players.map((p) => p.totalScore))
		: 0;

	return {
		version: state.version,
		phase: state.phase,
		settings: state.settings,
		bonusesLocked: bonusesLocked(state),
		round: state.round,
		totalRounds: TOTAL_ROUNDS,
		handSize: state.handSize,
		players,
		you: viewer
			? {
					id: viewer.id,
					name: viewer.name,
					isHost: viewer.id === host,
					hand: viewer.hand,
					finishedRound: viewer.finishedRound,
				}
			: null,
		turnPlayerId: turn?.id ?? null,
		turnState: state.turnState,
		isFinalTurn: viewer ? isFinalTurnFor(state, viewer) : false,
		wentOutPlayerId: state.wentOutPlayerId,
		drawPileCount: state.drawPile.length,
		discardTop: state.discardPile.at(-1) ?? null,
		discardCount: state.discardPile.length,
		roundResults: state.roundResults,
		log: state.log.slice(-60),
		winnerIds:
			state.phase === "gameEnd"
				? state.players.filter((p) => p.totalScore === best).map((p) => p.id)
				: [],
	};
}
