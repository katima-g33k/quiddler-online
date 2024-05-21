export type Card = {
  char: string;
  count: number;
  id: string;
  points: number;
};

export type Word = {
  cards: Card[];
  points: number;
  word: string;
};

export type Player = {
  id: string;
  name: string;
  remainingCards: Card[],
  score: number;
  words: Word[];
};
