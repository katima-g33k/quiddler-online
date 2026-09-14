import type { PublicPlayer } from "@/lib/types";

export type PlayerInformationProps = {
	hasWentOut?: boolean;
	isPlaying?: boolean;
	isTurn?: boolean;
	player: PublicPlayer;
	showScore?: boolean;
};
