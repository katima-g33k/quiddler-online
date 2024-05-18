import React from "react";
import HeldCard from "@/components/HeldCard";
import { useGame } from "@/contexts/GameContext";

const Hand = () => {
  const { hand } = useGame();

  return (
    <div className="flex gap-2">
      {hand.map(card => <HeldCard key={card.id} card={card} />)}
    </div>
  );
};

export default Hand;
