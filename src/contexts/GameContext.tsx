import React, {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import type { Socket } from "socket.io-client";
import { socket } from "@/lib/socket";
import type { Card, Player } from "@/types";

type GameContext = {
  canDiscard: boolean;
  canDraw: boolean;
  connected: boolean;
  currentPlayer: string;
  deckSize: number;
  discarded?: Card;
  discardPile: Card[];
  hand: Card[],
  hasDrawn: boolean;
  id: string;
  players: Player[];
  round: number;
  setCurrentPlayer: Dispatch<SetStateAction<string>>;
  setDeckSize: Dispatch<SetStateAction<number>>;
  setDiscarded: Dispatch<SetStateAction<Card | undefined>>;
  setDiscardPile: Dispatch<SetStateAction<Card[]>>;
  setHand: Dispatch<SetStateAction<Card[]>>;
  setHasDrawn: Dispatch<SetStateAction<boolean>>;
  setPlayers: Dispatch<SetStateAction<Player[]>>;
  setRound: Dispatch<SetStateAction<number>>;
  socket: Socket;
};

const GameContext = createContext<GameContext>({
  canDiscard: false,
  canDraw: false,
  connected: false,
  currentPlayer: "",
  deckSize: 0,
  discarded: undefined,
  discardPile: [],
  hand: [],
  hasDrawn: false,
  id: "",
  players: [],
  round: 0,
  setCurrentPlayer: () => undefined,
  setDeckSize: () => undefined,
  setDiscarded: () => undefined,
  setDiscardPile: () => undefined,
  setHand: () => undefined,
  setHasDrawn: () => undefined,
  setPlayers: () => undefined,
  setRound: () => undefined,
  socket,
});

export const GameProvider = ({ children }: PropsWithChildren) => {
  const id = useMemo(() => crypto.randomUUID(), []);
  const [discarded, setDiscarded] = useState<Card>();
  const [players, setPlayers] = useState<Player[]>([]);
  const [hand, setHand] = useState<Card[]>([]);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [round, setRound] = useState<number>(0);
  const [deckSize, setDeckSize] = useState<number>(0);
  const [currentPlayer, setCurrentPlayer] = useState<string>("");
  const [discardPile, setDiscardPile] = useState<Card[]>([]);

  const canDiscard = hasDrawn && !discarded;
  const canDraw = id === currentPlayer && !hasDrawn;
  const connected = players.some(player => player.id === id);

  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  const context: GameContext = {
    canDiscard,
    canDraw,
    connected,
    currentPlayer,
    deckSize,
    discarded,
    discardPile,
    hand,
    hasDrawn,
    id,
    players,
    round,
    setCurrentPlayer,
    setDeckSize,
    setDiscarded,
    setDiscardPile,
    setHand,
    setHasDrawn,
    setPlayers,
    setRound,
    socket
  };

  return (
    <GameContext.Provider value={context}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);
