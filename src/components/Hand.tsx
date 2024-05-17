import React from "react";
import HeldCard from "@/components/HeldCard";
import { useGame } from "@/contexts/GameContext";

const Hand = () => {
  const { hand } = useGame();

  return (
    <div className="flex gap-2">
      {hand.map((card, index) => <HeldCard key={index} card={card} />)}
    </div>
  );
};

export default Hand;
