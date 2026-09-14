import type { PropsWithChildren } from "react";
import type { ClassNameValue } from "tailwind-merge";
import type { Brand } from "@/app/types";

type BadgeToneBrand = "Button";

const BADGE_TONES = {
	Default: "DEFAULT",
	Error: "ERROR",
	Success: "SUCCESS",
	Warning: "WARNING",
} as const;

export const BadgeTone = {
	Default: BADGE_TONES.Default as Brand<
		typeof BADGE_TONES.Default,
		BadgeToneBrand
	>,
	Error: BADGE_TONES.Error as Brand<typeof BADGE_TONES.Error, BadgeToneBrand>,
	Success: BADGE_TONES.Success as Brand<
		typeof BADGE_TONES.Success,
		BadgeToneBrand
	>,
	Warning: BADGE_TONES.Warning as Brand<
		typeof BADGE_TONES.Warning,
		BadgeToneBrand
	>,
} as const;

export type BadgeTone = (typeof BadgeTone)[keyof typeof BadgeTone];

export type BadgeProps = PropsWithChildren<{
	className?: ClassNameValue;
	title?: string;
	tone?: BadgeTone;
}>;
