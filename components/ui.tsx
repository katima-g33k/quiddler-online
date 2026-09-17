import { type ClassNameValue, twMerge } from "tailwind-merge";

/** Joins class names. Where two utilities set the same property the later one wins,
 *  which plain concatenation cannot promise: that is settled by the order Tailwind
 *  emits its rules, not by the order here. */
export function cx(...parts: ClassNameValue[]) {
	return twMerge(parts);
}
