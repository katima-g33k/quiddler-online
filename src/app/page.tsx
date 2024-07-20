"use client";
import React, { useEffect } from "react";
import { GameProvider } from "@/contexts/GameContext";
import Layout from "@/components/Layout";

export default function App() {
  useEffect(() => {
    window.onbeforeunload = () => true;

    return () => {
      window.onbeforeunload = null;
    };
  }, []);

  return (
    <GameProvider>
      <Layout />
    </GameProvider>
  );
}
