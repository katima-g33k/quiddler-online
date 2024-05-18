import React from "react";
import { Trash2 } from "react-feather";
import { useGame } from "@/contexts/GameContext";
import type { Word as TWord } from "@/types";

type WordProps = {
  deletable?: boolean;
  index?: number;
  word: TWord,
};

const Word = ({ deletable, index, word }: WordProps) => {
  const { canPlay, setHand, setPlayedCards } = useGame();

  const handleRemoveWord = () => {
    setHand(hand => [...hand, ...word.cards]);
    setPlayedCards(playedCards => playedCards.filter((_, i) => i !== index));
  };

  return (
    <li className="flex items-center uppercase bg-gray-400 justify-between p-2 rounded-md">
      <span>{word.word} ({word.points} pts)</span>
      {deletable && canPlay && (
        <button onClick={handleRemoveWord}>
          <Trash2 className="text-red-700" size={16} />
        </button>
      )}
    </li>
  );
};

export default Word;
