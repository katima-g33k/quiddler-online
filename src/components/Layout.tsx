import React from "react";
import GameRoom from "@/components/GameRoom";
import Lobby from "@/components/Lobby";
import { useGame } from "@/contexts/GameContext";

const Layout = () => {
  const { round } = useGame();

  return !round ? <Lobby /> : <GameRoom />;
};

export default Layout;
