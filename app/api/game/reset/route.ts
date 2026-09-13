import { okWithState, readBody, route, tokenFrom } from "@/lib/api";
import { requireHost, requirePlayer, resetGame } from "@/lib/game";
import { mutate } from "@/lib/store";

export const dynamic = "force-dynamic";

/**
 * POST /api/game/reset - back to the lobby.
 * Any player may reset once the game is over; abandoning a game in progress is host-only.
 */
export const POST = route(async (req) => {
	const { keepPlayers = true } = await readBody<{ keepPlayers?: boolean }>(req);
	const token = tokenFrom(req);
	mutate((state) => {
		if (state.phase === "playing" || state.phase === "roundEnd")
			requireHost(state, token);
		else requirePlayer(state, token);
		resetGame(state, keepPlayers);
	});
	return okWithState(req);
});
