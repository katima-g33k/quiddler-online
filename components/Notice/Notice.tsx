import { useMemo } from "react";
import { cx } from "../ui";
import { type NoticeProps, NoticeTone } from "./types";

export const Notice = ({
	children,
	className,
	tone = NoticeTone.Default,
}: NoticeProps) => {
	const toneStyles = useMemo(() => {
		switch (tone) {
			case NoticeTone.Error:
				return "border-red-900 bg-red-950 text-red-200";
			case NoticeTone.Info:
				return "border-yellow-700 bg-yellow-950 text-amber-100";
			default:
				return "border-green-800 bg-green-900 text-green-50";
		}
	}, [tone]);

	return (
		<div
			className={cx(
				"rounded-lg border px-3 py-2.5 text-sm",
				toneStyles,
				className,
			)}
		>
			{children}
		</div>
	);
};
