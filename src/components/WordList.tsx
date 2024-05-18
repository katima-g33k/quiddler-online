import React from "react";
import H2 from "@/components/H2";
import Word from "@/app/Word";
import { useGame } from "@/contexts/GameContext";

const WordList = () => {
  const { id, players, words } = useGame();
  const you = players.find(player => player.id === id);
  const score = words.reduce((points, word) => points + word.points, 0) + (you?.score || 0);

  return (
    <div>
      <H2>Your words ({score} pts)</H2>
      <ul className="flex flex-col gap-1">
        {words.map((word, index) => (
          <Word key={`${word.word}${index}`} deletable index={index} word={word}  />
        ))}
      </ul>
    </div>
  );
};

export default WordList;
