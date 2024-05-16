import { useEffect } from "react";
import { useGame } from "@/contexts/GameContext";

import type { Card } from "@/types";

const WaitingRoom = () => {
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
    <>
      <div>
        {players.map(({ id, name }) => <p key={id}>{name}</p>)}
      </div>
      {players.length > 1 && <button onClick={handleStartGame}>Start game</button>}
    </>
  );
};

export default WaitingRoom;
