import React, { useEffect } from "react";
import Card from "@/components/Card";
import { useGame } from "@/contexts/GameContext";

const Deck = () => {
  const { canDraw, id, setDeckSize, setHand, setHasDrawn, socket } = useGame();

  useEffect(() => {
    const draw = ({ card, deckSize }: { card: Card, deckSize: number }) => {
      if (card) {
        setHand((hand = []) => [...hand, card]);
      }

      setDeckSize(deckSize);
    };

    socket.on("draw", draw);

    return () => {
      socket.off("draw", draw);
    };
  }, []);

  const handleDraw = () => {
    if (canDraw) {
      socket.emit("draw", id);
      setHasDrawn(true);
    }
  };

  return (
    <Card disabled={!canDraw} onClick={handleDraw} />
  );
};

export default Deck;
