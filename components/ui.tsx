import type { ButtonHTMLAttributes, ReactNode } from "react";
import { type ClassNameValue, twMerge } from "tailwind-merge";

/** Joins class names. Where two utilities set the same property the later one wins,
 *  which plain concatenation cannot promise: that is settled by the order Tailwind
 *  emits its rules, not by the order here. */
export function cx(...parts: ClassNameValue[]) {
	return twMerge(parts);
}

/* Shared surfaces and text treatments, so the felt table reads the same everywhere. */
export const panel =
	"rounded-xl border border-green-800 bg-green-950 p-4 shadow-md";
export const stack = "flex flex-col gap-4";
/** Two-column shell: the table on the left, side panels on the right. */
export const columns =
	"grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]";
/** One seat at the table: online light, name, then trailing badges. */
export const playerRow =
	"flex items-center gap-2 rounded-lg border border-transparent px-2 py-2";
export const row = "flex flex-wrap items-center gap-2";
export const heading = "text-lg font-semibold tracking-tight";
export const sectionTitle =
	"text-sm font-semibold uppercase tracking-wider text-stone-400";
/** A run of cards, tall enough to hold a full-size tile even when empty. */
export const cardsRow = "flex min-h-18.5 flex-wrap items-center gap-1.5";
export const textInput =
	"w-full rounded-lg border border-green-800 bg-green-950 px-3 py-2 text-green-50 focus:outline-2 focus:outline-offset-1 focus:outline-yellow-700";
export const gridTable =
	"w-full border-collapse text-sm [&_td]:border-b [&_td]:border-green-800 [&_td]:px-2 [&_td]:py-1.5 [&_th]:border-b [&_th]:border-green-800 [&_th]:px-2 [&_th]:py-1.5 [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-stone-400";
/** Right-aligned numeric cell. */
export const numCell = "text-right tabular-nums";

/* --------------------------------- button -------------------------------- */

type ButtonVariant = "default" | "primary" | "ghost" | "danger";

const buttonBase =
	"cursor-pointer rounded-lg border border-green-800 bg-green-900 text-green-50 transition-colors duration-100 enabled:hover:border-yellow-700 enabled:hover:bg-green-800 enabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40";

const buttonVariants: Record<ButtonVariant, string> = {
	default: "",
	primary:
		"border-amber-400 bg-amber-400 font-semibold text-stone-900 enabled:hover:border-amber-300 enabled:hover:bg-amber-300",
	ghost: "bg-transparent",
	danger: "border-red-900 text-red-300",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	small?: boolean;
}

export function Button({
	variant = "default",
	small,
	className,
	type,
	...rest
}: ButtonProps) {
	return (
		<button
			type={type ?? "button"}
			className={cx(
				buttonBase,
				small ? "px-2 py-1 text-sm" : "px-3.5 py-2",
				buttonVariants[variant],
				className,
			)}
			{...rest}
		/>
	);
}

/* --------------------------------- badge --------------------------------- */

type BadgeTone = "default" | "ok" | "bad" | "gold";

const badgeTones: Record<BadgeTone, string> = {
	default: "border-green-800 text-stone-400",
	ok: "border-green-700 text-green-400",
	bad: "border-red-900 text-red-400",
	gold: "border-yellow-700 text-amber-400",
};

export function Badge({
	tone = "default",
	className,
	title,
	children,
}: {
	tone?: BadgeTone;
	className?: string;
	title?: string;
	children: ReactNode;
}) {
	return (
		<span
			title={title}
			className={cx(
				"whitespace-nowrap rounded-full border px-1.5 py-0.5 text-xs",
				badgeTones[tone],
				className,
			)}
		>
			{children}
		</span>
	);
}

/* --------------------------------- notice -------------------------------- */

type NoticeTone = "default" | "error" | "info";

const noticeTones: Record<NoticeTone, string> = {
	default: "border-green-800 bg-green-900 text-green-50",
	error: "border-red-900 bg-red-950 text-red-200",
	info: "border-yellow-700 bg-yellow-950 text-amber-100",
};

export function Notice({
	tone = "default",
	className,
	children,
}: {
	tone?: NoticeTone;
	className?: string;
	children: ReactNode;
}) {
	return (
		<div
			className={cx(
				"rounded-lg border px-3 py-2.5 text-sm",
				noticeTones[tone],
				className,
			)}
		>
			{children}
		</div>
	);
}

/* ------------------------------ online dot ------------------------------- */

export function Dot({ on }: { on?: boolean }) {
	return (
		<span
			className={cx("size-2 rounded-full", on ? "bg-green-400" : "bg-red-400")}
		/>
	);
}
