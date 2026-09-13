# Quiddler

A single-table implementation of [Quiddler](https://en.wikipedia.org/wiki/Quiddler), the short word
game. Next.js App Router + React, a REST API for every player action, SSE for every update, and the
whole game held in memory.

```bash
npm install
npm run dev          # http://localhost:3000
```

Open the page, pick a username, share the URL. One game at a time, 2–8 players.

## How it is put together

```
lib/deck.ts          the 118-card deck
lib/game.ts          the rules engine — a state machine over one GameState, no I/O
lib/store.ts         the single in-memory game + the SSE subscriber set
lib/serialize.ts     redacts GameState down to what one player may see
lib/dictionary.ts    dictionaryapi.dev + the house dictionary text file
lib/api.ts           route wrapper: token, error-to-HTTP, state echo
app/api/**           REST endpoints (no server actions)
app/api/events       the SSE stream
components/**        the client
data/custom-words.txt  the house dictionary
```

Three rules shape the design:

- **The engine does no I/O.** `lib/game.ts` is pure state transitions that throw `GameError` with an
  HTTP status. Dictionary lookups happen in the route *before* the mutation, so a play rejected for a
  bad word leaves the hand exactly as it was.
- **Every write goes through `mutate()`**, which bumps the version and publishes to all SSE
  subscribers. No caller can forget to broadcast. It publishes even when the mutation throws, because
  a rejected action can still have changed the game (drawing from an exhausted deck ends the round and
  *then* reports the failure).
- **The client never receives another player's cards.** `serializeState` is the only thing that
  builds a payload, and it takes the viewer as an argument. Opponents are described by card count.

### Identity

`POST /api/players` returns a `playerId` and a secret `token`. The client keeps the token in
`localStorage` and sends it as `x-player-token` (or `?token=` for the SSE stream, since `EventSource`
cannot set headers). A token the server no longer recognises is discarded by the client, which drops
you back to the lobby.

## REST API

| Method | Path | Body | Notes |
| --- | --- | --- | --- |
| `GET` | `/api/state` | | Snapshot for the caller. SSE is the primary channel; this is for cold starts. |
| `GET` | `/api/events?token=` | | SSE stream of `state` events. |
| `POST` | `/api/players` | `{name}` | Join the lobby. Returns `{playerId, token}`. |
| `DELETE` | `/api/players` | | Leave the lobby. |
| `POST` | `/api/settings` | `{bonusLongestWord?, bonusMostWords?}` | Host only, lobby only, 2 players only. |
| `POST` | `/api/game/start` | | Host only. Deals round 1. |
| `POST` | `/api/game/next-round` | | Host only. Deals the next round, or ends the game after round 8. |
| `POST` | `/api/game/reset` | `{keepPlayers?}` | Back to the lobby. Host only while a game is running. |
| `POST` | `/api/turn/draw` | `{source: "deck" \| "discard"}` | |
| `POST` | `/api/turn/discard` | `{cardId}` | Ends your turn. |
| `POST` | `/api/turn/play` | `{words: [[cardId,…],…], discardCardId}` | Go out, or take a final turn. |
| `POST` | `/api/words/validate` | `{words: [string]}` | Pre-flight check the UI uses while you stage cards. |
| `GET` | `/api/words/custom` | | The house dictionary. |
| `POST` | `/api/words/custom` | `{word}` | Appends to the house dictionary. Players only. |

Every mutating response echoes the caller's fresh `state`, so the UI updates without waiting for the
SSE round trip. Failures come back as `{ok: false, error, details}` with a real status code — `409`
for "not your turn", `422` for an illegal play, `503` when the dictionary cannot be reached.

## The deck

118 cards, from the [Wikipedia deck table](https://en.wikipedia.org/wiki/Quiddler#Deck). Vowels are
cheap (A/E/I/O = 2), awkward letters pay (Q = 15, Z = 14, J = 13). Five cards carry two letters —
QU 9, TH 9, CL 10, ER 7, IN 7 — and count as **one card but two letters**, which is what makes them
worth holding for the longest-word bonus. `lib/deck.ts` asserts nothing, but the counts sum to 118.

## Rules as implemented

Eight rounds; round 1 deals 3 cards, growing to 10 in round 8. Draw one card from the deck or the
discard pile, then either discard one to end your turn, or **go out** by laying down words that use
every card in hand except one discard. Words score their cards' face value; cards left in hand are
subtracted. Each bonus is 10 points.

A few points the printed rules leave open, decided here and stated in the in-app rules panel:

- **The final turn takes no discard.** After somebody goes out, each remaining player draws once and
  lays down what they can; everything left over is subtracted. Being able to dump one card for free is
  precisely the reward for going out, so the others do not get one.
- **A tied bonus is awarded to nobody.** Two players with equal-longest words means no longest-word
  bonus that round. Disabled bonuses are also hidden from the score table rather than shown as `—`.
- **Minimum word length is 2 letters, not 2 cards.** A lone `IN` card is a legal word.
- **If the draw pile empties**, all but the top discard is shuffled back in. If there is genuinely
  nothing left to draw, the round ends and is scored where it stands rather than deadlocking.
- **Bonus selection**: with exactly 2 players the host picks which bonuses count; a third player
  locks both on and the setting endpoint starts refusing changes.

## Word validation

Words are checked against [dictionaryapi.dev](https://dictionaryapi.dev). It is a free service and it
is unreliable in three ways observed while building this:

1. it returns a **correct JSON body under an HTTP 502**;
2. it returns an **empty body under an HTTP 200**;
3. it sometimes serves `{"title": "No Definitions Found"}` for a word it knows (`dry`, and on one run
   `dictionary`).

So `lib/dictionary.ts` ignores the status code entirely and reads the body: an array of entries means
the word exists, a `title` object means it does not, anything else is a failure worth retrying (three
attempts with backoff). Nothing is ever called *invalid* unless the service said so in as many words —
an outage surfaces as "dictionary unavailable", never as "not a word". Positive results are cached
forever; negative results expire after five minutes, so a false negative heals itself.

When the service will not accept a word you know is real, any player can add it to the house
dictionary from the word row — one click, appended to `data/custom-words.txt`, playable immediately
and logged in the table feed. Point the file elsewhere with `QUIDDLER_CUSTOM_WORDS=/path/to/words.txt`.

## Tests

`tests/` drives the running app from outside: no mocks, no imports of app internals, just HTTP.

```bash
./tests/run-all.sh
```

- `tests/play.mjs` — a full 8-round 3-player game over REST, plus every illegal move (acting out of
  turn, drawing twice, discarding a card you do not hold, a partial go-out, reusing the discard in a
  word, discarding on a final turn, a non-host advancing the round). It verifies the scoring
  arithmetic and bonus rules on every round and that the 8 round scores sum to each final total.
- `tests/sse.mjs` — the event stream itself: headers, the unprompted initial snapshot, per-token
  redaction, pushes on someone else's action, connect/disconnect tracking, and a 2-player round with
  one bonus switched off.
- `tests/ui.mjs` — **two real headless Chrome browsers** driven over the DevTools Protocol, playing
  through the actual UI: join, toggle a bonus, deal, draw, stage a word, unstage it, discard, watch the
  turn pass to the other browser over SSE, go out, read the round summary, deal round 2. It also
  asserts no opponent letters are ever rendered and no console errors occur.

The suites point the house dictionary at a generated word list (`tests/seed-dictionary.mjs`) so a
bot-vs-bot game is repeatable rather than hostage to the flaky third party; `tests/play.mjs` still
probes the live service explicitly, reports what it said, and asserts that a word it refuses can be
rescued through the house dictionary.

Requires macOS (`/usr/share/dict/words`, Google Chrome at the standard path).

## Known limits

Deliberate, given "one short-lived game in memory":

- Restarting the server loses the game; there is no persistence.
- The host drives round transitions, so a host who closes their tab stalls the table. Any player can
  reset once the game is over.
- No spectator joins mid-game — a game in progress refuses new players until it ends.
- A single Node process holds the state, so this does not survive being scaled to more than one
  instance.
