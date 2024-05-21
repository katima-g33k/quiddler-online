/* eslint-disable @typescript-eslint/no-var-requires,no-undef */
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const ROUNDS = 10;

const deckInfo = [
  { char: "a", count: 10, points: 2 },
  { char: "b", count: 2, points: 2 },
  { char: "c", count: 2, points: 2 },
  { char: "d", count: 4, points: 2 },
  { char: "e", count: 12, points: 2 },
  { char: "f", count: 2, points: 2 },
  { char: "g", count: 4, points: 2 },
  { char: "h", count: 2, points: 2 },
  { char: "i", count: 8, points: 2 },
  { char: "j", count: 2, points: 2 },
  { char: "k", count: 2, points: 2 },
  { char: "l", count: 4, points: 2 },
  { char: "m", count: 2, points: 2 },
  { char: "n", count: 6, points: 2 },
  { char: "o", count: 8, points: 2 },
  { char: "p", count: 2, points: 2 },
  { char: "q", count: 2, points: 2 },
  { char: "r", count: 6, points: 2 },
  { char: "s", count: 4, points: 2 },
  { char: "t", count: 6, points: 2 },
  { char: "u", count: 6, points: 2 },
  { char: "v", count: 2, points: 2 },
  { char: "w", count: 2, points: 2 },
  { char: "x", count: 2, points: 2 },
  { char: "y", count: 4, points: 2 },
  { char: "z", count: 2, points: 2 },
  { char: "qu", count: 2, points: 2 },
  { char: "in", count: 2, points: 2 },
  { char: "er", count: 2, points: 2 },
  { char: "cl", count: 2, points: 2 },
  { char: "th", count: 2, points: 2 },
];

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function initDeck() {
  const deck = [];

  deckInfo.forEach((card) => {
    for (let i = 0; i < card.count; i++) {
      deck.push({ ...card, id: crypto.randomUUID() });
    }
  });

  shuffleArray(deck);

  return deck;
}

let deck;
let firstToFinish;
let round;
let readyToStartRoundCount = 0;
let useLongestWordBonus = true;
let useMostWordsBonus = true;
const players = [];

const app = next({ dev: process.env.NODE_ENV !== "production" });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => handle(req, res, parse(req.url, true)));
  const io = new Server(server);

  io.on("connection", socket => {
    console.log("Client connected");

    socket.on("player-entered", player => {
      players.push({ ...player, remainingCards: [], score: 0, words: [] });
      socket.join(player.id);
      io.emit("player-entered", players);
    });

    socket.on("start-game", () => {
      const hands = players.map(() => []);
      const discardPile = [];
      deck = initDeck();
      round = 1;

      for (let i = 0; i < round + 3; i++) {
        for (let j = 0; j < players.length; j++) {
          hands[j].push(deck.pop());
        }
      }

      discardPile.push(deck.pop());

      players.forEach(({ id }, index) => {
        io.to(id).emit("start-game", {
          currentPlayer: players[0].id,
          deckSize: deck.length,
          discardPile,
          hand: hands[index],
          round,
        });
      });
    });

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
        player.remainingCards = hand;
        player.words = words;
      }

      socket.broadcast.emit("end-turn", { discarded, players });

      const currentPlayerIndex = players.findIndex(player => player.id === id);
      const nextPlayerIndex = currentPlayerIndex === players.length - 1 ? 0 : currentPlayerIndex + 1;
      const nextPlayer = players[nextPlayerIndex];

      if (nextPlayer.id === firstToFinish) {
        // TODO: Handle bonuses (longest word & most words)
        const bonuses = {
          longestWord: [],
          mostWords: [],
        };

        players.forEach((player, index) => {
          const playerLongestWord = player.words.sort((a, b) => b.word.length - a.word.length)[0];

          if (index === 0) {
            bonuses.longestWord.push({ player, word: playerLongestWord.word });
            bonuses.mostWords.push({ player, count: player.words.length });
          } else {
            if (bonuses.longestWord[0].length < playerLongestWord.length) {
              bonuses.longestWord = [{ player, word: playerLongestWord.word }];
            } else if (bonuses.longestWord[0].length === playerLongestWord.length) {
              bonuses.longestWord.push({ player, word: playerLongestWord.word });
            }

            if (bonuses.mostWords.count < player.words.length) {
              bonuses.mostWords = [{ player, count: player.words.length }];
            } else if (bonuses.mostWords.count === player.words.length) {
              bonuses.mostWords.push({ player, count: player.words.length });
            }
          }

          player.score += player.words.reduce((pts, word) => pts + word.points, 0) - player.remainingCards.reduce((pts, card) => pts + card.points, 0);
        });

        if (useLongestWordBonus) {
          bonuses.longestWord.forEach(({ player }) => {
            players.find(({ id }) => id === player.id).score += 10;
          });
        }

        if (useMostWordsBonus) {
          bonuses.mostWords.forEach(({ player }) => {
            players.find(({ id }) => id === player.id).score += 10;
          });
        }

        if (round === ROUNDS) {
          io.emit("end-game", { players });
        } else {
          io.emit("end-round", { players });
        }
      } else {
        io.emit("start-turn", { currentPlayer: nextPlayer.id });
      }
    });

    socket.on("start-round", () => {
      readyToStartRoundCount++;

      if (readyToStartRoundCount === players.length) {
        firstToFinish = undefined;
        readyToStartRoundCount = 0;

        players.forEach((player) => {
          player.remainingCards = [];
          player.words = [];
        });

        const hands = players.map(() => []);
        const discardPile = [];
        deck = initDeck();
        round++;

        for (let i = 0; i < round + 3; i++) {
          for (let j = 0; j < players.length; j++) {
            hands[j].push(deck.pop());
          }
        }

        discardPile.push(deck.pop());

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

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log("> Ready on http://localhost:3000");
  });
});
