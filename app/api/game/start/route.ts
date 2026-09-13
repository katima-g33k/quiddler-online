import { okWithState, route, tokenFrom } from "@/lib/api";
import { requireHost, startGame } from "@/lib/game";
import { mutate } from "@/lib/store";

export const dynamic = "force-dynamic";

/** POST /api/game/start - host deals round 1. */
export const POST = route(async (req) => {
	const token = tokenFrom(req);
	mutate((state) => {
		requireHost(state, token);
		startGame(state);
	});
	return okWithState(req);
});
