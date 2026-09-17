import type { ElementType } from "react";
import { cx } from "../ui";
import type { LayoutComponentProps } from "./types";

export function withStyles<D extends ElementType = "div">(
	displayName: string,
	styles: string,
	defaultElement = "div" as D,
) {
	function LayoutComponent<T extends ElementType = D>({
		as,
		children,
		className,
		...props
	}: LayoutComponentProps<T>) {
		const Component = (as ?? defaultElement) as ElementType;

		return (
			<Component {...props} className={cx(styles, className)}>
				{children}
			</Component>
		);
	}

	LayoutComponent.displayName = displayName;

	return LayoutComponent;
}
