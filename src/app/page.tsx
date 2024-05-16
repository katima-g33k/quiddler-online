"use client"
import { GameProvider } from "@/contexts/GameContext";
import Layout from "@/components/Layout";

export default function App() {
  return (
    <GameProvider>
      <Layout />
    </GameProvider>
  );
}
