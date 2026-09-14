import type { PropsWithChildren } from "react";
import type { ClassNameValue } from "tailwind-merge";

export type PanelProps = PropsWithChildren<{
	className?: ClassNameValue;
}>;
