import { useMemo } from "react";
import { cx } from "../ui";
import { type ButtonProps, ButtonSize, ButtonVariant } from "./types";

export const Button = ({
	className,
	size = ButtonSize.md,
	type = "button",
	variant = ButtonVariant.Default,
	...props
}: ButtonProps) => {
	const sizeStyles = useMemo(() => {
		switch (size) {
			case ButtonSize.sm:
				return "px-2 py-1 text-sm";
			default:
				return "px-3.5 py-2";
		}
	}, [size]);

	const variantStyles = useMemo(() => {
		switch (variant) {
			case ButtonVariant.Danger:
				return "border-red-900 text-red-300";
			case ButtonVariant.Ghost:
				return "bg-transparent";
			case ButtonVariant.Primary:
				return "border-amber-400 bg-amber-400 font-semibold text-stone-900 enabled:hover:border-amber-300 enabled:hover:bg-amber-300";
			default:
				return "";
		}
	}, [variant]);

	return (
		<button
			className={cx(
				"border-green-800 bg-green-900 text-green-50 enabled:hover:border-yellow-700 enabled:hover:bg-green-800",
				"cursor-pointer rounded-lg border transition-colors duration-100 enabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40",
				sizeStyles,
				variantStyles,
				className,
			)}
			type={type}
			{...props}
		/>
	);
};
