import { okWithState, route, tokenFrom } from "@/lib/api";
import { nextRound, requireHost } from "@/lib/game";
import { mutate } from "@/lib/store";

export const dynamic = "force-dynamic";

/** POST /api/game/next-round - host deals the next round (or ends the game). */
export const POST = route(async (req) => {
	const token = tokenFrom(req);
	mutate((state) => {
		requireHost(state, token);
		nextRound(state);
	});
	return okWithState(req);
});
