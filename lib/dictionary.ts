import { promises as fs } from "node:fs";
import type { FreeDictionaryApiResponse } from "./types";
import type { WebsterAPIResult, WebsterEntry } from "./webster.types";

const FREE_DICTIONARY_API_BASE = process.env.QUIDDLER_FREE_DICTIONARY_API_BASE;
const WEBSTER_BASE_URL = process.env.QUIDDLER_WEBSTER_BASE_URL;
const WEBSTER_API_KEY = process.env.QUIDDLER_WEBSTER_API_KEY;
const CUSTOM_WORDS_PATH = process.env.QUIDDLER_CUSTOM_WORDS;

export const MIN_WORD_LENGTH = 2;

export type WordVerdict = "valid" | "invalid" | "unavailable" | "too-short";

export interface WordCheck {
	word: string;
	verdict: WordVerdict;
	/** Where the verdict came from. */
	source: "custom" | "api" | "cache" | "rule";
	message?: string;
}

/**
 * "This is a word" is permanent. "This is not a word" is not: the upstream
 * service has been observed 404-ing words it knows, so negatives expire and get
 * re-checked rather than sticking for the life of the process.
 */
const NEGATIVE_TTL_MS = 5 * 60 * 1000;

interface DictionaryCaches {
	custom: Set<string> | null;
	known: Set<string>;
	missing: Map<string, number>;
}

declare global {
	var __quiddlerDictionary: DictionaryCaches | undefined;
}

/** Survives dev-server hot reloads. */
globalThis.__quiddlerDictionary ??= {
	custom: null,
	known: new Set<string>(),
	missing: new Map<string, number>(),
};
const caches: DictionaryCaches = globalThis.__quiddlerDictionary;

function normalize(word: string): string {
	return word.trim().toLowerCase();
}

async function loadCustomWords(): Promise<Set<string>> {
	if (caches.custom) {
		return caches.custom;
	}

	const set = new Set<string>();

	if (!CUSTOM_WORDS_PATH) {
		return set;
	}

	try {
		const raw = await fs.readFile(CUSTOM_WORDS_PATH, "utf8");
		for (const line of raw.split(/\r?\n/)) {
			const word = normalize(line);

			if (!word || word.startsWith("#")) {
				continue;
			}

			set.add(word);
		}
	} catch (err) {
		if ((err as NodeJS.ErrnoException)?.code !== "ENOENT") {
			throw err;
		}
	}

	caches.custom = set;
	return set;
}

export async function listCustomWords(): Promise<string[]> {
	return [...(await loadCustomWords())].sort();
}

export async function addCustomWord(
	rawWord: string,
): Promise<{ word: string; added: boolean }> {
	const word = normalize(rawWord);
	if (!/^[a-z]+$/.test(word)) {
		throw new Error("A custom word must contain letters only.");
	}
	if (word.length < MIN_WORD_LENGTH) {
		throw new Error(`A word must be at least ${MIN_WORD_LENGTH} letters long.`);
	}

	if (!CUSTOM_WORDS_PATH) {
		return { word, added: false };
	}

	const custom = await loadCustomWords();
	if (custom.has(word)) return { word, added: false };

	await fs.appendFile(CUSTOM_WORDS_PATH, `${word}\n`, "utf8");
	custom.add(word);
	// A previously-cached "not in the API" verdict must not shadow the new entry.
	caches.missing.delete(word);
	return { word, added: true };
}

async function askFreeDictionary(word: string): Promise<boolean> {
	try {
		const res = await fetch(
			`${FREE_DICTIONARY_API_BASE}/${encodeURIComponent(word)}`,
			{
				method: "GET",
				headers: { accept: "application/json" },
			},
		);
		const response: FreeDictionaryApiResponse = await res.json();

		return response.entries.length > 0;
	} catch {
		// If external API is unreachable, don't block game just consider all words valid
		return true;
	}
}

enum Dictionary {
	FREE = "FREE",
	WEBSTER = "WEBSTER",
}

const activeDictionary = Dictionary.WEBSTER;

let warnedAboutMissingKey = false;

async function askMerriamWebster(word: string): Promise<boolean> {
	if (!WEBSTER_API_KEY) {
		if (!warnedAboutMissingKey) {
			warnedAboutMissingKey = true;
			console.warn(
				"QUIDDLER_WEBSTER_API_KEY is not set; accepting all words unchecked.",
			);
		}
		// Same stance as an unreachable API: don't block the game.
		return true;
	}
	try {
		const response = await fetch(
			`${WEBSTER_BASE_URL}/${encodeURIComponent(word)}?key=${WEBSTER_API_KEY}`,
			{
				method: "GET",
				headers: { accept: "application/json" },
			},
		);

		const result: WebsterAPIResult = await response.json();

		if (result.length === 0) {
			// Empty result means it's not a word
			return false;
		}

		if (result.some((entry) => typeof entry === "string")) {
			// Array of strings means it's a list of suggested words similar to what was requested
			return false;
		}

		const valid = (result as WebsterEntry[]).some((entry) => {
			if (
				entry.shortdef.length === 1 &&
				entry.shortdef[0].split(" ").length === 1
			) {
				// If short definition is a single word, this is most likely an abbreviation
				return false;
			}

			switch (entry.fl) {
				// Do not accept these types
				case "abbreviation":
				case "certification mark":
				case "prefix":
				case "suffix":
				case "symbol":
				case "trademark":
					return false;
				default:
					return true;
			}
		});

		return valid;
	} catch {
		// If external API is unreachable, don't block game just consider all words valid
		return true;
	}
}

async function askApi(word: string): Promise<WordCheck> {
	if (caches.known.has(word)) {
		return { word, verdict: "valid", source: "cache" };
	}

	const missingAt = caches.missing.get(word);

	if (missingAt !== undefined) {
		if (Date.now() - missingAt < NEGATIVE_TTL_MS) {
			return { word, verdict: "invalid", source: "cache" };
		}
		caches.missing.delete(word);
	}

	const isValid = await (activeDictionary === Dictionary.WEBSTER
		? askMerriamWebster(word)
		: askFreeDictionary(word));

	if (isValid) {
		return { word, verdict: "valid", source: "api" };
	}

	return {
		word,
		verdict: "invalid",
		source: "api",
		message: "Not found",
	};
}

export async function checkWord(rawWord: string): Promise<WordCheck> {
	const word = normalize(rawWord);
	if (word.length < MIN_WORD_LENGTH) {
		return {
			word,
			verdict: "too-short",
			source: "rule",
			message: `Words must be at least ${MIN_WORD_LENGTH} letters long.`,
		};
	}
	const custom = await loadCustomWords();
	if (custom.has(word)) return { word, verdict: "valid", source: "custom" };
	return askApi(word);
}

/** Checks a batch in parallel, de-duplicating repeated words. */
export async function checkWords(words: string[]): Promise<WordCheck[]> {
	const unique = [...new Set(words.map(normalize))];
	const checks = await Promise.all(unique.map(checkWord));
	const byWord = new Map(checks.map((c) => [c.word, c]));
	return words.map((w) => {
		const check = byWord.get(normalize(w));
		if (!check) throw new Error(`Word was not checked: ${w}`);
		return check;
	});
}
