"use client";

import type { Card } from "@/lib/types";
import { cx } from "./ui";

interface Props {
	card: Card;
	onClick?: () => void;
	small?: boolean;
	selected?: boolean;
	title?: string;
	draggable?: boolean;
	onDragStart?: (e: React.DragEvent) => void;
	onDragEnd?: (e: React.DragEvent) => void;
	onKeyDown?: (e: React.KeyboardEvent) => void;
	dragging?: boolean;
}

const tileBase =
	"relative flex flex-none select-none items-center justify-center rounded-lg border border-stone-300 bg-linear-160 from-amber-50 to-amber-100 p-0 font-bold tracking-tight text-stone-800 shadow-md";

/** A single letter card. Two-letter faces (QU, TH, ER, IN, CL) get a smaller glyph. */
export default function CardTile({
	card,
	onClick,
	small,
	selected,
	title,
	draggable,
	onDragStart,
	onDragEnd,
	onKeyDown,
	dragging,
}: Props) {
	const twoLetter = card.letter.length > 1;
	const className = cx(
		tileBase,
		small ? "h-14 w-10" : "h-18.5 w-13.5",
		small
			? twoLetter
				? "text-xs"
				: "text-base"
			: twoLetter
				? "text-base"
				: "text-xl",
		onClick && "hover:-translate-y-1 hover:border-amber-400",
		selected && "outline-2 outline-offset-2 outline-amber-400",
		dragging && "opacity-40",
	);

	const label = `${card.letter}, ${card.points} points`;
	const data = { "data-card": card.id, "data-letter": card.letter };
	const face = (
		<>
			{card.letter}
			<span className="absolute right-1 bottom-0.5 text-xs font-semibold text-stone-500">
				{card.points}
			</span>
		</>
	);

	if (!onClick) {
		return (
			<div
				{...data}
				role="img"
				className={className}
				title={title ?? label}
				aria-label={label}
				draggable={draggable}
				onDragStart={onDragStart}
				onDragEnd={onDragEnd}
				onKeyDown={onKeyDown}
			>
				{face}
			</div>
		);
	}

	return (
		<button
			{...data}
			type="button"
			className={cx(className, "cursor-pointer")}
			onClick={onClick}
			title={title ?? label}
			aria-label={label}
			draggable={draggable}
			onDragStart={onDragStart}
			onDragEnd={onDragEnd}
			onKeyDown={onKeyDown}
		>
			{face}
		</button>
	);
}
