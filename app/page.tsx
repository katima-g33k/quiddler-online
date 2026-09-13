"use client";

import { useCallback, useState } from "react";
import GameLog from "@/components/GameLog";
import GameOver from "@/components/GameOver";
import Lobby from "@/components/Lobby";
import PlayArea from "@/components/PlayArea";
import RoundSummary from "@/components/RoundSummary";
import RulesPanel from "@/components/RulesPanel";
import Scoreboard from "@/components/Scoreboard";
import {
	Button,
	columns,
	cx,
	Dot,
	Notice,
	panel,
	row,
	stack,
} from "@/components/ui";
import { ApiError, useGame } from "@/lib/client";
import type { PublicState } from "@/lib/types";

const shell = "mx-auto max-w-6xl px-4 pt-5 pb-12";

export default function Page() {
	const { state, token, connected, setSession, applyState } = useGame();
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);

	/** Runs a REST call, folds the returned state into the UI, and surfaces failures. */
	const action = useCallback(
		async (fn: () => Promise<{ state: PublicState }>) => {
			setBusy(true);
			setError(null);
			try {
				const res = await fn();
				if (res?.state) applyState(res.state);
			} catch (err) {
				setError(
					err instanceof ApiError ? err.message : "Something went wrong.",
				);
			} finally {
				setBusy(false);
			}
		},
		[applyState],
	);

	if (!state) {
		return (
			<main className={shell}>
				<p className="text-stone-400">Connecting to the table…</p>
			</main>
		);
	}

	const inGame = state.phase === "playing" || state.phase === "roundEnd";
	const spectating = inGame && !state.you;

	return (
		<main className={shell}>
			<header className="mb-4 flex flex-wrap items-baseline justify-between gap-4">
				<div className="flex items-baseline gap-2.5">
					<h1 className="text-2xl font-semibold tracking-tight">Quiddler</h1>
					<span className="text-sm text-stone-400">the short word game</span>
				</div>
				<div className={cx(row, "gap-4")}>
					{state.phase !== "lobby" && (
						<span className="text-sm text-stone-400">
							Round {state.round}/{state.totalRounds}
						</span>
					)}
					<span className="inline-flex items-center gap-1.5 text-xs text-stone-400">
						<Dot on={connected} />
						{connected ? "live" : "reconnecting…"}
					</span>
				</div>
			</header>

			{error && (
				<Notice tone="error" className="mb-4">
					<div className={cx(row, "justify-between")}>
						<span>{error}</span>
						<Button variant="ghost" small onClick={() => setError(null)}>
							dismiss
						</Button>
					</div>
				</Notice>
			)}

			{state.phase === "lobby" && (
				<Lobby
					state={state}
					token={token}
					busy={busy}
					action={action}
					setError={setError}
					onSession={(t, s) => setSession(t, s)}
				/>
			)}

			{state.phase === "gameEnd" && (
				<div className={columns}>
					<GameOver state={state} token={token} busy={busy} action={action} />
					<div className={stack}>
						<Scoreboard state={state} />
						<GameLog log={state.log} />
					</div>
				</div>
			)}

			{inGame && (
				<div className={columns}>
					<div className={stack}>
						{spectating && (
							<Notice tone="info">
								A game is in progress. You can watch, and join the next one from
								the lobby.
							</Notice>
						)}
						{state.phase === "roundEnd" ? (
							<RoundSummary
								state={state}
								token={token}
								busy={busy}
								action={action}
							/>
						) : state.you ? (
							<PlayArea
								state={state}
								you={state.you}
								token={token}
								busy={busy}
								action={action}
								setError={setError}
							/>
						) : (
							<div className={panel}>
								<h2 className="text-lg font-semibold tracking-tight">
									Round {state.round} of {state.totalRounds}
								</h2>
								<p className="text-sm text-stone-400">
									{state.players.find((p) => p.id === state.turnPlayerId)
										?.name ?? "Someone"}{" "}
									is thinking…
								</p>
							</div>
						)}
					</div>
					<div className={stack}>
						<Scoreboard state={state} />
						<GameLog log={state.log} />
						<div className={panel}>
							<RulesPanel />
						</div>
					</div>
				</div>
			)}
		</main>
	);
}
