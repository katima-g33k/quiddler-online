import { findPlayerByToken, GameError } from "./game";
import { serializeState } from "./serialize";
import { getState } from "./store";

export const PLAYER_TOKEN_HEADER = "x-player-token";

export function tokenFrom(req: Request): string | null {
	return (
		req.headers.get(PLAYER_TOKEN_HEADER) ??
		new URL(req.url).searchParams.get("token") ??
		null
	);
}

export function json(data: unknown, status = 200): Response {
	return Response.json(data, {
		status,
		headers: { "cache-control": "no-store" },
	});
}

/** The standard success shape: whatever the route returns, plus the caller's fresh state. */
export function okWithState(
	req: Request,
	extra: Record<string, unknown> = {},
): Response {
	const state = getState();
	const viewer = findPlayerByToken(state, tokenFrom(req));
	return json({ ok: true, ...extra, state: serializeState(state, viewer) });
}

export function errorResponse(err: unknown): Response {
	if (err instanceof GameError) {
		return json(
			{ ok: false, error: err.message, details: err.details },
			err.status,
		);
	}
	if (err instanceof SyntaxError) {
		return json({ ok: false, error: "Request body must be valid JSON." }, 400);
	}
	console.error("[quiddler] unhandled error", err);
	const message =
		err instanceof Error ? err.message : "Unexpected server error.";
	return json({ ok: false, error: message }, 500);
}

export async function readBody<T>(req: Request): Promise<T> {
	const text = await req.text();
	if (!text) return {} as T;
	return JSON.parse(text) as T;
}

/** Wraps a handler so GameErrors become clean HTTP responses. */
export function route(handler: (req: Request) => Promise<Response>) {
	return async (req: Request): Promise<Response> => {
		try {
			return await handler(req);
		} catch (err) {
			return errorResponse(err);
		}
	};
}
