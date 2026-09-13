import { createGame, findPlayerByToken } from "./game";
import { serializeState } from "./serialize";
import type { GameState } from "./types";

export interface Subscriber {
	token: string | null;
	send: (event: string, data: unknown) => boolean;
	close: () => void;
}

interface Store {
	state: GameState;
	subscribers: Set<Subscriber>;
}

declare global {
	var __quiddlerStore: Store | undefined;
}

/** One game, in memory, surviving hot reloads in dev. */
globalThis.__quiddlerStore ??= {
	state: createGame(),
	subscribers: new Set<Subscriber>(),
};
const store: Store = globalThis.__quiddlerStore;

export function getState(): GameState {
	return store.state;
}

export function subscribe(sub: Subscriber): () => void {
	store.subscribers.add(sub);
	trackConnection(sub.token, +1);
	return () => {
		if (store.subscribers.delete(sub)) trackConnection(sub.token, -1);
	};
}

function trackConnection(token: string | null, delta: number): void {
	const player = findPlayerByToken(store.state, token);
	if (!player) return;
	player.connections = Math.max(0, player.connections + delta);
	store.state.version += 1;
	publish();
}

/** Pushes the current state to every listener, redacted per viewer. */
export function publish(): void {
	for (const sub of [...store.subscribers]) {
		const viewer = findPlayerByToken(store.state, sub.token);
		const ok = sub.send("state", serializeState(store.state, viewer));
		if (!ok) store.subscribers.delete(sub);
	}
}

/**
 * Runs a mutation against the single game state, then fans the result out over SSE.
 * Every write path goes through here so no caller can forget to publish.
 */
export function mutate<T>(fn: (state: GameState) => T): T {
	try {
		return fn(store.state);
	} finally {
		// Publish even when the mutation threw: a rejected action can still have
		// changed the game (drawing from an exhausted deck ends the round, then
		// reports the failure), and clients must see that.
		store.state.version += 1;
		publish();
	}
}
