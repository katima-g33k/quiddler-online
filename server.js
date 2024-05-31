/* eslint-disable @typescript-eslint/no-var-requires,no-undef */
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");
const { calculateBonuses } = require("./src/server/calculateBonuses");

const ROUNDS = 8;

const deckInfo = [
  { char: "a", count: 10, points: 2 },
  { char: "b", count: 2, points: 8 },
  { char: "c", count: 2, points: 8 },
  { char: "d", count: 4, points: 5 },
  { char: "e", count: 12, points: 2 },
  { char: "f", count: 2, points: 6 },
  { char: "g", count: 4, points: 6 },
  { char: "h", count: 2, points: 7 },
  { char: "i", count: 8, points: 2 },
  { char: "j", count: 2, points: 13 },
  { char: "k", count: 2, points: 8 },
  { char: "l", count: 4, points: 3 },
  { char: "m", count: 2, points: 5 },
  { char: "n", count: 6, points: 5 },
  { char: "o", count: 8, points: 2 },
  { char: "p", count: 2, points: 6 },
  { char: "q", count: 2, points: 15 },
  { char: "r", count: 6, points: 5 },
  { char: "s", count: 4, points: 3 },
  { char: "t", count: 6, points: 3 },
  { char: "u", count: 6, points: 4 },
  { char: "v", count: 2, points: 11 },
  { char: "w", count: 2, points: 10 },
  { char: "x", count: 2, points: 12 },
  { char: "y", count: 4, points: 4 },
  { char: "z", count: 2, points: 14 },
  { char: "cl", count: 2, points: 10 },
  { char: "er", count: 2, points: 7 },
  { char: "in", count: 2, points: 7 },
  { char: "qu", count: 2, points: 9 },
  { char: "th", count: 2, points: 9 },
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
let readyToStartGameCount = 0;
let gameOptions = {
  longestWordBonus: false,
  mostWordsBonus: true,
};
const players = [];

const app = next({ dev: process.env.NODE_ENV !== "production" });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => handle(req, res, parse(req.url, true)));
  const io = new Server(server);
  const startGame = () => {
    const hands = players.map(() => []);
    const discardPile = [];
    deck = initDeck();
    round = 1;
    firstToFinish = undefined;
    readyToStartRoundCount = 0;
    readyToStartGameCount = 0;

    for (let i = 0; i < round + 2; i++) {
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
  };

  io.on("connection", socket => {
    console.log("Client connected");

    socket.on("player-entered", player => {
      players.push({ ...player, remainingCards: [], score: 0, words: [] });
      socket.join(player.id);
      io.emit("player-entered", players);
    });

    socket.on("update-options", (options) => {
      gameOptions = options;
      socket.broadcast.emit("update-options", options);
    });

    socket.on("start-game", () => {
      startGame();
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
        const bonuses = calculateBonuses(players, gameOptions);

        players.forEach((player) => {
          player.score += player.words.reduce((pts, word) => pts + word.points, 0) - player.remainingCards.reduce((pts, card) => pts + card.points, 0);
        });

        bonuses.longestWord?.forEach((longestWord) => {
          players.find(({ id }) => id === longestWord.player.id).score += 10;
        });

        bonuses.mostWords?.forEach((longestWord) => {
          players.find(({ id }) => id === longestWord.player.id).score += 10;
        });

        if (round === ROUNDS) {
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

        for (let i = 0; i < round + 2; i++) {
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

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log("> Ready on http://localhost:3000");
  });
});
