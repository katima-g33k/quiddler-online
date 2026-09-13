import { okWithState, route } from "@/lib/api";

export const dynamic = "force-dynamic";

/** GET /api/state - snapshot for the caller (SSE is the primary channel). */
export const GET = route(async (req) => okWithState(req));
