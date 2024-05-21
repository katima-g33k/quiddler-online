import React, { MouseEvent } from "react";
import Card from "@/components/Card";
import { useGame } from "@/contexts/GameContext";
import type { Card as TCard } from "@/types";

type HeldCardProps = {
  card: TCard;
}

const HeldCard = ({ card }: HeldCardProps) => {
  const { canPlay, selectedCards, setSelectedCards } = useGame();
  const selectedIndex = selectedCards.findIndex(c => c.id === card.id) + 1 || undefined;

  const handleSelectCard = (event: MouseEvent<HTMLInputElement>) => {
    // @ts-ignore
    const checked = event.target.checked;

    if (checked) {
      setSelectedCards(selectedCards => [...selectedCards, card]);
    } else {
      setSelectedCards(selectedCards => selectedCards.filter(c => c.id !== card.id));
    }
  };

  return (
    <Card
      card={card}
      disabled={!canPlay}
      index={selectedIndex}
      onClick={handleSelectCard}
      type="checkbox"
    />
  );
};

export default HeldCard;
