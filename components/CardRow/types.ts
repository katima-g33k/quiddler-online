import type { HTMLAttributes, ReactNode } from "react";
import type { ClassNameValue } from "tailwind-merge";
import type { Card } from "@/lib/types";

export interface CardRowProps
	extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children"> {
	cards: Card[];
	className?: ClassNameValue;
	emptyTitle?: string;
	renderCard: (card: Card) => ReactNode;
}
