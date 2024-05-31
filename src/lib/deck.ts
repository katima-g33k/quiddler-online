import { DECK } from "../constants/index.ts";

function shuffleArray<T>(array: T[], repeats = 0): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return repeats ? shuffleArray(array, repeats - 1) : array;
}

export const initDeck = () => shuffleArray(DECK.map(card => card), 2);
