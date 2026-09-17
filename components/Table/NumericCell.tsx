import { cx } from "../ui";
import type { NumericCellProps } from "./types";

export function NumericCell<T extends boolean>({
	children,
	className,
	isTitle,
	...props
}: NumericCellProps<T>) {
	const Cell = isTitle ? "th" : "td";

	return (
		<Cell {...props} className={cx("text-right tabular-nums", className)}>
			{children}
		</Cell>
	);
}
