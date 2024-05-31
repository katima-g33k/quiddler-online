export type LongestWord = {
  player: Player;
  word: string;
};

export type MostWords = {
  count: number;
  player: Player;
}

export type Bonuses = {
 longestWord?: LongestWord[];
 mostWords?: MostWords[];
}

export type BonusOptions = {
  useLongestWordBonus?: boolean,
  useMostWordsBonus?: boolean;
}

export type Card = {
  char: string;
  count: number;
  id: string;
  points: number;
};

export type GameOptions = {
  longestWordBonus: boolean;
  mostWordsBonus: boolean;
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
