import { cx } from "../ui";
import type { PanelProps } from "./types";

export const Panel = ({ children, className }: PanelProps) => (
	<div
		className={cx(
			"rounded-xl border border-green-800 bg-green-950 p-4 shadow-md",
			className,
		)}
	>
		{children}
	</div>
);
