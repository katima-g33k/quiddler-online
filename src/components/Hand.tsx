import React from "react";
import HeldCard from "@/components/HeldCard";
import { useGame } from "@/contexts/GameContext";
import type { Card } from "@/types";

const Hand = () => {
  const { hand, setHand } = useGame();

  const handleMoveRight = (card: Card) => {
    setHand((hand) => {
      const index = hand.findIndex((c) => c.id === card.id);

      return hand.map((c, i, cards) => {
        if (i === index) {
          return cards[i + 1];
        }

        if (i === index + 1) {
          return card;
        }

        return c;
      });
    });
  };

  const handleMoveLeft = (card: Card) => {
    setHand((hand) => {
      const index = hand.findIndex((c) => c.id === card.id);

      return hand.map((c, i, cards) => {
        if (i === index) {
          return cards[i - 1];
        }

        if (i === index - 1) {
          return card;
        }

        return c;
      });
    });
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {hand.map(card => <HeldCard key={card.id} card={card} onMoveLeft={handleMoveLeft} onMoveRight={handleMoveRight} />)}
    </div>
  );
};

export default Hand;
