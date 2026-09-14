"use client";

import type { Card } from "@/lib/types";
import { cx } from "./ui";

interface Props {
	asImg?: boolean;
	card: Card;
	onClick?: () => void;
	small?: boolean;
	selected?: boolean;
	title?: string;
	draggable?: boolean;
	onDragStart?: (e: React.DragEvent) => void;
	onDragEnd?: (e: React.DragEvent) => void;
	dragging?: boolean;
}

export default function CardTile({
	asImg,
	card,
	onClick,
	small,
	selected,
	title,
	draggable,
	onDragStart,
	onDragEnd,
	dragging,
}: Props) {
	const twoLetter = card.letter.length > 1;
	const label = `${card.letter}, ${card.points} points`;
	const Component = asImg ? "div" : "button";

	return (
		<Component
			disabled={!onClick}
			role={asImg ? "img" : "button"}
			type={asImg ? undefined : "button"}
			className={cx(
				"relative flex flex-none select-none items-center justify-center rounded-lg border border-stone-300 bg-linear-160 from-amber-50 to-amber-100 p-0 font-bold tracking-tight text-stone-800 shadow-md",
				small ? "h-14 w-10" : "h-18.5 w-13.5",
				small
					? twoLetter
						? "text-xs"
						: "text-base"
					: twoLetter
						? "text-base"
						: "text-xl",
				Boolean(onClick) &&
					"hover:-translate-y-1 hover:border-amber-400 cursor-pointer",
				selected && "outline-2 outline-offset-2 outline-amber-400",
				dragging && "opacity-40",
			)}
			onClick={onClick}
			title={title ?? label}
			aria-label={label}
			draggable={draggable}
			onDragStart={onDragStart}
			onDragEnd={onDragEnd}
		>
			{card.letter}
			<span className="absolute right-1 bottom-0.5 text-xs font-semibold text-stone-500">
				{card.points}
			</span>
		</Component>
	);
}
