import React from "react";
import Button from "@/components/Button";
import { useGame } from "@/contexts/GameContext";

const PlayWordButton = () => {
  const { selectedCards, setHand, setPlayedCards, setSelectedCards } = useGame();
  const canPlayWord = selectedCards.length > 1;

  const handlePlayWord = () => {
    if (canPlayWord) {
      setHand(hand => hand.filter(card => !selectedCards.includes(card)));
      setPlayedCards(playedCards => [...playedCards, selectedCards]);
      setSelectedCards([]);
    }
  };

  return (
    <Button disabled={!canPlayWord} label="Play word" onClick={handlePlayWord} />
  );
};

export default PlayWordButton;
