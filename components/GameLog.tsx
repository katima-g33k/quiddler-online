import type { LogEntry } from "@/lib/types";
import { panel, sectionTitle } from "./ui";

export default function GameLog({ log }: { log: LogEntry[] }) {
	return (
		<div className={panel}>
			<h3 className={sectionTitle}>Table talk</h3>
			<div className="mt-2 flex max-h-64 flex-col-reverse gap-1 overflow-y-auto text-sm text-stone-400">
				{log.length === 0 && <div>Nothing has happened yet.</div>}
				{[...log].map((entry) => (
					<div key={entry.id} className="border-b border-green-800/50 pb-1">
						{entry.text}
					</div>
				))}
			</div>
		</div>
	);
}
