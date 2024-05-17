import React from "react";
import Card from "@/components/Card";
import { useGame } from "@/contexts/GameContext";
import type { Card as TCard } from "@/types";

type HeldCardProps = {
  card: TCard;
}

const HeldCard = ({ card }: HeldCardProps) => {
  const { canDiscard, setDiscarded, setHand } = useGame();

  const handleDiscard = () => {
    if (canDiscard) {
      setHand(hand => hand?.filter(c => c !== card));
      setDiscarded(card);
    }
  };

  return (
    <Card
      card={card}
      disabled={!canDiscard}
      onClick={handleDiscard}
      type="checkbox"
    >
      {card.char}
    </Card>
  );
};

export default HeldCard;
