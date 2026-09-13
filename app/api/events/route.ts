import { tokenFrom } from "@/lib/api";
import { findPlayerByToken } from "@/lib/game";
import { serializeState } from "@/lib/serialize";
import { getState, type Subscriber, subscribe } from "@/lib/store";

export const dynamic = "force-dynamic";
// SSE must never be buffered or collapsed into a static response.
export const revalidate = 0;
export const fetchCache = "force-no-store";

const HEARTBEAT_MS = 20_000;

/**
 * GET /api/events?token=... - server-sent events carrying the whole redacted
 * game state on every change. The client re-renders from the last message.
 */
export function GET(req: Request): Response {
	const token = tokenFrom(req);
	const encoder = new TextEncoder();

	let unsubscribe: (() => void) | null = null;
	let heartbeat: ReturnType<typeof setInterval> | null = null;

	const stream = new ReadableStream<Uint8Array>({
		start(controller) {
			let closed = false;

			const write = (chunk: string): boolean => {
				if (closed) return false;
				try {
					controller.enqueue(encoder.encode(chunk));
					return true;
				} catch {
					closed = true;
					return false;
				}
			};

			const subscriber: Subscriber = {
				token,
				send: (event, data) =>
					write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
				close: () => {
					closed = true;
				},
			};

			// Tell the browser not to reconnect faster than this, then send the snapshot.
			write("retry: 2000\n\n");
			write(
				`event: state\ndata: ${JSON.stringify(
					serializeState(getState(), findPlayerByToken(getState(), token)),
				)}\n\n`,
			);

			unsubscribe = subscribe(subscriber);
			heartbeat = setInterval(() => {
				if (!write(": heartbeat\n\n")) cleanup();
			}, HEARTBEAT_MS);

			const cleanup = () => {
				closed = true;
				if (heartbeat) clearInterval(heartbeat);
				heartbeat = null;
				unsubscribe?.();
				unsubscribe = null;
				try {
					controller.close();
				} catch {
					/* already closed */
				}
			};

			req.signal.addEventListener("abort", cleanup);
		},
		cancel() {
			if (heartbeat) clearInterval(heartbeat);
			unsubscribe?.();
		},
	});

	return new Response(stream, {
		headers: {
			"content-type": "text/event-stream; charset=utf-8",
			"cache-control": "no-cache, no-store, no-transform",
			connection: "keep-alive",
			"x-accel-buffering": "no",
		},
	});
}
