import React from "react";
import { Delete } from "@mui/icons-material";
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
    <li className="flex items-center uppercase bg-gray-100 justify-between p-2 rounded-md">
      <span>{word.word} ({word.points} pts)</span>
      {deletable && canPlay && (
        <button onClick={handleRemoveWord}>
          <Delete className="text-red-500" />
        </button>
      )}
    </li>
  );
};

export default Word;
