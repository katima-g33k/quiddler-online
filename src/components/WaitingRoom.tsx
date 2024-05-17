import React, { useEffect } from "react";
import classNames from "classnames";
import Button from "@/components/Button";
import H2 from "@/components/H2";
import { useGame } from "@/contexts/GameContext";
import type { Card } from "@/types";

type WaitingRoomProps = {
  className?: string;
};

const WaitingRoom = ({ className }: WaitingRoomProps) => {
  const { players, setCurrentPlayer, setDeckSize, setDiscardPile, setHand, setRound, socket } = useGame();

  const handleStartGame = () => {
    socket.emit("start-game");
  };

  useEffect(() => {
    const startGame = ({ hand, currentPlayer, deckSize, discardPile }: { hand: Card[], currentPlayer: string, round: number, deckSize: number, discardPile: Card[]}) => {
      setCurrentPlayer(currentPlayer);
      setDeckSize(deckSize);
      setHand(hand);
      setDiscardPile(discardPile);
      setRound(round => round + 1);
    };

    socket.on("start-game", startGame);

    return () => {
      socket.off("start-game", startGame);
    };
  }, [setCurrentPlayer, setDeckSize, setDiscardPile, setHand, setRound, socket]);

  return (
    <div className={classNames(className, "flex flex-1 flex-col gap-4 items-center")}>
      <H2>Waiting for other players...</H2>
      <ol className="list-decimal">
        {players.map(({ id, name }) => <li className="capitalize" key={id}>{name}</li>)}
      </ol>
      <Button disabled={players.length < 2} label="Start game" onClick={handleStartGame} />
    </div>
  );
};

export default WaitingRoom;
