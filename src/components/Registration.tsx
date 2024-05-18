import React, { FormEvent, useEffect, useState } from "react";
import classNames from "classnames";
import Button from "@/components/Button";
import H2 from "@/components/H2";
import { useGame } from "@/contexts/GameContext";
import type { Player } from "@/types";

type RegistrationProps = {
  className?: string;
}

const MIN_LENGTH = 3;

const Registration = ({ className }: RegistrationProps) => {
  const [name, setName] = useState("");
  const { id, setPlayers, socket } = useGame();

  useEffect(() => {
    const playerEntered = (players: Player[]) => {
      setPlayers(players);
    };

    socket.on("player-entered", playerEntered);

    return () => {
      socket.off("player-entered", playerEntered);
    };
  }, [setPlayers, socket]);

  const handleOnSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (name.length >= MIN_LENGTH) {
      socket.emit("player-entered", { id, name });
    }
  };

  return (
    <div className={classNames(className, "flex flex-1 flex-col gap-8 items-center")}>
      <H2>Please enter your name to begin</H2>
      <form className="flex flex-col gap-4 items-center" onSubmit={handleOnSubmit}>
        <input className="px-2 py-3" name="name" onChange={e => setName(e.target.value)} placeholder="Name" value={name} />
        <Button disabled={name.length < MIN_LENGTH} label="Enter" type="submit"/>
      </form>
    </div>
  );
};

export default Registration;
