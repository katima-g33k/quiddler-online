import React, { useEffect } from "react";
import Checkbox from "@/components/Checkbox";
import { useGame } from "@/contexts/GameContext";
import type { GameOptions as TGameOptions } from "@/types";

const GameOptions = () => {
  const { gameOptions, setGameOptions, socket } = useGame();

  const handleOnOptionsChange = (gameOptions: TGameOptions) => {
    socket.emit("update-options", gameOptions);
    setGameOptions(gameOptions);
  };

  const handleOnLongestWordBonusChange = (checked: boolean) => {
    handleOnOptionsChange({
      ...gameOptions,
      longestWordBonus: checked,
    });
  };

  const handleOnMostWordsBonusChange = (checked: boolean) => {
    handleOnOptionsChange({
      ...gameOptions,
      mostWordsBonus: checked,
    });
  };

  useEffect(() => {
    const updateOptions = (gameOptions: TGameOptions) => {
      setGameOptions(gameOptions);
    };

    socket.on("update-options", updateOptions);

    return () => {
      socket.off("update-options", updateOptions);
    };
  }, []);

  return (
    <form className="flex flex-col">
      <Checkbox checked={gameOptions.longestWordBonus} label="Activate longest word bonus" onChange={handleOnLongestWordBonusChange} />
      <Checkbox checked={gameOptions.mostWordsBonus} label="Activate most words bonus" onChange={handleOnMostWordsBonusChange} />
    </form>
  );
};

export default GameOptions;
