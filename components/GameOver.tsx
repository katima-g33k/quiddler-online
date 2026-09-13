"use client";

import { api } from "@/lib/client";
import type { PublicState } from "@/lib/types";
import {
	Button,
	cx,
	gridTable,
	heading,
	numCell,
	panel,
	row,
	stack,
} from "./ui";

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
		<div className={stack}>
			<div className={cx(panel, stack)}>
				<h2 className={heading}>
					{winners.length === 1
						? `${winners[0].name} wins with ${winners[0].totalScore} points`
						: `Tied at ${winners[0]?.totalScore ?? 0}: ${winners.map((w) => w.name).join(", ")}`}
				</h2>
				<table className={gridTable}>
					<thead>
						<tr>
							<th className={numCell}>#</th>
							<th>Player</th>
							{state.roundResults.map((r) => (
								<th key={r.round} className={numCell}>
									R{r.round}
								</th>
							))}
							<th className={numCell}>Total</th>
						</tr>
					</thead>
					<tbody>
						{standings.map((p, i) => (
							<tr key={p.id} className={p.isYou ? "bg-amber-400/5" : undefined}>
								<td className={numCell}>{i + 1}</td>
								<td>{p.name}</td>
								{state.roundResults.map((r) => {
									const cell = r.results.find((x) => x.playerId === p.id);
									return (
										<td key={r.round} className={numCell}>
											{cell ? cell.roundScore : "—"}
										</td>
									);
								})}
								<td className={numCell}>
									<strong>{p.totalScore}</strong>
								</td>
							</tr>
						))}
					</tbody>
				</table>
				<div className={row}>
					<Button
						variant="primary"
						disabled={busy}
						onClick={() =>
							action(() =>
								api.post("/api/game/reset", { keepPlayers: true }, token),
							)
						}
					>
						Rematch (same players)
					</Button>
					<Button
						variant="ghost"
						disabled={busy}
						onClick={() =>
							action(() =>
								api.post("/api/game/reset", { keepPlayers: false }, token),
							)
						}
					>
						Clear the table
					</Button>
				</div>
			</div>
		</div>
	);
}
