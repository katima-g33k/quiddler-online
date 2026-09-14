import { cx } from "../ui";
import type { StatusDotProps } from "./types";

export const StatusDot = ({ online }: StatusDotProps) => (
	<span
		className={cx(
			"size-2 rounded-full",
			online ? "bg-green-400" : "bg-red-400",
		)}
	/>
);
