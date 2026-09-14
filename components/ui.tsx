import { type ClassNameValue, twMerge } from "tailwind-merge";

/** Joins class names. Where two utilities set the same property the later one wins,
 *  which plain concatenation cannot promise: that is settled by the order Tailwind
 *  emits its rules, not by the order here. */
export function cx(...parts: ClassNameValue[]) {
	return twMerge(parts);
}

export const stack = "flex flex-col gap-4";
/** Two-column shell: the table on the left, side panels on the right. */
export const columns =
	"grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]";
export const row = "flex flex-wrap items-center gap-2";
/** Right-aligned numeric cell. */
export const numCell = "text-right tabular-nums";
