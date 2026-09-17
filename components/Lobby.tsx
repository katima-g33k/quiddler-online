"use client";

import { useState } from "react";
import { api } from "@/lib/client";
import type { PublicState } from "@/lib/types";
import { Button, ButtonSize, ButtonVariant } from "./Button";
import { Grid, Panel, Row, Stack } from "./Layout";
import { Notice, NoticeTone } from "./Notice";
import { PlayerInformation } from "./PlayerInformation";
import RulesPanel from "./RulesPanel";
import { H2, H3 } from "./Typography";
import { cx } from "./ui";

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
		<Grid>
			<Stack>
				<Panel as={Stack}>
					<div>
						<H2>Lobby</H2>
						<p className="mt-1 text-sm text-stone-400">
							One table, 2 to 8 players. Everyone shares this link and picks a
							username.
						</p>
					</div>

					{!you && (
						<Row as={"form"} onSubmit={join}>
							<div className="flex-[1_1_200px]">
								<input
									type="text"
									className="w-full rounded-lg border border-green-800 bg-green-950 px-3 py-2 text-green-50 focus:outline-2 focus:outline-offset-1 focus:outline-yellow-700"
									value={name}
									maxLength={20}
									placeholder="Your username"
									onChange={(e) => setName(e.target.value)}
									aria-label="Username"
								/>
							</div>
							<Button
								type="submit"
								variant={ButtonVariant.Primary}
								disabled={joining || !name.trim()}
							>
								{joining ? "Joining…" : "Join game"}
							</Button>
						</Row>
					)}

					{you && (
						<Notice tone={NoticeTone.Info}>
							You are in as <strong>{you.name}</strong>
							{you.isHost
								? " and you are the host."
								: ". Waiting for the host to start."}
						</Notice>
					)}

					<div>
						<H3>At the table ({state.players.length}/8)</H3>
						<div className="mt-1.5">
							{state.players.length === 0 && (
								<div className="text-sm text-stone-400">Nobody yet.</div>
							)}
							{state.players.map((player) => (
								<PlayerInformation key={player.id} player={player} />
							))}
						</div>
					</div>

					<div>
						<H3>Round bonuses</H3>
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
						<Row className="justify-between">
							<Button
								variant={ButtonVariant.Ghost}
								size={ButtonSize.sm}
								disabled={busy}
								onClick={() => {
									action(() => api.del("/api/players", token));
								}}
							>
								Leave table
							</Button>
							{you.isHost && (
								<Button
									variant={ButtonVariant.Primary}
									disabled={!canStart || busy}
									onClick={() => {
										action(() => api.post("/api/game/start", {}, token));
									}}
								>
									{canStart
										? "Deal round 1"
										: !enoughPlayers
											? "Need 2 players"
											: "Pick a bonus"}
								</Button>
							)}
						</Row>
					)}
				</Panel>

				<RulesPanel />
			</Stack>

			<Stack>
				<Panel>
					<H3>The deck</H3>
					<p className="mt-2 text-sm text-stone-400">
						118 cards. Vowels are cheap (A, E, I, O = 2), the awkward letters
						pay (Q = 15, Z = 14, J = 13). Five cards carry two letters — QU (9),
						TH (9), CL (10), ER (7), IN (7) — and count as one card but two
						letters.
					</p>
				</Panel>
			</Stack>
		</Grid>
	);
}
