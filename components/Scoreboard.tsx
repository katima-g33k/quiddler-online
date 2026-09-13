import type { PublicState } from "@/lib/types";
import { Badge, cx, Dot, panel, playerRow, sectionTitle } from "./ui";

export default function Scoreboard({ state }: { state: PublicState }) {
	const sorted = [...state.players].sort((a, b) => b.totalScore - a.totalScore);
	return (
		<div className={panel}>
			<h3 className={sectionTitle}>Players</h3>
			<div className="mt-2">
				{sorted.map((p) => {
					const isTurn = state.turnPlayerId === p.id;
					return (
						<div
							key={p.id}
							className={cx(
								playerRow,
								isTurn && "border-yellow-700 bg-amber-400/10",
							)}
						>
							<Dot on={p.online} />
							<span className="min-w-0 flex-1 truncate">
								{p.name}
								{p.isYou && (
									<span className="text-xs text-stone-400"> (you)</span>
								)}
								{p.isHost && (
									<span className="text-xs text-stone-400"> · host</span>
								)}
							</span>
							{state.phase === "playing" && (
								<Badge>
									{p.finishedRound
										? "done"
										: `${p.handCount} card${p.handCount === 1 ? "" : "s"}`}
								</Badge>
							)}
							{state.wentOutPlayerId === p.id && (
								<Badge tone="gold">went out</Badge>
							)}
							<strong className="tabular-nums">{p.totalScore}</strong>
						</div>
					);
				})}
			</div>
		</div>
	);
}
