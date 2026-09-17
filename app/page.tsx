"use client";

import { useCallback, useState } from "react";
import { Button, ButtonSize, ButtonVariant } from "@/components/Button";
import GameLog from "@/components/GameLog";
import GameOver from "@/components/GameOver";
import { Grid, Panel, Row, Stack } from "@/components/Layout";
import Lobby from "@/components/Lobby";
import { Notice, NoticeTone } from "@/components/Notice";
import PlayArea from "@/components/PlayArea";
import RoundSummary from "@/components/RoundSummary";
import RulesPanel from "@/components/RulesPanel";
import Scoreboard from "@/components/Scoreboard";
import { StatusDot } from "@/components/StatusDot";
import { H2 } from "@/components/Typography";
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
				<Row className="gap-4">
					{state.phase !== "lobby" && (
						<span className="text-sm text-stone-400">
							Round {state.round}/{state.totalRounds}
						</span>
					)}
					<span className="inline-flex items-center gap-1.5 text-xs text-stone-400">
						<StatusDot online={connected} />
						{connected ? "live" : "reconnecting…"}
					</span>
				</Row>
			</header>

			{error && (
				<Notice tone={NoticeTone.Error} className="mb-4">
					<Row className="justify-between">
						<span>{error}</span>
						<Button
							variant={ButtonVariant.Ghost}
							size={ButtonSize.sm}
							onClick={() => setError(null)}
						>
							dismiss
						</Button>
					</Row>
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
				<Grid>
					<GameOver state={state} token={token} busy={busy} action={action} />
					<Stack>
						<Scoreboard state={state} />
						<GameLog log={state.log} />
					</Stack>
				</Grid>
			)}

			{inGame && (
				<Grid>
					<Stack>
						{spectating && (
							<Notice tone={NoticeTone.Info}>
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
							<Panel>
								<H2>
									Round {state.round} of {state.totalRounds}
								</H2>
								<p className="text-sm text-stone-400">
									{state.players.find((p) => p.id === state.turnPlayerId)
										?.name ?? "Someone"}{" "}
									is thinking…
								</p>
							</Panel>
						)}
					</Stack>
					<Stack>
						<Scoreboard state={state} />
						<GameLog log={state.log} />
						<RulesPanel />
					</Stack>
				</Grid>
			)}
		</main>
	);
}
