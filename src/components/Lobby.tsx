import React from "react";
import Registration from "@/components/Registration";
import WaitingRoom from "@/components/WaitingRoom";
import { useGame } from "@/contexts/GameContext";

const Lobby = () => {
  const { connected } = useGame();

  return (
    <>
      <div className={connected ? "hidden" : ""}>
        <Registration />
      </div>
      <div className={!connected ? "hidden" : ""}>
        <WaitingRoom />
      </div>
    </>
  );
};

export default Lobby;
