import { Card } from "@/types";
import { deck as deckInfo } from "@/data/deck";

export function shuffleArray<T>(array: T[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export const initDeck = (): Card[] => {
  const deck: Card[] = [];

  deckInfo.forEach((card) => {
    for (let i = 0; i < card.count; i++) {
      deck.push(card);
    }
  });

  shuffleArray(deck);

  return deck;
};
