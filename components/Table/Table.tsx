import type { TableProps } from "./types";

export const Table = ({ children, ...props }: TableProps) => (
	<table
		{...props}
		className="w-full border-collapse text-sm [&_td]:border-b [&_td]:border-green-800 [&_td]:px-2 [&_td]:py-1.5 [&_th]:border-b [&_th]:border-green-800 [&_th]:px-2 [&_th]:py-1.5 [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-stone-400"
	>
		{children}
	</table>
);
