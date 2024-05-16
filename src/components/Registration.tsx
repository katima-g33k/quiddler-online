import React, { FormEvent, useEffect } from "react";
import { useGame } from "@/contexts/GameContext";
import { Player } from "@/types";

const Registration = () => {
  const { id, setPlayers, socket } = useGame();

  useEffect(() => {
    const playerEntered = (player: Player) => {
      setPlayers((players) => [...players, player]);
    };

    socket.on("player-entered", playerEntered);

    return () => {
      socket.off("player-entered", playerEntered);
    };
  }, [setPlayers, socket]);

  const handleOnEnter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // @ts-ignore
    const name = event.target.name.value;
    const player = { id, name, score: 0 };

    socket.emit("player-entered", player);
    setPlayers((players) => [...players, player]);
  };

  return (
    <form onSubmit={handleOnEnter}>
      <input name="name"/>
      <button type="submit">Enter</button>
    </form>
  );
};

export default Registration;
