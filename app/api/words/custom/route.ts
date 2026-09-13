import { json, readBody, route, tokenFrom } from "@/lib/api";
import { addCustomWord, listCustomWords } from "@/lib/dictionary";
import {
	addLog,
	findPlayerByToken,
	GameError,
	requirePlayer,
} from "@/lib/game";
import { getState, mutate } from "@/lib/store";

export const dynamic = "force-dynamic";

/** GET /api/words/custom - the house dictionary. */
export const GET = route(async () =>
	json({ ok: true, words: await listCustomWords() }),
);

/**
 * POST /api/words/custom  { word }
 * Appends to data/custom-words.txt so words missing from dictionaryapi.dev can be played.
 */
export const POST = route(async (req) => {
	const { word } = await readBody<{ word?: string }>(req);
	if (!word) throw new GameError("word is required.", 422);

	const token = tokenFrom(req);
	// Only players in the game may edit the house dictionary.
	requirePlayer(getState(), token);

	let result: { word: string; added: boolean };
	try {
		result = await addCustomWord(word);
	} catch (err) {
		throw new GameError(
			err instanceof Error ? err.message : "Could not add the word.",
			422,
		);
	}

	if (result.added) {
		mutate((state) => {
			const player = findPlayerByToken(state, token);
			addLog(
				state,
				`${player?.name ?? "Someone"} added "${result.word.toUpperCase()}" to the custom dictionary.`,
			);
		});
	}
	return json({ ok: true, ...result });
});
