import React, { useEffect, useState } from "react";
import Deck from "@/components/Deck";
import DiscardButton from "@/components/DiscardButton";
import DiscardPile from "@/components/DiscardPile";
import EndTurnButton from "@/components/EndTurnButton";
import H1 from "@/components/H1";
import H2 from "@/components/H2";
import Hand from "@/components/Hand";
import PlayWordButton from "@/components/PlayWordButton";
import GameEndModal from "@/components/GameEndModal";
import WordList from "@/components/WordList";
import { useGame } from "@/contexts/GameContext";
import { Bonuses, Card, Player } from "@/types";
import RoundEndModal from "@/components/RoundEndModal";

const GameRoom = () => {
  const { currentPlayer, id, players, round, setBonuses, setCurrentPlayer, setDeckSize, setDiscardPile, setHand, setPlayers, setRound, socket } = useGame();
  const currentPlayerName = players.find(player => player.id === currentPlayer)?.name;
  const [showRoundEndModal, setShowRoundEndModal] = useState(false);
  const [showGameEndModal, setShowGameEndModal] = useState(false);

  useEffect(() => {
    const startTurn = ({ currentPlayer }: { currentPlayer: string }) => {
      setCurrentPlayer(currentPlayer);
    };

    const endRound = ({ bonuses, players }: { bonuses: Bonuses, players: Player[] }) => {
      setBonuses(bonuses);
      setPlayers(players);
      setShowRoundEndModal(true);
    };

    const startRound = ({ currentPlayer, deckSize, discardPile, hand, players, round }: { currentPlayer: string; deckSize: number; discardPile: Card[]; hand: Card[]; players: Player[]; round: number }) => {
      setBonuses(undefined);
      setCurrentPlayer(currentPlayer);
      setDeckSize(deckSize);
      setDiscardPile(discardPile);
      setHand(hand);
      setPlayers(players);
      setRound(round);
      setShowRoundEndModal(false);
    };

    const endGame = ({ bonuses, players }: { bonuses: Bonuses, players: Player[] }) => {
      setBonuses(bonuses);
      setPlayers(players);
      setShowGameEndModal(true);
    };

    socket.on("start-turn", startTurn);
    socket.on("end-round", endRound);
    socket.on("start-round", startRound);
    socket.on("end-game", endGame);

    return () => {
      socket.off("start-turn", startTurn);
      socket.off("end-round", endRound);
      socket.off("start-round", startRound);
      socket.off("end-game", endGame);
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
      {showRoundEndModal && <RoundEndModal open />}
      {showGameEndModal && <GameEndModal open />}
    </>
  );
};

export default GameRoom;
