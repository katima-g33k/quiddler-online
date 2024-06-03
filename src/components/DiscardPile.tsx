import React, { useEffect } from "react";
import { Undo } from "@mui/icons-material";
import Card from "@/components/Card";
import { useGame } from "@/contexts/GameContext";

const DiscardPile = () => {
  const { canDraw, discarded, discardPile, setDiscarded, setDiscardPile, setHand, setHasDrawn, socket } = useGame();

  const handlePickFromDiscard = () => {
    if (canDraw) {
      socket.emit("pick-from-discard");

      setHasDrawn(true);
      setHand((hand = []) => [...hand, discardPile[discardPile.length - 1]]);
      setDiscardPile(discardPile => discardPile.slice(0, discardPile.length - 1));
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
      setDiscardPile(discardPile => discardPile.slice(0, discardPile.length - 1));
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
          className="flex opacity-0 hover:opacity-80 rounded justify-center items-center absolute bg-red-300 top-0 bottom-0 left-0 right-0"
          onClick={handleUndoDiscard}
        >
          <Undo className="text-red-900" fontSize="large" />
        </button>
      )}
    </div>
  );
};

export default DiscardPile;
