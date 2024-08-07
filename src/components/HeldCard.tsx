import React, { MouseEvent } from "react";
import { DragIndicator } from "@mui/icons-material";
import Card from "@/components/Card";
import { SortableListItem } from "@/components/Sortable";
import { useGame } from "@/contexts/GameContext";
import type { Card as TCard } from "@/types";

type HeldCardProps = {
  card: TCard;
}

const Anchor = (props: any) => (
  <button className="absolute z-10 top-0 right-0 p-1 cursor-grab" {...props}>
    <DragIndicator />
  </button>
);

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
    <SortableListItem anchor={Anchor} className="relative" id={card.id}>
      <Card
        card={card}
        disabled={!canPlay}
        index={selectedIndex}
        onClick={handleSelectCard}
        type="checkbox"
      />
    </SortableListItem>
  );
};

export default HeldCard;
