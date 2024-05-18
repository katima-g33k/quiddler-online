"use client";
import React, { useEffect } from "react";
import PlayWordButton from "@/components/PlayWordButton";
import Deck from "@/components/Deck";
import DiscardButton from "@/components/DiscardButton";
import DiscardPile from "@/components/DiscardPile";
import EndTurnButton from "@/components/EndTurnButton";
import H1 from "@/components/H1";
import H2 from "@/components/H2";
import Hand from "@/components/Hand";
import { useGame } from "@/contexts/GameContext";
import WordList from "@/components/WordList";

const GameRoom = () => {
  const { currentPlayer, id, players, round, setCurrentPlayer, socket } = useGame();
  const currentPlayerName = players.find(player => player.id === currentPlayer)?.name;

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
    <>
      <WordList />
      <div className="flex flex-1 flex-col justify-center items-center gap-16">
        <div className="flex flex-col items-center">
          <H1>
            {id === currentPlayer
              ? "Your turn!"
              : <span className="capitalize">{`${currentPlayerName}'s turn`}</span>}
          </H1>
          <H2>Round {round}</H2>
        </div>
        <div className="flex gap-8">
          <Deck />
          <DiscardPile />
        </div>
        <Hand />
        <div className="flex gap-4">
          <PlayWordButton />
          <DiscardButton />
          <EndTurnButton />
        </div>
      </div>
    </>
  );
};

export default GameRoom;
