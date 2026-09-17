import type { ElementType } from "react";
import { cx } from "../ui";
import type { LayoutComponentProps } from "./types";

export function Grid<T extends ElementType = "div">({
	as,
	children,
	className,
	...props
}: LayoutComponentProps<T>) {
	const Component = as ?? "div";

	return (
		<Component
			{...props}
			className={cx(
				className,
				"grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]",
			)}
		>
			{children}
		</Component>
	);
}
