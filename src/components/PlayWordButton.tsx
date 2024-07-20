import React, { useState } from "react";
import Button from "@/components/Button";
import { useDictionary } from "@/hooks/useDictionary";
import { useGame } from "@/contexts/GameContext";
import ErroneousWordModal from "@/components/ErroneousWordModal";

const PlayWordButton = () => {
  const [erroneousWord, setErroneousWord] = useState<string>();
  const { searchDictionary } = useDictionary();
  const { selectedCards, setHand, setPlayedCards, setSelectedCards } = useGame();
  const canPlayWord = selectedCards.length > 1;

  const playWord = () => {
    setHand(hand => hand.filter(card => !selectedCards.includes(card)));
    setPlayedCards(playedCards => [...playedCards, selectedCards]);
    setSelectedCards([]);
  };

  const validateWord = async () => {
    const word = selectedCards.reduce((acc, card) => `${acc}${card.char}`, "");

    if (await searchDictionary(word)) {
      playWord();
    } else {
      setErroneousWord(word);
    }
  };

  const handleOnAdd = () => {
    setErroneousWord(undefined);
    playWord();
  };

  const handlePlayWord = () => canPlayWord && validateWord();

  return (
    <>
      <Button disabled={!canPlayWord} label="Play word" onClick={handlePlayWord} />
      <ErroneousWordModal
        onAdd={handleOnAdd}
        onConfirm={() => setErroneousWord(undefined)}
        word={erroneousWord}
      />
    </>
  );
};

export default PlayWordButton;
