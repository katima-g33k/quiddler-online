import React from "react";
import classNames from "classnames";
import H1 from "@/components/H1";
import Registration from "@/components/Registration";
import WaitingRoom from "@/components/WaitingRoom";
import { useGame } from "@/contexts/GameContext";

const Lobby = () => {
  const { connected } = useGame();

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col flex-[0.5] items-center justify-end">
        <H1>Welcome to Quiddler Online!</H1>
      </div>
      <Registration className={classNames({ hidden: connected })} />
      <WaitingRoom className={classNames({ hidden: !connected })} />
    </div>
  );
};

export default Lobby;
