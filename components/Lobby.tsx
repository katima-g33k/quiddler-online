"use client";

import { useState } from "react";
import { api } from "@/lib/client";
import type { PublicState } from "@/lib/types";
import RulesPanel from "./RulesPanel";
import {
	Badge,
	Button,
	columns,
	cx,
	Dot,
	Notice,
	panel,
	playerRow,
	row,
	sectionTitle,
	stack,
	textInput,
} from "./ui";

interface Props {
	state: PublicState;
	token: string | null;
	busy: boolean;
	onSession: (token: string, state: PublicState) => void;
	action: (fn: () => Promise<{ state: PublicState }>) => Promise<void>;
	setError: (message: string | null) => void;
}

export default function Lobby({
	state,
	token,
	busy,
	onSession,
	action,
	setError,
}: Props) {
	const [name, setName] = useState("");
	const [joining, setJoining] = useState(false);

	const you = state.you;
	const bonusChosen =
		state.settings.bonusLongestWord || state.settings.bonusMostWords;
	const enoughPlayers = state.players.length >= 2;
	const canStart = enoughPlayers && bonusChosen;

	async function join(e: React.FormEvent) {
		e.preventDefault();
		if (!name.trim()) return;
		setJoining(true);
		setError(null);
		try {
			const res = await api.post<{ token: string; state: PublicState }>(
				"/api/players",
				{
					name: name.trim(),
				},
			);
			onSession(res.token, res.state);
			setName("");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not join.");
		} finally {
			setJoining(false);
		}
	}

	function pickBonus(key: "bonusLongestWord" | "bonusMostWords") {
		return action(() => api.post("/api/settings", { [key]: true }, token));
	}

	return (
		<div className={columns}>
			<div className={stack}>
				<div className={cx(panel, stack)}>
					<div>
						<h2 className="text-lg font-semibold tracking-tight">Lobby</h2>
						<p className="mt-1 text-sm text-stone-400">
							One table, 2 to 8 players. Everyone shares this link and picks a
							username.
						</p>
					</div>

					{!you && (
						<form onSubmit={join} className={row}>
							<div className="flex-[1_1_200px]">
								<input
									type="text"
									className={textInput}
									value={name}
									maxLength={20}
									placeholder="Your username"
									onChange={(e) => setName(e.target.value)}
									aria-label="Username"
								/>
							</div>
							<Button
								type="submit"
								variant="primary"
								disabled={joining || !name.trim()}
							>
								{joining ? "Joining…" : "Join game"}
							</Button>
						</form>
					)}

					{you && (
						<Notice tone="info">
							You are in as <strong>{you.name}</strong>
							{you.isHost
								? " and you are the host."
								: ". Waiting for the host to start."}
						</Notice>
					)}

					<div>
						<h3 className={sectionTitle}>
							At the table ({state.players.length}/8)
						</h3>
						<div className="mt-1.5">
							{state.players.length === 0 && (
								<div className="text-sm text-stone-400">Nobody yet.</div>
							)}
							{state.players.map((p) => (
								<div key={p.id} className={playerRow}>
									<Dot on={p.online} />
									<span className="min-w-0 flex-1 truncate">
										{p.name}
										{p.isYou && (
											<span className="text-xs text-stone-400"> (you)</span>
										)}
									</span>
									{p.isHost && <Badge>host</Badge>}
								</div>
							))}
						</div>
					</div>

					<div>
						<h3 className={sectionTitle}>Round bonuses</h3>
						{state.bonusesLocked ? (
							<p className="mt-1.5 text-sm text-stone-400">
								With 3 or more players both bonuses are always awarded (10
								points each).
							</p>
						) : (
							<p className="mt-1.5 text-sm text-stone-400">
								With 2 players exactly one bonus counts and the host picks it. A
								third player locks both on.
							</p>
						)}
						<div className="mt-1">
							{(
								[
									[
										"bonusLongestWord",
										"Longest word",
										"Most letters in a single word",
									],
									[
										"bonusMostWords",
										"Most words",
										"Most words laid down this round",
									],
								] as const
							).map(([key, label, hint]) => {
								const disabled = state.bonusesLocked || !you?.isHost || busy;
								return (
									<label
										key={key}
										className={cx(
											"flex cursor-pointer items-center gap-2 py-1.5",
											disabled && "cursor-not-allowed opacity-55",
										)}
									>
										<input
											type={state.bonusesLocked ? "checkbox" : "radio"}
											name="round-bonus"
											className="size-4 accent-amber-400"
											checked={state.settings[key]}
											disabled={disabled}
											onChange={() => pickBonus(key)}
										/>
										<span>
											{label}{" "}
											<span className="text-xs text-stone-400">— {hint}</span>
										</span>
									</label>
								);
							})}
						</div>
						{!state.bonusesLocked && !bonusChosen && you?.isHost && (
							<p className="mt-1.5 text-sm text-stone-400">
								Pick a bonus to start the game.
							</p>
						)}
					</div>

					{you && (
						<div className={cx(row, "justify-between")}>
							<Button
								variant="ghost"
								small
								disabled={busy}
								onClick={() => action(() => api.del("/api/players", token))}
							>
								Leave table
							</Button>
							{you.isHost && (
								<Button
									variant="primary"
									disabled={!canStart || busy}
									onClick={() =>
										action(() => api.post("/api/game/start", {}, token))
									}
								>
									{canStart
										? "Deal round 1"
										: !enoughPlayers
											? "Need 2 players"
											: "Pick a bonus"}
								</Button>
							)}
						</div>
					)}
				</div>

				<div className={panel}>
					<RulesPanel />
				</div>
			</div>

			<div className={stack}>
				<div className={panel}>
					<h3 className={sectionTitle}>The deck</h3>
					<p className="mt-2 text-sm text-stone-400">
						118 cards. Vowels are cheap (A, E, I, O = 2), the awkward letters
						pay (Q = 15, Z = 14, J = 13). Five cards carry two letters — QU (9),
						TH (9), CL (10), ER (7), IN (7) — and count as one card but two
						letters.
					</p>
				</div>
			</div>
		</div>
	);
}
