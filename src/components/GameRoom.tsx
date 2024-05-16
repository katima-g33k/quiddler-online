"use client";
import React, { useEffect, useState } from "react";
import type { Card } from "@/types";
import { useGame } from "@/contexts/GameContext";

const GameRoom = () => {
  const { currentPlayer, deckSize, discardPile, hand, id, setCurrentPlayer, setDeckSize, setDiscardPile, setHand, socket } = useGame();

  const [hasDrawn, setHasDrawn] = useState(false);
  const [discarded, setDiscarded] = useState<Card>();

  const isMyTurn = id === currentPlayer;

  useEffect(() => {
    const draw = ({ card, deckSize }: { card: Card, deckSize: number }) => {
      if (card) {
        setHand((hand = []) => [...hand, card]);
      }

      setDeckSize(deckSize);
    };

    const pickFromDiscard = () => {
      const card = discardPile[discardPile.length - 1];

      setDiscardPile(discardPile => discardPile.filter(c => c !== card));
    };

    const startTurn = ({ currentPlayer }: { currentPlayer: string }) => {
      setCurrentPlayer(currentPlayer);
    };

    const endTurn = ({ discarded }: { discarded: Card }) => {
      setDiscardPile(discardPile => [...discardPile, discarded]);
    };

    socket.on("draw", draw);
    socket.on("pick-from-discard", pickFromDiscard);
    socket.on("start-turn", startTurn);
    socket.on("end-turn", endTurn);

    return () => {
      socket.off("draw", draw);
      socket.off("pick-from-discard", pickFromDiscard);
      socket.off("start-turn", startTurn);
      socket.off("end-turn", endTurn);
    };
  }, [discardPile, setCurrentPlayer, setDeckSize, setDiscardPile, setHand, socket]);

  const handleDraw = () => {
    socket.emit("draw", id);
    setHasDrawn(true);
  };

  const handlePickFromDiscard = () => {
    if (!hasDrawn && discardPile.length) {
      const card = discardPile[discardPile.length - 1];

      socket.emit("pick-from-discard");

      setHasDrawn(true);
      setHand((hand = []) => [...hand, card]);
      setDiscardPile(discardPile => discardPile.filter(c => c !== card));
    }
  };

  const handleDiscard = (card: Card) => {
    if (hasDrawn && !discarded) {
      setHand(hand => hand?.filter(c => c !== card));
      setDiscarded(card);
    }
  };

  const handleUndoDiscard = () => {
    if (discarded) {
      setHand((hand = []) => [...hand, discarded]);
      setDiscarded(undefined);
    }
  };

  const handleEndTurn = () => {
    if (discarded) {
      socket.emit("end-turn", { discarded, id });
      setCurrentPlayer("");
      setDiscardPile(discardPile => [...discardPile, discarded]);
      setDiscarded(undefined);
      setHasDrawn(false);
    }
  };

  return (
    <>
      <div>
        <div>Deck has {deckSize} cards</div>
        {(discarded || discardPile.length) && (
          <div onClick={handlePickFromDiscard} className="text-xl p-4">
            {discarded?.char || discardPile[discardPile.length - 1]?.char}
          </div>
        )}
        {discarded && (
          <div>
            <button onClick={handleUndoDiscard}>Undo discard</button>
            <button onClick={handleEndTurn}>End turn</button>
          </div>
        )}
        {isMyTurn && !hasDrawn && <button onClick={handleDraw}>Draw</button>}
      </div>
      <div className="flex gap-2">
        {hand.map((card, index) => (
          <div onClick={() => handleDiscard(card)} className="text-xl p-4" key={index}>{card.char}</div>
        ))}
      </div>
    </>
  );
};

export default GameRoom;
