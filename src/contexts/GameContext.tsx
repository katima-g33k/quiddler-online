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
import { v4 as uuid } from "uuid";
import { socket } from "@/lib/socket";
import type { Bonuses, Card, GameOptions, Player, Word } from "@/types";
import { useAudio } from "@/hooks/useAudio";

type GameContext = {
  bonuses?: Bonuses;
  canDiscard: boolean;
  canDraw: boolean;
  canEndTurn: boolean;
  canPlay: boolean;
  connected: boolean;
  currentPlayer: string;
  deckSize: number;
  discarded?: Card;
  discardPile: Card[];
  gameOptions: GameOptions;
  hand: Card[],
  hasDrawn: boolean;
  id: string;
  playedCards: Card[][];
  players: Player[];
  round: number;
  selectedCards: Card[];
  setBonuses: Dispatch<SetStateAction<Bonuses | undefined>>;
  setCurrentPlayer: Dispatch<SetStateAction<string>>;
  setDeckSize: Dispatch<SetStateAction<number>>;
  setDiscarded: Dispatch<SetStateAction<Card | undefined>>;
  setDiscardPile: Dispatch<SetStateAction<Card[]>>;
  setGameOptions: Dispatch<SetStateAction<GameOptions>>;
  setHand: Dispatch<SetStateAction<Card[]>>;
  setHasDrawn: Dispatch<SetStateAction<boolean>>;
  setPlayedCards: Dispatch<SetStateAction<Card[][]>>;
  setPlayers: Dispatch<SetStateAction<Player[]>>;
  setRound: Dispatch<SetStateAction<number>>;
  setSelectedCards: Dispatch<SetStateAction<Card[]>>;
  socket: Socket;
  words: Word[];
};

const defaultGameOptions = {
  longestWordBonus: false,
  mostWordsBonus: false,
};

const GameContext = createContext<GameContext>({
  bonuses: undefined,
  canDiscard: false,
  canDraw: false,
  canEndTurn: false,
  canPlay: false,
  connected: false,
  currentPlayer: "",
  deckSize: 0,
  discarded: undefined,
  discardPile: [],
  gameOptions: defaultGameOptions,
  hand: [],
  hasDrawn: false,
  id: "",
  playedCards: [],
  players: [],
  round: 0,
  selectedCards: [],
  setBonuses: () => undefined,
  setCurrentPlayer: () => undefined,
  setDeckSize: () => undefined,
  setDiscarded: () => undefined,
  setDiscardPile: () => undefined,
  setGameOptions: () => undefined,
  setHand: () => undefined,
  setHasDrawn: () => undefined,
  setPlayedCards: () => undefined,
  setPlayers: () => undefined,
  setRound: () => undefined,
  setSelectedCards: () => undefined,
  socket,
  words: [],
});

export const GameProvider = ({ children }: PropsWithChildren) => {
  const id = useMemo(() => uuid(), []);
  const [discarded, setDiscarded] = useState<Card>();
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameOptions, setGameOptions] = useState<GameOptions>(defaultGameOptions);
  const [hand, setHand] = useState<Card[]>([]);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [round, setRound] = useState<number>(0);
  const [deckSize, setDeckSize] = useState<number>(0);
  const [currentPlayer, setCurrentPlayer] = useState<string>("");
  const [discardPile, setDiscardPile] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [playedCards, setPlayedCards] = useState<Card[][]>([]);
  const [bonuses, setBonuses] = useState<Bonuses>();

  const lastTurn = useAudio("./last-turn.mp3");
  const yourTurn = useAudio("./your-turn.mp3");

  const isCurrentPlayersTurn = id === currentPlayer;
  const isLastTurn = players.some(player => player.words.length);
  const thisPlayer = players.find(player => player.id === id);
  const canDiscard = !discarded && selectedCards.length === 1;
  const canDraw = isCurrentPlayersTurn && !hasDrawn;
  const canPlay = hasDrawn;
  const canEndTurn = canPlay && !!discarded && (isLastTurn || hand.length === 0 || playedCards.length === 0);

  const connected = players.some(player => player.id === id);
  const words: Word[] = thisPlayer?.words.length ? thisPlayer.words : playedCards.map((cards) => {
    return cards.reduce(({ cards, points, word }, card) => {
      return {
        cards: [...cards, card],
        points: points + card.points,
        word: `${word}${card.char}`
      };
    }, { cards: [] as Card[], points: 0, word: "" });
  });

  const playTurnMusic = () => isLastTurn ? lastTurn.play() : yourTurn.play();

  useEffect(() => {
    if (isCurrentPlayersTurn) {
      playTurnMusic().then();
    }
  }, [isCurrentPlayersTurn]);

  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  const context: GameContext = {
    bonuses,
    canDiscard,
    canDraw,
    canEndTurn,
    canPlay,
    connected,
    currentPlayer,
    deckSize,
    discarded,
    discardPile,
    gameOptions,
    hand,
    hasDrawn,
    id,
    playedCards,
    players,
    round,
    selectedCards,
    setBonuses,
    setCurrentPlayer,
    setDeckSize,
    setDiscarded,
    setDiscardPile,
    setGameOptions,
    setHand,
    setHasDrawn,
    setPlayedCards,
    setPlayers,
    setRound,
    setSelectedCards,
    socket,
    words,
  };

  return (
    <GameContext.Provider value={context}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);
