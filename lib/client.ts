"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PublicState } from "./types";

const TOKEN_KEY = "quiddler.token";

export class ApiError extends Error {
	status: number;
	details?: unknown;
	constructor(message: string, status: number, details?: unknown) {
		super(message);
		this.status = status;
		this.details = details;
	}
}

export function loadToken(): string | null {
	try {
		return window.localStorage.getItem(TOKEN_KEY);
	} catch {
		return null;
	}
}

export function saveToken(token: string | null): void {
	try {
		if (token) window.localStorage.setItem(TOKEN_KEY, token);
		else window.localStorage.removeItem(TOKEN_KEY);
	} catch {
		/* private browsing; the session just will not survive a reload */
	}
}

async function request<T>(
	method: string,
	path: string,
	body?: unknown,
	token?: string | null,
): Promise<T> {
	const res = await fetch(path, {
		method,
		headers: {
			"content-type": "application/json",
			...(token ? { "x-player-token": token } : {}),
		},
		body: body === undefined ? undefined : JSON.stringify(body),
		cache: "no-store",
	});
	let payload: { ok?: boolean; error?: string; details?: unknown } | null =
		null;
	try {
		payload = await res.json();
	} catch {
		/* empty body */
	}
	if (!res.ok || payload?.ok === false) {
		throw new ApiError(
			payload?.error ?? `Request failed (${res.status})`,
			res.status,
			payload?.details,
		);
	}
	return payload as T;
}

export const api = {
	get: <T>(path: string, token?: string | null) =>
		request<T>("GET", path, undefined, token),
	post: <T>(path: string, body?: unknown, token?: string | null) =>
		request<T>("POST", path, body, token),
	del: <T>(path: string, token?: string | null) =>
		request<T>("DELETE", path, undefined, token),
};

interface UseGame {
	state: PublicState | null;
	token: string | null;
	connected: boolean;
	setSession: (token: string | null, state?: PublicState | null) => void;
	applyState: (state: PublicState) => void;
}

interface Feed {
	/** Which player token this snapshot was rendered for. */
	token: string | null;
	state: PublicState;
}

/** Subscribes to the server-sent event feed and keeps the latest state. */
export function useGame(): UseGame {
	const [token, setTokenState] = useState<string | null>(null);
	const [feed, setFeed] = useState<Feed | null>(null);
	const [connected, setConnected] = useState(false);
	const tokenRef = useRef<string | null>(null);
	tokenRef.current = token;

	useEffect(() => {
		setTokenState(loadToken());
	}, []);

	const setSession = useCallback(
		(next: string | null, state?: PublicState | null) => {
			saveToken(next);
			setTokenState(next);
			if (state) setFeed({ token: next, state });
		},
		[],
	);

	/** Applies the state echoed back by a REST call, so the UI does not wait on SSE. */
	const applyState = useCallback((state: PublicState) => {
		setFeed({ token: tokenRef.current, state });
	}, []);

	useEffect(() => {
		const url = token
			? `/api/events?token=${encodeURIComponent(token)}`
			: "/api/events";
		const source = new EventSource(url);

		source.addEventListener("open", () => setConnected(true));
		source.addEventListener("state", (event) => {
			setConnected(true);
			setFeed({
				token,
				state: JSON.parse((event as MessageEvent).data) as PublicState,
			});
		});
		source.addEventListener("error", () => setConnected(false));

		return () => {
			source.close();
			setConnected(false);
		};
	}, [token]);

	// A token the server no longer knows (restart, or the game was reset) is dead weight.
	// Only trust a snapshot that was rendered for this very token.
	useEffect(() => {
		if (token && feed && feed.token === token && feed.state.you === null) {
			saveToken(null);
			setTokenState(null);
		}
	}, [token, feed]);

	return {
		state: feed?.state ?? null,
		token,
		connected,
		setSession,
		applyState,
	};
}
