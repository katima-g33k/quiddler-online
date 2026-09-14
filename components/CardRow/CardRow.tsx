import { cx } from "../ui";
import type { CardRowProps } from "./types";

export const CardRow = ({
	cards,
	className,
	emptyTitle,
	renderCard,
	...props
}: CardRowProps) => (
	<div
		className={cx("flex min-h-18.5 flex-wrap items-center gap-1.5", className)}
		{...props}
	>
		{cards.length === 0 && emptyTitle && (
			<span className="text-xs text-stone-400">{emptyTitle}</span>
		)}
		{cards.map(renderCard)}
	</div>
);
