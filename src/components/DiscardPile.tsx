import React, { useEffect } from "react";
import Card from "@/components/Card";
import { useGame } from "@/contexts/GameContext";
import Button from "@/components/Button";

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

  return (
    <>
      <Card card={discarded || discardPile[discardPile.length - 1]} disabled={!canDraw} onClick={handlePickFromDiscard} />
      <div>
        <Button disabled={discarded === undefined} label="Undo discard" onClick={handleUndoDiscard} />
      </div>
    </>
  );
};

export default DiscardPile;
