import { okWithState, readBody, route, tokenFrom } from "@/lib/api";
import { checkWords } from "@/lib/dictionary";
import {
	GameError,
	isFinalTurnFor,
	playWords,
	requirePlayer,
	resolveWords,
} from "@/lib/game";
import { getState, mutate } from "@/lib/store";

export const dynamic = "force-dynamic";

interface PlayBody {
	words?: string[][];
	discardCardId?: string | null;
}

/**
 * POST /api/turn/play  { words: [[cardId, ...], ...], discardCardId }
 *
 * Going out: every card is used by a word except the one discard.
 * Final turn (someone already went out): lay down what you can, discard one
 * card as usual, and the leftovers count against you.
 *
 * Words are dictionary-checked before anything is mutated, so a rejected play
 * leaves the hand exactly as it was.
 */
export const POST = route(async (req) => {
	const body = await readBody<PlayBody>(req);
	const words = body.words ?? [];
	if (!Array.isArray(words) || words.some((w) => !Array.isArray(w))) {
		throw new GameError("words must be an array of card-id arrays.", 422);
	}
	const token = tokenFrom(req);

	// Resolve against the live state first, but do not mutate: dictionary lookups
	// are async and the turn must still be valid when we commit.
	const state = getState();
	const player = requirePlayer(state, token);
	if (!isFinalTurnFor(state, player) && words.length === 0) {
		throw new GameError("You must lay down at least one word to go out.", 422);
	}
	const resolved = resolveWords(player, words);

	const checks = await checkWords(resolved.map((r) => r.word));
	const unavailable = checks.filter((c) => c.verdict === "unavailable");
	if (unavailable.length) {
		throw new GameError(
			"The dictionary could not be reached. Try again, or add the word to the custom dictionary.",
			503,
			{ unavailable: unavailable.map((c) => c.word) },
		);
	}
	const rejected = checks.filter((c) => c.verdict !== "valid");
	if (rejected.length) {
		throw new GameError(
			`Not a valid word: ${rejected.map((c) => c.word.toUpperCase()).join(", ")}.`,
			422,
			{ rejected },
		);
	}

	mutate((s) => {
		const p = requirePlayer(s, token);
		// Re-resolve on the committed state in case anything shifted while we waited.
		const fresh = resolveWords(p, words);
		playWords(
			s,
			p,
			{ words, discardCardId: body.discardCardId ?? null },
			fresh,
		);
	});

	return okWithState(req, { checks });
});
