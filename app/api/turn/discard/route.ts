import { okWithState, readBody, route, tokenFrom } from "@/lib/api";
import { discardCard, GameError, requirePlayer } from "@/lib/game";
import { mutate } from "@/lib/store";

export const dynamic = "force-dynamic";

/** POST /api/turn/discard  { cardId } - ends the turn. */
export const POST = route(async (req) => {
	const { cardId } = await readBody<{ cardId?: string }>(req);
	if (!cardId) throw new GameError("cardId is required.", 422);
	const token = tokenFrom(req);
	mutate((state) => discardCard(state, requirePlayer(state, token), cardId));
	return okWithState(req);
});
