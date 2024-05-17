"use client";
import React, { useEffect } from "react";
import Deck from "@/components/Deck";
import DiscardPile from "@/components/DiscardPile";
import EndTurnButton from "@/components/EndTurnButton";
import Hand from "@/components/Hand";
import { useGame } from "@/contexts/GameContext";

const GameRoom = () => {
  const { setCurrentPlayer, socket } = useGame();

  useEffect(() => {
    const startTurn = ({ currentPlayer }: { currentPlayer: string }) => {
      setCurrentPlayer(currentPlayer);
    };

    socket.on("start-turn", startTurn);

    return () => {
      socket.off("start-turn", startTurn);
    };
  }, []);

  return (
    <div className="flex flex-1 flex-col justify-center items-center gap-16">
      <div className="flex gap-8">
        <Deck />
        <DiscardPile />
      </div>
      <Hand />
      <div>
        <EndTurnButton />
      </div>
    </div>
  );
};

export default GameRoom;
