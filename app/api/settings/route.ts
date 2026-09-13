import { okWithState, readBody, route, tokenFrom } from "@/lib/api";
import { requireHost, updateSettings } from "@/lib/game";
import { mutate } from "@/lib/store";
import type { GameSettings } from "@/lib/types";

export const dynamic = "force-dynamic";

/** POST /api/settings - host picks the bonuses (two-player games only). */
export const POST = route(async (req) => {
	const body = await readBody<Partial<GameSettings>>(req);
	const token = tokenFrom(req);
	mutate((state) => {
		requireHost(state, token);
		updateSettings(state, body);
	});
	return okWithState(req);
});
