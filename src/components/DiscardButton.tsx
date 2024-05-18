import React from "react";
import Button from "@/components/Button";
import { useGame } from "@/contexts/GameContext";

const DiscardButton = () => {
  const { canDiscard, selectedCards, setDiscarded, setHand, setSelectedCards } = useGame();

  const handleDiscard = () => {
    if (canDiscard) {
      setHand(hand => hand?.filter(c => c !== selectedCards[0]));
      setDiscarded(selectedCards[0]);
      setSelectedCards([]);
    }
  };

  return (
    <Button disabled={!canDiscard} label="Discard" onClick={handleDiscard} />
  );
};

export default DiscardButton;
