import type { PropsWithChildren } from "react";

export const H3 = ({ children }: PropsWithChildren) => (
	<h3 className="text-sm font-semibold uppercase tracking-wider text-stone-400">
		{children}
	</h3>
);
