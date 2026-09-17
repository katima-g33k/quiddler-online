"use client";

import { api } from "@/lib/client";
import type { PublicState } from "@/lib/types";
import { Badge, BadgeTone } from "./Badge";
import { Button, ButtonVariant } from "./Button";
import { Panel, Row, Stack } from "./Layout";
import { NumericCell, Table } from "./Table";
import { H2 } from "./Typography";

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
		<Panel as={Stack}>
			<Row className="justify-between">
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
			</Row>

			<Table>
				<thead>
					<tr>
						<th>Player</th>
						<th>Words</th>
						<NumericCell isTitle>Cards</NumericCell>
						<NumericCell isTitle>Unused</NumericCell>
						{bonusLongestWord && <NumericCell isTitle>Longest</NumericCell>}
						{bonusMostWords && <NumericCell isTitle>Most</NumericCell>}
						<NumericCell isTitle>Round</NumericCell>
						<NumericCell isTitle>Total</NumericCell>
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
								<NumericCell>{r.wordPoints}</NumericCell>
								<NumericCell>
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
								</NumericCell>
								{bonusLongestWord && (
									<NumericCell>
										{r.longestWordBonus ? (
											<span className="text-green-400">+10</span>
										) : (
											"—"
										)}
									</NumericCell>
								)}
								{bonusMostWords && (
									<NumericCell>
										{r.mostWordsBonus ? (
											<span className="text-green-400">+10</span>
										) : (
											"—"
										)}
									</NumericCell>
								)}
								<NumericCell>
									<strong>{signed(r.roundScore)}</strong>
								</NumericCell>
								<NumericCell>
									<strong>{r.totalAfter}</strong>
								</NumericCell>
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
