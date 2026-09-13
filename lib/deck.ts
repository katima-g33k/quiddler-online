import type { Card } from "./types";

export interface CardSpec {
	letter: string;
	points: number;
	count: number;
}

/**
 * The 118-card Quiddler deck.
 * Source: https://en.wikipedia.org/wiki/Quiddler (Deck section).
 */
export const CARD_SPECS: CardSpec[] = [
	{ letter: "A", points: 2, count: 10 },
	{ letter: "B", points: 8, count: 2 },
	{ letter: "C", points: 8, count: 2 },
	{ letter: "D", points: 5, count: 4 },
	{ letter: "E", points: 2, count: 12 },
	{ letter: "F", points: 6, count: 2 },
	{ letter: "G", points: 6, count: 4 },
	{ letter: "H", points: 7, count: 2 },
	{ letter: "I", points: 2, count: 8 },
	{ letter: "J", points: 13, count: 2 },
	{ letter: "K", points: 8, count: 2 },
	{ letter: "L", points: 3, count: 4 },
	{ letter: "M", points: 5, count: 2 },
	{ letter: "N", points: 5, count: 6 },
	{ letter: "O", points: 2, count: 8 },
	{ letter: "P", points: 6, count: 2 },
	{ letter: "Q", points: 15, count: 2 },
	{ letter: "R", points: 5, count: 6 },
	{ letter: "S", points: 3, count: 4 },
	{ letter: "T", points: 3, count: 6 },
	{ letter: "U", points: 4, count: 6 },
	{ letter: "V", points: 11, count: 2 },
	{ letter: "W", points: 10, count: 2 },
	{ letter: "X", points: 12, count: 2 },
	{ letter: "Y", points: 4, count: 4 },
	{ letter: "Z", points: 14, count: 2 },
	{ letter: "CL", points: 10, count: 2 },
	{ letter: "ER", points: 7, count: 2 },
	{ letter: "IN", points: 7, count: 2 },
	{ letter: "QU", points: 9, count: 2 },
	{ letter: "TH", points: 9, count: 2 },
];

export const DECK_SIZE = CARD_SPECS.reduce((n, s) => n + s.count, 0); // 118

export function buildDeck(): Card[] {
	const cards: Card[] = [];
	for (const spec of CARD_SPECS) {
		for (let i = 1; i <= spec.count; i++) {
			cards.push({
				id: `${spec.letter}#${i}`,
				letter: spec.letter,
				points: spec.points,
			});
		}
	}
	return cards;
}

/** Fisher-Yates, in place, returns the same array for convenience. */
export function shuffle<T>(cards: T[]): T[] {
	for (let i = cards.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[cards[i], cards[j]] = [cards[j], cards[i]];
	}
	return cards;
}

export function totalPoints(cards: Card[]): number {
	return cards.reduce((n, c) => n + c.points, 0);
}

/** The word a run of cards spells, lowercased. Two-letter cards contribute both letters. */
export function cardsToWord(cards: Card[]): string {
	return cards
		.map((c) => c.letter)
		.join("")
		.toLowerCase();
}
