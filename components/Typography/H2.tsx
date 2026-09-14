import type { PropsWithChildren } from "react";

export const H2 = ({ children }: PropsWithChildren) => (
	<h2 className="text-lg font-semibold tracking-tight">{children}</h2>
);
