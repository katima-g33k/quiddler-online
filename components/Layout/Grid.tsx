import { withStyles } from "./withStyles";

export const Grid = withStyles(
	"Grid",
	"grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]",
);
