"use client";

import { api } from "@/lib/client";
import type { PublicState } from "@/lib/types";
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

export default function GameOver({ state, token, busy, action }: Props) {
	const standings = [...state.players].sort(
		(a, b) => b.totalScore - a.totalScore,
	);
	const winners = standings.filter((p) => state.winnerIds.includes(p.id));

	return (
		<Stack>
			<Panel as={Stack}>
				<H2>
					{winners.length === 1
						? `${winners[0].name} wins with ${winners[0].totalScore} points`
						: `Tied at ${winners[0]?.totalScore ?? 0}: ${winners.map((w) => w.name).join(", ")}`}
				</H2>
				<Table>
					<thead>
						<tr>
							<NumericCell isTitle>#</NumericCell>
							<th>Player</th>
							{state.roundResults.map((r) => (
								<NumericCell isTitle key={r.round}>
									R{r.round}
								</NumericCell>
							))}
							<NumericCell isTitle>Total</NumericCell>
						</tr>
					</thead>
					<tbody>
						{standings.map((p, i) => (
							<tr key={p.id} className={p.isYou ? "bg-amber-400/5" : undefined}>
								<NumericCell>{i + 1}</NumericCell>
								<td>{p.name}</td>
								{state.roundResults.map((r) => {
									const cell = r.results.find((x) => x.playerId === p.id);
									return (
										<NumericCell key={r.round}>
											{cell ? cell.roundScore : "—"}
										</NumericCell>
									);
								})}
								<NumericCell>
									<strong>{p.totalScore}</strong>
								</NumericCell>
							</tr>
						))}
					</tbody>
				</Table>
				<Row>
					<Button
						variant={ButtonVariant.Primary}
						disabled={busy}
						onClick={() => {
							action(() =>
								api.post("/api/game/reset", { keepPlayers: true }, token),
							);
						}}
					>
						Rematch (same players)
					</Button>
					<Button
						variant={ButtonVariant.Ghost}
						disabled={busy}
						onClick={() => {
							action(() =>
								api.post("/api/game/reset", { keepPlayers: false }, token),
							);
						}}
					>
						Clear the table
					</Button>
				</Row>
			</Panel>
		</Stack>
	);
}
