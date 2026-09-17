import type { ComponentPropsWithoutRef, ElementType } from "react";

export type LayoutComponentProps<T extends ElementType = "div"> = {
	as?: T;
} & Omit<ComponentPropsWithoutRef<T>, "as">;
