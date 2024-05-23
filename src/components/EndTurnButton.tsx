import React, { useEffect } from "react";
import Button from "@/components/Button";
import { useGame } from "@/contexts/GameContext";
import type { Card, Player } from "@/types";

const EndTurnButton = () => {
  const { canEndTurn, discarded, hand, id, setDiscardPile,setDiscarded, setHasDrawn, setPlayedCards, setPlayers, socket, words } = useGame();

  const handleEndTurn = () => {
    if (canEndTurn) {
      socket.emit("end-turn", id, { discarded, hand, words });

      if (words.length) {
        setPlayers(players => players.map(player => (
          player.id !== id ? player : {
            ...player,
            remainingCards: hand,
            words,
          }
        )));
      }

      setDiscardPile(discardPile => [...discardPile, discarded!]);
      setDiscarded(undefined);
      setHasDrawn(false);
      setPlayedCards([]);
    }
  };

  useEffect(() => {
    const endTurn = ({ discarded, players }: { discarded: Card, players: Player[] }) => {
      setDiscardPile(discardPile => [...discardPile, discarded]);
      setPlayers(players);
    };

    socket.on("end-turn", endTurn);

    return () => {
      socket.off("end-turn", endTurn);
    };
  }, []);

  return (
    <Button disabled={!canEndTurn} label="End turn" onClick={handleEndTurn} />
  );
};

export default EndTurnButton;
