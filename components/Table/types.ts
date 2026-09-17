import type {
	ComponentPropsWithoutRef,
	DetailedHTMLProps,
	TableHTMLAttributes,
} from "react";

export type NumericCellProps<T extends boolean = false> =
	ComponentPropsWithoutRef<T extends true ? "th" : "td"> & {
		isTitle?: T;
	};

export type TableProps = DetailedHTMLProps<
	TableHTMLAttributes<HTMLTableElement>,
	HTMLTableElement
>;
