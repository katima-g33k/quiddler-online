import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { Socket } from "socket.io-client";
import { socket } from "@/lib/socket";
import {Card, Player} from "@/types";

type GameContext = {
  connected: boolean;
  currentPlayer: string;
  deckSize: number;
  discardPile: Card[];
  hand: Card[],
  id: string;
  players: Player[];
  round: number;
  setCurrentPlayer: Dispatch<SetStateAction<string>>;
  setDeckSize: Dispatch<SetStateAction<number>>;
  setDiscardPile: Dispatch<SetStateAction<Card[]>>;
  setHand: Dispatch<SetStateAction<Card[]>>;
  setPlayers: Dispatch<SetStateAction<Player[]>>;
  setRound: Dispatch<SetStateAction<number>>;
  socket: Socket;
};

const GameContext = createContext<GameContext>({
  connected: false,
  currentPlayer: "",
  deckSize: 0,
  discardPile: [],
  hand: [],
  id: "",
  players: [],
  round: 0,
  setCurrentPlayer: () => undefined,
  setDeckSize: () => undefined,
  setDiscardPile: () => undefined,
  setHand: () => undefined,
  setPlayers: () => undefined,
  setRound: () => undefined,
  socket,
});

export const GameProvider = ({ children }: PropsWithChildren) => {
  const id = useMemo(() => crypto.randomUUID(), []);
  const [players, setPlayers] = useState<Player[]>([]);
  const [hand, setHand] = useState<Card[]>([]);
  const [round, setRound] = useState<number>(0);
  const [deckSize, setDeckSize] = useState<number>(0);
  const [currentPlayer, setCurrentPlayer] = useState<string>("");
  const [discardPile, setDiscardPile] = useState<Card[]>([]);

  const connected = players.some(player => player.id === id);

  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    }
  }, []);

  const context: GameContext = {
    connected,
    currentPlayer,
    deckSize,
    discardPile,
    hand,
    id,
    players,
    round,
    setCurrentPlayer,
    setDeckSize,
    setDiscardPile,
    setHand,
    setPlayers,
    setRound,
    socket
  };

  return (
    <GameContext.Provider value={context}>
      {children}
    </GameContext.Provider>
  )
};

export const useGame = () => useContext(GameContext);
