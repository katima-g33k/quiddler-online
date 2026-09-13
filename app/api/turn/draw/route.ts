import { okWithState, readBody, route, tokenFrom } from "@/lib/api";
import { drawCard, GameError, requirePlayer } from "@/lib/game";
import { mutate } from "@/lib/store";

export const dynamic = "force-dynamic";

/** POST /api/turn/draw  { source: "deck" | "discard" } */
export const POST = route(async (req) => {
	const { source } = await readBody<{ source?: string }>(req);
	if (source !== "deck" && source !== "discard") {
		throw new GameError('source must be "deck" or "discard".', 422);
	}
	const token = tokenFrom(req);
	const card = mutate((state) =>
		drawCard(state, requirePlayer(state, token), source),
	);
	return okWithState(req, { card });
});
