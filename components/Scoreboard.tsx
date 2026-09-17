import type { PublicState } from "@/lib/types";
import { Panel } from "./Layout";
import { PlayerInformation } from "./PlayerInformation";
import { H3 } from "./Typography";

type ScoreboardProps = {
	state: PublicState;
};

export default function Scoreboard({ state }: ScoreboardProps) {
	const players = [...state.players].sort(
		(a, b) => b.totalScore - a.totalScore,
	);

	return (
		<Panel>
			<H3>Players</H3>
			<div className="mt-2">
				{players.map((player) => (
					<PlayerInformation
						key={player.id}
						hasWentOut={state.wentOutPlayerId === player.id}
						isPlaying={state.phase === "playing"}
						isTurn={state.turnPlayerId === player.id}
						player={player}
						showScore
					/>
				))}
			</div>
		</Panel>
	);
}
