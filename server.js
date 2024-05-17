/* eslint-disable @typescript-eslint/no-var-requires,no-undef */
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const deckInfo = [
  { char: "a", count: 10, points: 0 },
  { char: "b", count: 2, points: 0 },
  { char: "c", count: 2, points: 0 },
  { char: "d", count: 4, points: 0 },
  { char: "e", count: 12, points: 0 },
  { char: "f", count: 2, points: 0 },
  { char: "g", count: 4, points: 0 },
  { char: "h", count: 2, points: 0 },
  { char: "i", count: 8, points: 0 },
  { char: "j", count: 2, points: 0 },
  { char: "k", count: 2, points: 0 },
  { char: "l", count: 4, points: 0 },
  { char: "m", count: 2, points: 0 },
  { char: "n", count: 6, points: 0 },
  { char: "o", count: 8, points: 0 },
  { char: "p", count: 2, points: 0 },
  { char: "q", count: 2, points: 0 },
  { char: "r", count: 6, points: 0 },
  { char: "s", count: 4, points: 0 },
  { char: "t", count: 6, points: 0 },
  { char: "u", count: 6, points: 0 },
  { char: "v", count: 2, points: 0 },
  { char: "w", count: 2, points: 0 },
  { char: "x", count: 2, points: 0 },
  { char: "y", count: 4, points: 0 },
  { char: "z", count: 2, points: 0 },
  { char: "qu", count: 2, points: 0 },
  { char: "in", count: 2, points: 0 },
  { char: "er", count: 2, points: 0 },
  { char: "cl", count: 2, points: 0 },
  { char: "th", count: 2, points: 0 },
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
      deck.push(card);
    }
  });

  shuffleArray(deck);

  return deck;
}

let deck;
let round;
const players = [];

const app = next({ dev: process.env.NODE_ENV !== "production" });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => handle(req, res, parse(req.url, true)));
  const io = new Server(server);

  io.on("connection", socket => {
    console.log("Client connected");

    socket.on("player-entered", player => {
      players.push(player);
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

    socket.on("end-turn", ({ discarded, id }) => {
      socket.broadcast.emit("end-turn", { discarded });

      const currentPlayerIndex = players.findIndex(player => player.id === id);
      const nextPlayerIndex = currentPlayerIndex === players.length - 1 ? 0 : currentPlayerIndex + 1;
      const nextPlayer = players[nextPlayerIndex];

      io.emit("start-turn", { currentPlayer: nextPlayer.id });
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
