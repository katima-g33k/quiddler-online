import { Badge, BadgeTone } from "../Badge";
import { StatusDot } from "../StatusDot";
import { cx } from "../ui";
import type { PlayerInformationProps } from "./types";

export const PlayerInformation = ({
	hasWentOut,
	isPlaying,
	isTurn,
	player,
	showScore,
}: PlayerInformationProps) => (
	<div
		key={player.id}
		className={cx(
			"flex items-center gap-2 rounded-lg border border-transparent px-2 py-2",
			isTurn && "border-yellow-700 bg-amber-400/10",
		)}
	>
		<StatusDot online={player.online} />

		<span className="min-w-0 flex-1 truncate">
			{player.name}
			{player.isYou && <span className="text-xs text-stone-400"> (you)</span>}
		</span>

		{player.isHost && <Badge>host</Badge>}

		{isPlaying && (
			<Badge>
				{player.finishedRound
					? "done"
					: `${player.handCount} card${player.handCount === 1 ? "" : "s"}`}
			</Badge>
		)}

		{hasWentOut && <Badge tone={BadgeTone.Warning}>went out</Badge>}

		{showScore && <strong className="tabular-nums">{player.totalScore}</strong>}
	</div>
);
