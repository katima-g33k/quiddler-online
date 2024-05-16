import React from "react";
import GameRoom from "@/components/GameRoom";
import Lobby from "@/components/Lobby";
import { useGame } from "@/contexts/GameContext";

const Layout = () => {
  const { round } = useGame();

  return (
    <main>
      {!round ? <Lobby /> : <GameRoom />}
    </main>
  );
};

export default Layout;
