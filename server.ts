import next from "next";
import { createServer } from "http";
import { parse } from "url";
import { Server } from "socket.io";
import { calculateBonuses, initDeck } from "./src/lib/index.ts";
import { NB_ROUNDS } from "./src/constants/index.ts";

import type { Socket } from "socket.io";
import type { Bonuses, Card, Player } from "./src/types";

let deck: Card[] = [];
let firstToFinish: string | undefined;
let round = 0;
let readyToStartRoundCount = 0;
let readyToStartGameCount = 0;
const useLongestWordBonus = true;
const useMostWordsBonus = true;
const players: Player[] = [];

const app = next({ dev: process.env.NODE_ENV !== "production" });
const handle = app.getRequestHandler();

function distributeCard(deck: Card[], nbPlayers: number, round: number) {
  const hands: Card[][] = [...Array(nbPlayers)].map(() => []);
  const discardPile: Card[] = [];

  for (let i = 0; i < round + 2; i++) {
    for (let j = 0; j < nbPlayers; j++) {
      hands[j].push(deck.pop()!);
    }
  }

  discardPile.push(deck.pop()!);

  return { deck, discardPile, hands };
}

app.prepare().then(() => {
  const server = createServer((req, res) => handle(req, res, parse(req.url || "", true)));
  const io = new Server(server);
  const startGame = () => {
    readyToStartGameCount = 0;

    round++;
    firstToFinish = undefined;
    readyToStartRoundCount = 0;

    const { deck: startDeck, discardPile, hands } = distributeCard(initDeck(), players.length, round);
    deck = startDeck;

    players.forEach(({ id }, index) => {
      io.to(id).emit("start-game", {
        currentPlayer: players[0].id,
        deckSize: deck.length,
        discardPile,
        hand: hands[index],
        round,
      });
    });
  };

  io.on("connection", (socket: Socket) => {
    console.log("Client connected");

    socket.on("player-entered", player => {
      players.push({ ...player, remainingCards: [], score: 0, words: [] });
      socket.join(player.id);
      io.emit("player-entered", players);
    });

    socket.on("start-game", () => startGame());

    socket.on("draw", (id) => {
      const card = deck.pop();
      const deckSize = deck.length;

      io.to(id).emit("draw", { card, deckSize });
      socket.broadcast.emit("draw", { deckSize });
    });

    socket.on("pick-from-discard", () => {
      socket.broadcast.emit("pick-from-discard");
    });

    socket.on("end-turn", (id, { discarded, hand, words }) => {
      if (firstToFinish === undefined && words.length) {
        firstToFinish = id;
      }

      if (firstToFinish !== undefined) {
        const player = players.find((player) => player.id === id);

        if (player) {
          player.remainingCards = hand;
          player.words = words;
        }
      }

      socket.broadcast.emit("end-turn", { discarded, players });

      const currentPlayerIndex = players.findIndex(player => player.id === id);
      const nextPlayerIndex = currentPlayerIndex === players.length - 1 ? 0 : currentPlayerIndex + 1;
      const nextPlayer = players[nextPlayerIndex];

      if (nextPlayer.id === firstToFinish) {
        const bonuses: Bonuses = calculateBonuses(players, { useLongestWordBonus, useMostWordsBonus });

        players.forEach((player) => {
          player.score += player.words.reduce((pts, word) => pts + word.points, 0) - player.remainingCards.reduce((pts, card) => pts + card.points, 0);
        });

        bonuses.longestWord?.forEach((longestWord) => {
          const player = players.find(({ id }) => id === longestWord.player.id);

          if (player) {
            player.score += 10;
          }
        });

        bonuses.mostWords?.forEach((mostWords) => {
          const player = players.find(({ id }) => id === mostWords.player.id);

          if (player) {
            player.score += 10;
          }
        });

        if (round === NB_ROUNDS) {
          io.emit("end-game", { bonuses, players });
        } else {
          io.emit("end-round", { bonuses, players });
        }
      } else {
        io.emit("start-turn", { currentPlayer: nextPlayer.id });
      }
    });

    socket.on("start-round", () => {
      readyToStartRoundCount++;

      if (readyToStartRoundCount === players.length) {
        players.forEach((player) => {
          player.remainingCards = [];
          player.words = [];
        });

        round++;
        firstToFinish = undefined;
        readyToStartRoundCount = 0;

        const { deck: startDeck, discardPile, hands } = distributeCard(initDeck(), players.length, round);
        deck = startDeck;

        players.forEach(({ id }, index) => {
          io.to(id).emit("start-round", {
            currentPlayer: players[0].id,
            deckSize: deck.length,
            discardPile,
            hand: hands[index],
            round,
            players,
          });
        });
      }
    });

    socket.on("start-new-game", () => {
      readyToStartGameCount++;

      if (readyToStartGameCount === players.length) {
        startGame();
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  server.listen(3000);
});
