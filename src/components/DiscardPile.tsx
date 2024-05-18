import React, { useEffect } from "react";
import { Slash } from "react-feather";
import Card from "@/components/Card";
import { useGame } from "@/contexts/GameContext";

const DiscardPile = () => {
  const { canDraw, discarded, discardPile, setDiscarded, setDiscardPile, setHand, setHasDrawn, socket } = useGame();

  const handlePickFromDiscard = () => {
    if (canDraw) {
      const card = discardPile[discardPile.length - 1];

      socket.emit("pick-from-discard");

      setHasDrawn(true);
      setHand((hand = []) => [...hand, card]);
      setDiscardPile(discardPile => discardPile.filter(c => c !== card));
    }
  };

  const handleUndoDiscard = () => {
    if (discarded) {
      setHand((hand = []) => [...hand, discarded]);
      setDiscarded(undefined);
    }
  };

  useEffect(() => {
    const pickFromDiscard = () => {
      const card = discardPile[discardPile.length - 1];
      setDiscardPile(discardPile => discardPile.filter(c => c !== card));
    };

    socket.on("pick-from-discard", pickFromDiscard);

    return () => {
      socket.off("pick-from-discard", pickFromDiscard);
    };
  }, []);

  return (discarded || discardPile.length > 0) && (
    <div className="relative">
      <Card card={discarded || discardPile[discardPile.length - 1]} disabled={!canDraw} onClick={handlePickFromDiscard} />
      {!!discarded && (
        <button
          className="flex opacity-0 hover:opacity-70 rounded justify-center items-center absolute bg-red-400 top-0 bottom-0 left-0 right-0"
          onClick={handleUndoDiscard}
        >
          <Slash className="text-red-900" size={64} />
        </button>
      )}
    </div>
  );
};

export default DiscardPile;
