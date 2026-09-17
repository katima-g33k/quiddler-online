import type { ElementType } from "react";
import { cx } from "../ui";
import type { LayoutComponentProps } from "./types";

export function Stack<T extends ElementType = "div">({
	as,
	children,
	className,
	...props
}: LayoutComponentProps<T>) {
	const Component = as ?? "div";

	return (
		<Component {...props} className={cx("flex flex-col gap-4", className)}>
			{children}
		</Component>
	);
}
