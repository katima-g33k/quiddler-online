import React from "react";
import HeldCard from "@/components/HeldCard";
import { SortableList } from "@/components/Sortable";
import { useGame } from "@/contexts/GameContext";

const Hand = () => {
  const { hand, setHand } = useGame();

  return (
    <div className="flex gap-2 flex-wrap">
      <SortableList
        items={hand}
        renderFn={card => <HeldCard key={card.id} card={card} />}
        setItems={setHand}
      />
    </div>
  );
};

export default Hand;
