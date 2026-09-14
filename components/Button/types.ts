import type { ButtonHTMLAttributes } from "react";
import type { Brand } from "@/app/types";

type ButtonBrand = "Button";

const BUTTON_SIZES = {
	sm: "SM",
	md: "MD",
} as const;

export const ButtonSize = {
	sm: BUTTON_SIZES.sm as Brand<typeof BUTTON_SIZES.sm, ButtonBrand>,
	md: BUTTON_SIZES.md as Brand<typeof BUTTON_SIZES.md, ButtonBrand>,
} as const;

export type ButtonSize = (typeof ButtonSize)[keyof typeof ButtonSize];

const BUTTON_VARIANTS = {
	Danger: "DANGER",
	Default: "DEFAULT",
	Ghost: "GHOST",
	Primary: "PRIMARY",
} as const;

export const ButtonVariant = {
	Danger: BUTTON_VARIANTS.Danger as Brand<
		typeof BUTTON_VARIANTS.Danger,
		ButtonBrand
	>,
	Default: BUTTON_VARIANTS.Default as Brand<
		typeof BUTTON_VARIANTS.Default,
		ButtonBrand
	>,
	Ghost: BUTTON_VARIANTS.Ghost as Brand<
		typeof BUTTON_VARIANTS.Ghost,
		ButtonBrand
	>,
	Primary: BUTTON_VARIANTS.Primary as Brand<
		typeof BUTTON_VARIANTS.Primary,
		ButtonBrand
	>,
} as const;

export type ButtonVariant = (typeof ButtonVariant)[keyof typeof ButtonVariant];

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	size?: ButtonSize;
	variant?: ButtonVariant;
}
