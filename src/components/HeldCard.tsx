import React, { MouseEvent, useState } from "react";
import { ArrowLeft, ArrowRight } from "react-feather";
import Card from "@/components/Card";
import { useGame } from "@/contexts/GameContext";
import type { Card as TCard } from "@/types";

type HeldCardProps = {
  card: TCard;
  onMoveLeft: (card: Card) => void;
  onMoveRight: (card: Card) => void;
}

const HeldCard = ({ card, onMoveLeft, onMoveRight }: HeldCardProps) => {
  const [hover, setHover] = useState(false);
  const { canPlay, hand, selectedCards, setSelectedCards } = useGame();
  const selectedIndex = selectedCards.findIndex(c => c.id === card.id) + 1 || undefined;
  const index = hand.findIndex((c) => c.id === card.id);
  const isFirst = index === 0;
  const isLast = index === hand.length - 1;

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
    <div
      className="flex items-center relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {hover && !isFirst && (
        <button className="absolute z-10 -left-1" onClick={() => onMoveLeft(card)}>
          <ArrowLeft />
        </button>
      )}
      <Card
        card={card}
        disabled={!canPlay}
        index={selectedIndex}
        onClick={handleSelectCard}
        type="checkbox"
      />
      {hover && !isLast && (
        <button className="absolute z-10 -right-1" onClick={() => onMoveRight(card)}>
          <ArrowRight />
        </button>
      )}
    </div>
  );
};

export default HeldCard;
