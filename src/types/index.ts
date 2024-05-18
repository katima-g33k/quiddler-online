export type Card = {
  char: string;
  count: number;
  id: number;
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
  score: number;
  words: Word[];
};
