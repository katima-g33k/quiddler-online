import type { ElementType } from "react";
import { cx } from "../ui";
import type { LayoutComponentProps } from "./types";

export function Panel<T extends ElementType = "div">({
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
				"rounded-xl border border-green-800 bg-green-950 p-4 shadow-md",
				className,
			)}
		>
			{children}
		</Component>
	);
}
