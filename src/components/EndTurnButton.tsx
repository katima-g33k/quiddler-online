import React, { useEffect } from "react";
import { useGame } from "@/contexts/GameContext";
import type { Card } from "@/types";
import Button from "@/components/Button";

const EndTurnButton = () => {
  const { discarded, id, setCurrentPlayer, setDiscardPile,setDiscarded, setHasDrawn, socket } = useGame();

  const handleEndTurn = () => {
    if (discarded) {
      socket.emit("end-turn", { discarded, id });
      setCurrentPlayer("");
      setDiscardPile(discardPile => [...discardPile, discarded]);
      setDiscarded(undefined);
      setHasDrawn(false);
    }
  };

  useEffect(() => {
    const endTurn = ({ discarded }: { discarded: Card }) => {
      setDiscardPile(discardPile => [...discardPile, discarded]);
    };

    socket.on("end-turn", endTurn);

    return () => {
      socket.off("end-turn", endTurn);
    };
  }, []);

  return (
    <Button disabled={!discarded} label="End turn" onClick={handleEndTurn} />
  );
};

export default EndTurnButton;
