import { json, okWithState, readBody, route, tokenFrom } from "@/lib/api";
import { joinGame, leaveGame, requirePlayer } from "@/lib/game";
import { serializeState } from "@/lib/serialize";
import { getState, mutate } from "@/lib/store";

export const dynamic = "force-dynamic";

/** POST /api/players - register a username and join the lobby. */
export const POST = route(async (req) => {
	const { name } = await readBody<{ name?: string }>(req);
	const player = mutate((state) => joinGame(state, name ?? ""));
	return json({
		ok: true,
		playerId: player.id,
		token: player.token,
		state: serializeState(getState(), player),
	});
});

/** DELETE /api/players - leave the lobby. */
export const DELETE = route(async (req) => {
	const token = tokenFrom(req);
	mutate((state) => leaveGame(state, requirePlayer(state, token)));
	return okWithState(req);
});
