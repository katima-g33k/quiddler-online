import React, { useEffect } from "react";
import classNames from "classnames";
import Button from "@/components/Button";
import GameOptions from "@/components/GameOptions";
import H2 from "@/components/H2";
import { useGame } from "@/contexts/GameContext";
import type { Card } from "@/types";

type WaitingRoomProps = {
  className?: string;
};

const WaitingRoom = ({ className }: WaitingRoomProps) => {
  const { gameOptions, players, setCurrentPlayer, setDeckSize, setDiscardPile, setHand, setRound, socket } = useGame();
  const canStartGame = players.length > 1 && (gameOptions.longestWordBonus || gameOptions.mostWordsBonus);

  const handleStartGame = () => {
    if (canStartGame) {
      socket.emit("start-game");
    }
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
      <GameOptions />
      <Button disabled={!canStartGame} label="Start game" onClick={handleStartGame} />
    </div>
  );
};

export default WaitingRoom;
