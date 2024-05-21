import React from "react";
import { WordSection } from "@/components/WordSection";
import { useGame } from "@/contexts/GameContext";

const WordList = () => {
  const { id, players, words } = useGame();
  const you = players.find(player => player.id === id);
  const otherPlayers = players.filter(player => player.id !== id);

  return (
    <div>
      <WordSection deletable name="Your words" remainingCards={you?.remainingCards || []} score={you?.score || 0} words={words} />
      {otherPlayers.map(({ id, name, remainingCards, score, words }) => (
        <WordSection key={id} name={name} remainingCards={remainingCards} score={score} words={words} />
      ))}
    </div>
  );
};

export default WordList;
