import { useMemo } from "react";
import { cx } from "../ui";
import { type BadgeProps, BadgeTone } from "./types";

export const Badge = ({
	children,
	className,
	title,
	tone = BadgeTone.Default,
}: BadgeProps) => {
	const toneStyles = useMemo(() => {
		switch (tone) {
			case BadgeTone.Error:
				return "border-red-900 text-red-400";
			case BadgeTone.Success:
				return "border-green-700 text-green-400";
			case BadgeTone.Warning:
				return "border-yellow-700 text-amber-400";
			default:
				return "border-green-800 text-stone-400";
		}
	}, [tone]);

	return (
		<span
			title={title}
			className={cx(
				"whitespace-nowrap rounded-full border px-1.5 py-0.5 text-xs",
				toneStyles,
				className,
			)}
		>
			{children}
		</span>
	);
};
