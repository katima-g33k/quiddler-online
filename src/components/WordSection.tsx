import React from "react";
import H2 from "@/components/H2";
import Word from "@/components/Word";
import { Card, Word as TWord } from "@/types";

type WordSectionProps = {
  deletable?: boolean;
  name: string;
  remainingCards: Card[],
  score: number;
  words: TWord[];
};

export const WordSection = ({ deletable, name, remainingCards, score, words }: WordSectionProps) => {
  const remainingCardsStr = remainingCards.map(({ char, points }) => `${char} (${points})`).join(", ");

  return (
    <div className="flex flex-col p-2 gap-2 flex-1 min-h-48 overflow-y-auto">
      <H2 className="capitalize font-semibold">{name} ({score} pts)</H2>
      <ul className="flex flex-col gap-1">
        {words.map((word, index) => (
          <Word key={`${word.word}${index}`} deletable={deletable} index={index} word={word}/>
        ))}
        {remainingCards.length > 0 && (
          <li>Remaining cards : {remainingCardsStr}</li>
        )}
      </ul>
    </div>
  );
};
