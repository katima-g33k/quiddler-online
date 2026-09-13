import { json, readBody, route } from "@/lib/api";
import { checkWords } from "@/lib/dictionary";
import { GameError } from "@/lib/game";

export const dynamic = "force-dynamic";

/** POST /api/words/validate  { words: ["stone", ...] } - pre-flight check for the UI. */
export const POST = route(async (req) => {
	const { words } = await readBody<{ words?: string[] }>(req);
	if (!Array.isArray(words) || words.some((w) => typeof w !== "string")) {
		throw new GameError("words must be an array of strings.", 422);
	}
	if (words.length > 20)
		throw new GameError("Too many words in one request.", 422);
	return json({ ok: true, checks: await checkWords(words) });
});
