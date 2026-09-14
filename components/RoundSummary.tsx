"use client";

import { api } from "@/lib/client";
import type { PublicState } from "@/lib/types";
import { Badge, BadgeTone } from "./Badge";
import { Button, ButtonVariant } from "./Button";
import { Panel } from "./Panel";
import { Table } from "./Table";
import { H2 } from "./Typography";
import { cx, numCell, row, stack } from "./ui";

interface Props {
	state: PublicState;
	token: string | null;
	busy: boolean;
	action: (fn: () => Promise<{ state: PublicState }>) => Promise<void>;
}

function signed(n: number) {
	return (
		<span
			className={n > 0 ? "text-green-400" : n < 0 ? "text-red-400" : undefined}
		>
			{n > 0 ? `+${n}` : n}
		</span>
	);
}

export default function RoundSummary({ state, token, busy, action }: Props) {
	const round = state.roundResults.at(-1);
	if (!round) return null;
	const isLastRound = round.round >= state.totalRounds;
	// A bonus that is switched off has nothing to say, so it gets no column.
	const { bonusLongestWord, bonusMostWords } = state.settings;

	return (
		<Panel className={stack}>
			<div className={cx(row, "justify-between")}>
				<H2>
					Round {round.round} results{" "}
					<span className="text-sm text-stone-400">
						({round.handSize}-card hands)
					</span>
				</H2>
				{state.you?.isHost && (
					<Button
						variant={ButtonVariant.Primary}
						disabled={busy}
						onClick={() =>
							action(() => api.post("/api/game/next-round", {}, token))
						}
					>
						{isLastRound ? "See final scores" : `Deal round ${round.round + 1}`}
					</Button>
				)}
			</div>

			<Table>
				<thead>
					<tr>
						<th>Player</th>
						<th>Words</th>
						<th className={numCell}>Cards</th>
						<th className={numCell}>Unused</th>
						{bonusLongestWord && <th className={numCell}>Longest</th>}
						{bonusMostWords && <th className={numCell}>Most</th>}
						<th className={numCell}>Round</th>
						<th className={numCell}>Total</th>
					</tr>
				</thead>
				<tbody>
					{[...round.results]
						.sort((a, b) => b.totalAfter - a.totalAfter)
						.map((r) => (
							<tr
								key={r.playerId}
								className={
									state.you?.id === r.playerId ? "bg-amber-400/5" : undefined
								}
							>
								<td>
									{r.name}
									{r.wentOut && (
										<Badge tone={BadgeTone.Warning} className="ml-1.5">
											out
										</Badge>
									)}
								</td>
								<td>
									{r.words.length ? (
										r.words.map((w) => w.word.toUpperCase()).join(", ")
									) : (
										<span className="text-stone-400">—</span>
									)}
								</td>
								<td className={numCell}>{r.wordPoints}</td>
								<td className={numCell}>
									{r.penalty ? (
										<span
											className="text-red-400"
											title={r.unused.map((c) => c.letter).join(" ")}
										>
											-{r.penalty}
										</span>
									) : (
										<span className="text-stone-400">0</span>
									)}
								</td>
								{bonusLongestWord && (
									<td className={numCell}>
										{r.longestWordBonus ? (
											<span className="text-green-400">+10</span>
										) : (
											"—"
										)}
									</td>
								)}
								{bonusMostWords && (
									<td className={numCell}>
										{r.mostWordsBonus ? (
											<span className="text-green-400">+10</span>
										) : (
											"—"
										)}
									</td>
								)}
								<td className={numCell}>
									<strong>{signed(r.roundScore)}</strong>
								</td>
								<td className={numCell}>
									<strong>{r.totalAfter}</strong>
								</td>
							</tr>
						))}
				</tbody>
			</Table>

			{!state.you?.isHost && (
				<p className="m-0 text-sm text-stone-400">
					Waiting for the host to deal the next round.
				</p>
			)}
		</Panel>
	);
}
