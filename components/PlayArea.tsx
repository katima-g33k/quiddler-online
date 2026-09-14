"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError, api } from "@/lib/client";
import type { Card, PublicSelf, PublicState } from "@/lib/types";
import { Badge, BadgeTone } from "./Badge";
import { Button, ButtonSize, ButtonVariant } from "./Button";
import { CardRow } from "./CardRow";
import CardTile from "./CardTile";
import { Notice, NoticeTone } from "./Notice";
import { Panel } from "./Panel";
import { H2, H3 } from "./Typography";
import { cx, row, stack } from "./ui";

interface WordCheck {
	word: string;
	verdict: "valid" | "invalid" | "unavailable" | "too-short";
	message?: string;
}

type Zone = { kind: "word"; index: number } | { kind: "discard" };

interface Props {
	state: PublicState;
	you: PublicSelf;
	token: string | null;
	busy: boolean;
	action: (fn: () => Promise<{ state: PublicState }>) => Promise<void>;
	setError: (message: string | null) => void;
}

const MIN_WORD_LENGTH = 2;

/** A staging drop target. Active is the zone clicks go to; over is a live drag. */
function zoneClass(isActive: boolean, isOver: boolean) {
	return cx(
		"rounded-lg border border-dashed border-green-800 bg-black/15 p-2 transition-colors duration-100",
		isActive && "border-solid border-amber-400 bg-amber-400/5",
		isOver && "border-amber-400 bg-amber-400/15",
	);
}

/** Pile buttons are only a frame around a card, so they drop the button chrome. */
const pileButton =
	"cursor-pointer rounded-lg disabled:cursor-not-allowed disabled:opacity-55 enabled:hover:outline-2 enabled:hover:outline-offset-2 enabled:hover:outline-amber-400";

/* The gold bar marking the gap a dragged card would drop into. */
const insertBefore =
	"before:pointer-events-none before:absolute before:-top-1 before:-bottom-1 before:-left-1 before:w-1 before:rounded-xs before:bg-amber-400 before:shadow-lg before:shadow-amber-400/70 before:content-['']";
const insertAfter =
	"after:pointer-events-none after:absolute after:-top-1 after:-bottom-1 after:-right-1 after:w-1 after:rounded-xs after:bg-amber-400 after:shadow-lg after:shadow-amber-400/70 after:content-['']";

export default function PlayArea({
	state,
	you,
	token,
	busy,
	action,
	setError,
}: Props) {
	const [words, setWords] = useState<string[][]>([[]]);
	const [discardSlot, setDiscardSlot] = useState<string | null>(null);
	const [active, setActive] = useState<Zone>({ kind: "word", index: 0 });
	const [checks, setChecks] = useState<Record<string, WordCheck>>({});
	const [dragging, setDragging] = useState<string | null>(null);
	const [dragOver, setDragOver] = useState<string | null>(null);
	/** The player's preferred left-to-right order for their own hand. */
	const [handOrder, setHandOrder] = useState<string[]>([]);
	/** Where a dragged card would land in the hand, as a card-relative gap. */
	const [dropSlot, setDropSlot] = useState<{
		id: string;
		side: "before" | "after";
	} | null>(null);

	const myTurn = state.turnPlayerId === you.id;
	const canDraw = myTurn && state.turnState === "draw" && !you.finishedRound;
	const canAct = myTurn && state.turnState === "act" && !you.finishedRound;
	const isFinalTurn = state.isFinalTurn;

	const cardById = useCallback(
		(id: string): Card | undefined => you.hand.find((c) => c.id === id),
		[you.hand],
	);

	const placed = useMemo(() => {
		const set = new Set(words.flat());
		if (discardSlot) set.add(discardSlot);
		return set;
	}, [words, discardSlot]);

	/* Unstaged cards, in the order the player arranged them. Cards the order does
	   not know about yet (freshly drawn or dealt) keep their server order at the end. */
	const handCards = useMemo(() => {
		const rank = new Map(handOrder.map((id, i) => [id, i]));
		return you.hand
			.filter((c) => !placed.has(c.id))
			.sort(
				(a, b) =>
					(rank.get(a.id) ?? Number.POSITIVE_INFINITY) -
					(rank.get(b.id) ?? Number.POSITIVE_INFINITY),
			);
	}, [you.hand, placed, handOrder]);

	const wordEntries = useMemo(
		() =>
			words.map((ids) => {
				const cards = ids.map(cardById).filter((c): c is Card => Boolean(c));
				return {
					ids,
					cards,
					word: cards
						.map((c) => c.letter)
						.join("")
						.toLowerCase(),
					points: cards.reduce((n, c) => n + c.points, 0),
				};
			}),
		[words, cardById],
	);

	const filledWords = wordEntries.filter((w) => w.ids.length > 0);

	/* Staged cards that are no longer in hand (the play went through, or a new round). */
	useEffect(() => {
		const ids = new Set(you.hand.map((c) => c.id));
		setWords((prev) => {
			const next = prev.map((w) => w.filter((id) => ids.has(id)));
			const same = next.every((w, i) => w.length === prev[i].length);
			return same ? prev : next.length ? next : [[]];
		});
		setDiscardSlot((prev) => (prev && ids.has(prev) ? prev : null));
	}, [you.hand]);

	/* Keep the arranged order in step with the hand: cards already placed hold
	   their spot, cards that just arrived go on the end, cards that left drop out. */
	useEffect(() => {
		setHandOrder((prev) => {
			const ids = you.hand.map((c) => c.id);
			const inHand = new Set(ids);
			const kept = prev.filter((id) => inHand.has(id));
			const keptSet = new Set(kept);
			const next = [...kept, ...ids.filter((id) => !keptSet.has(id))];
			const same =
				next.length === prev.length && next.every((id, i) => id === prev[i]);
			return same ? prev : next;
		});
	}, [you.hand]);

	/* A new round is a clean slate. */
	// biome-ignore lint/correctness/useExhaustiveDependencies: state.round is the intentional trigger for this reset; the body only calls stable setters.
	useEffect(() => {
		setWords([[]]);
		setDiscardSlot(null);
		setActive({ kind: "word", index: 0 });
		setChecks({});
	}, [state.round]);

	const discardCard = discardSlot ? cardById(discardSlot) : null;

	const candidateKey = filledWords
		.map((w) => w.word)
		.filter((w) => w.length >= MIN_WORD_LENGTH)
		.sort()
		.join(",");

	/* Live dictionary check on whatever is staged. */
	useEffect(() => {
		const candidates = [...new Set(candidateKey.split(",").filter(Boolean))];
		const unknown = candidates.filter((w) => !checks[w]);
		if (unknown.length === 0) return;

		const timer = setTimeout(() => {
			api
				.post<{ checks: WordCheck[] }>("/api/words/validate", {
					words: unknown,
				})
				.then((res) => {
					setChecks((prev) => {
						const next = { ...prev };
						for (const c of res.checks) next[c.word] = c;
						return next;
					});
				})
				.catch(() => undefined);
		}, 350);
		return () => clearTimeout(timer);
	}, [candidateKey, checks]);

	/* ------------------------------- staging ------------------------------- */

	function moveToZone(cardId: string, zone: Zone) {
		setWords((prev) => {
			const stripped = prev.map((w) => w.filter((id) => id !== cardId));
			if (zone.kind === "word") {
				const next = [...stripped];
				next[zone.index] = [...(next[zone.index] ?? []), cardId];
				return next;
			}
			return stripped;
		});
		setDiscardSlot((prev) => {
			if (zone.kind === "discard") return cardId;
			return prev === cardId ? null : prev;
		});
	}

	function returnToHand(cardId: string) {
		setWords((prev) => prev.map((w) => w.filter((id) => id !== cardId)));
		setDiscardSlot((prev) => (prev === cardId ? null : prev));
	}

	/* ---------------------------- hand ordering ---------------------------- */

	/** Move a card so it sits just before `anchorId`, or last when that is null. */
	function placeInHand(cardId: string, anchorId: string | null) {
		if (anchorId === cardId) return;
		setHandOrder((prev) => {
			const base = prev.includes(cardId) ? prev : [...prev, cardId];
			const next = base.filter((id) => id !== cardId);
			const at = anchorId ? next.indexOf(anchorId) : -1;
			next.splice(at < 0 ? next.length : at, 0, cardId);
			return next;
		});
	}

	/** The card a drop on this gap should land in front of (null = the far end). */
	function anchorFor(slot: { id: string; side: "before" | "after" }) {
		const ids = handCards.map((c) => c.id);
		const i = ids.indexOf(slot.id);
		if (i < 0) return null;
		return slot.side === "before" ? ids[i] : (ids[i + 1] ?? null);
	}

	function dropInHand(e: React.DragEvent, anchorId: string | null) {
		e.preventDefault();
		e.stopPropagation();
		const id = e.dataTransfer.getData("text/plain") || dragging;
		setDragOver(null);
		setDragging(null);
		setDropSlot(null);
		if (!id) return;
		returnToHand(id);
		placeInHand(id, anchorId);
	}

	function clearStaging() {
		setWords([[]]);
		setDiscardSlot(null);
		setActive({ kind: "word", index: 0 });
	}

	function addWordRow() {
		setActive({ kind: "word", index: words.length });
		setWords((prev) => [...prev, []]);
	}

	function removeWordRow(index: number) {
		setWords((prev) => {
			const next = prev.filter((_, i) => i !== index);
			return next.length ? next : [[]];
		});
		setActive({ kind: "word", index: 0 });
	}

	/* ------------------------------- actions ------------------------------- */

	const draw = (source: "deck" | "discard") =>
		action(() => api.post("/api/turn/draw", { source }, token));

	const discardAndEnd = () =>
		action(() => api.post("/api/turn/discard", { cardId: discardSlot }, token));

	async function playWords() {
		const payloadWords = filledWords.map((w) => w.ids);
		await action(() =>
			api.post(
				"/api/turn/play",
				{
					words: payloadWords,
					discardCardId: discardSlot,
				},
				token,
			),
		);
	}

	async function addToDictionary(word: string) {
		try {
			setError(null);
			await api.post("/api/words/custom", { word }, token);
			setChecks((prev) => ({ ...prev, [word]: { word, verdict: "valid" } }));
		} catch (err) {
			setError(
				err instanceof ApiError ? err.message : "Could not add that word.",
			);
		}
	}

	/* ------------------------------- readiness ----------------------------- */

	const stagedInvalid = filledWords.filter((w) => {
		const check = checks[w.word];
		return (
			w.word.length < MIN_WORD_LENGTH || (check && check.verdict !== "valid")
		);
	});
	const allChecked = filledWords.every(
		(w) => checks[w.word]?.verdict === "valid",
	);

	const goOutReady =
		canAct &&
		!isFinalTurn &&
		filledWords.length > 0 &&
		Boolean(discardSlot) &&
		handCards.length === 0 &&
		allChecked;
	const discardReady = canAct && !isFinalTurn && Boolean(discardSlot);
	// A last turn is a normal turn: lay down what you can, then discard one card.
	const finishReady =
		canAct &&
		isFinalTurn &&
		Boolean(discardSlot) &&
		(filledWords.length === 0 || allChecked);

	const zoneProps = (key: string, zone: Zone) => ({
		onDragOver: (e: React.DragEvent) => {
			e.preventDefault();
			setDragOver(key);
		},
		onDragLeave: () => setDragOver((prev) => (prev === key ? null : prev)),
		onDrop: (e: React.DragEvent) => {
			e.preventDefault();
			const id = e.dataTransfer.getData("text/plain") || dragging;
			setDragOver(null);
			setDragging(null);
			if (!id) return;
			moveToZone(id, zone);
		},
	});

	/** Zones are click-to-select drop targets; give them an equivalent keyboard path.
	 *  Keys originating from nested controls (card buttons) are left alone. */
	const zoneSelectProps = (isActive: boolean, select: () => void) => ({
		role: "button" as const,
		tabIndex: 0,
		"aria-pressed": isActive,
		onClick: select,
		onKeyDown: (e: React.KeyboardEvent) => {
			if (e.target !== e.currentTarget) return;
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				select();
			}
		},
	});

	const cardDragProps = (id: string) => ({
		draggable: true,
		onDragStart: (e: React.DragEvent) => {
			e.dataTransfer.setData("text/plain", id);
			e.dataTransfer.effectAllowed = "move";
			setDragging(id);
		},
		onDragEnd: () => {
			setDragging(null);
			setDropSlot(null);
		},
		dragging: dragging === id,
	});

	/** The hand itself accepts drops: past the last card, the card goes on the end. */
	const handZoneProps = () => ({
		onDragOver: (e: React.DragEvent) => {
			e.preventDefault();
			setDragOver("hand");
			const last = handCards[handCards.length - 1];
			setDropSlot(last ? { id: last.id, side: "after" } : null);
		},
		onDragLeave: (e: React.DragEvent) => {
			if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
			setDragOver((prev) => (prev === "hand" ? null : prev));
			setDropSlot(null);
		},
		onDrop: (e: React.DragEvent) => dropInHand(e, null),
	});

	/** Each hand card is also a drop target: the half of it you hover over picks
	 *  the gap the dragged card slots into. */
	const handSlotProps = (id: string) => ({
		onDragOver: (e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			const box = e.currentTarget.getBoundingClientRect();
			const side = e.clientX < box.left + box.width / 2 ? "before" : "after";
			setDragOver("hand");
			setDropSlot((prev) =>
				prev?.id === id && prev.side === side ? prev : { id, side },
			);
		},
		onDragLeave: () => setDropSlot((prev) => (prev?.id === id ? null : prev)),
		onDrop: (e: React.DragEvent) => {
			const box = e.currentTarget.getBoundingClientRect();
			const side = e.clientX < box.left + box.width / 2 ? "before" : "after";
			dropInHand(e, anchorFor({ id, side }));
		},
	});

	const turnPlayer = state.players.find((p) => p.id === state.turnPlayerId);

	return (
		<div className={stack}>
			{/* ------------------------------ status ------------------------------ */}
			<Panel className={cx(row, "justify-between")}>
				<div>
					<H2>
						Round {state.round} of {state.totalRounds}
						<span className="text-sm text-stone-400">
							{" "}
							· {state.handSize}-card hands
						</span>
					</H2>
					<div className="text-sm text-stone-400">
						{you.finishedRound
							? "You are done for this round."
							: myTurn
								? state.turnState === "draw"
									? "Your turn — draw from the deck or the discard pile."
									: isFinalTurn
										? "Your last turn — lay down every word you can, then discard. Leftover cards count against you."
										: "Draw done. Discard to end your turn, or use your whole hand to go out."
								: `Waiting for ${turnPlayer?.name ?? "the next player"}…`}
					</div>
				</div>
				<div className={cx(row, "gap-1.5")}>
					{state.settings.bonusLongestWord && (
						<Badge tone={BadgeTone.Warning}>longest word +10</Badge>
					)}
					{state.settings.bonusMostWords && (
						<Badge tone={BadgeTone.Warning}>most words +10</Badge>
					)}
				</div>
			</Panel>

			{state.wentOutPlayerId && (
				<Notice tone={NoticeTone.Info}>
					{state.players.find((p) => p.id === state.wentOutPlayerId)?.name} went
					out. Everyone else gets one last turn: draw, lay down what you can,
					then discard one card. Unused cards are subtracted.
				</Notice>
			)}

			{/* ------------------------------- piles ----------------------------- */}
			<Panel>
				<div className="flex items-start justify-center gap-6 pt-2 pb-4">
					<div className="flex flex-col items-center gap-1.5" data-pile="deck">
						<span className="text-xs uppercase tracking-wider text-stone-400">
							Deck · {state.drawPileCount}
						</span>
						<button
							type="button"
							className={pileButton}
							onClick={() => draw("deck")}
							disabled={!canDraw || busy || state.drawPileCount === 0}
							title="Draw the top card of the deck"
						>
							<div className="h-18.5 w-13.5 rounded-lg border border-green-800 bg-[repeating-linear-gradient(45deg,var(--color-green-800)_0_6px,var(--color-green-900)_6px_12px)] shadow-md" />
						</button>
					</div>
					<div
						className="flex flex-col items-center gap-1.5"
						data-pile="discard"
					>
						<span className="text-xs uppercase tracking-wider text-stone-400">
							Discard · {state.discardCount}
						</span>
						<button
							type="button"
							className={pileButton}
							onClick={() => draw("discard")}
							disabled={!canDraw || busy || !state.discardTop}
							title={
								state.discardTop
									? "Take the top discard"
									: "The discard pile is empty"
							}
						>
							{state.discardTop ? (
								<CardTile asImg card={state.discardTop} />
							) : (
								<div className="flex h-18.5 w-13.5 items-center justify-center rounded-lg border border-dashed border-green-800 text-center text-xs text-stone-400">
									empty
								</div>
							)}
						</button>
					</div>
				</div>

				{/* -------------------------- word builder ------------------------- */}
				<div className="flex flex-col gap-2.5">
					<div className={cx(row, "justify-between")}>
						<H3>Words</H3>
						<div className={cx(row, "gap-1.5")}>
							<Button
								variant={ButtonVariant.Ghost}
								size={ButtonSize.sm}
								onClick={addWordRow}
								disabled={!canAct}
							>
								+ Another word
							</Button>
							<Button
								variant={ButtonVariant.Ghost}
								size={ButtonSize.sm}
								onClick={clearStaging}
								disabled={placed.size === 0}
							>
								Clear
							</Button>
						</div>
					</div>

					{wordEntries.map((entry, index) => {
						const key = `word:${index}`;
						const isActive = active.kind === "word" && active.index === index;
						const check =
							entry.word.length >= MIN_WORD_LENGTH
								? checks[entry.word]
								: undefined;
						const tooShort =
							entry.ids.length > 0 && entry.word.length < MIN_WORD_LENGTH;
						return (
							<div
								key={key}
								data-zone={`word-${index}`}
								className={zoneClass(isActive, dragOver === key)}
								{...zoneSelectProps(isActive, () =>
									setActive({ kind: "word", index }),
								)}
								{...zoneProps(key, { kind: "word", index })}
							>
								<div className="mb-1.5 flex items-center justify-between gap-2">
									<span className="flex items-center gap-1.5 text-xs font-semibold text-stone-400">
										Word {index + 1}
										{entry.word && (
											<span className="font-mono uppercase tracking-wider text-green-50">
												{entry.word}
											</span>
										)}
										{entry.ids.length > 0 && <Badge>{entry.points} pts</Badge>}
										{tooShort && (
											<Badge tone={BadgeTone.Error}>
												needs {MIN_WORD_LENGTH}+ letters
											</Badge>
										)}
										{check?.verdict === "valid" && (
											<Badge tone={BadgeTone.Success}>✓ word</Badge>
										)}
										{check && check.verdict !== "valid" && (
											<Badge tone={BadgeTone.Error}>
												{check.verdict === "unavailable"
													? "dictionary offline"
													: "not a word"}
											</Badge>
										)}
										{!check && !tooShort && entry.ids.length > 0 && (
											<Badge>checking…</Badge>
										)}
									</span>
									<div className={cx(row, "gap-1")}>
										{check && check.verdict !== "valid" && (
											<Button
												variant={ButtonVariant.Ghost}
												size={ButtonSize.sm}
												onClick={(e) => {
													e.stopPropagation();
													void addToDictionary(entry.word);
												}}
												title="Add this word to data/custom-words.txt"
											>
												+ house dictionary
											</Button>
										)}
										{wordEntries.length > 1 && (
											<Button
												variant={ButtonVariant.Ghost}
												size={ButtonSize.sm}
												onClick={(e) => {
													e.stopPropagation();
													removeWordRow(index);
												}}
												aria-label={`Remove word ${index + 1}`}
											>
												✕
											</Button>
										)}
									</div>
								</div>
								<CardRow
									cards={entry.cards}
									emptyTitle="Click a card in your hand, or drag it here."
									renderCard={(card) => (
										<CardTile
											key={card.id}
											card={card}
											small
											onClick={() => returnToHand(card.id)}
											title="Return to hand"
											{...cardDragProps(card.id)}
										/>
									)}
								/>
							</div>
						);
					})}

					{/* --------------------------- discard slot ---------------------- */}
					<div
						data-zone="discard"
						className={zoneClass(
							active.kind === "discard",
							dragOver === "discard",
						)}
						{...zoneSelectProps(active.kind === "discard", () =>
							setActive({ kind: "discard" }),
						)}
						{...zoneProps("discard", { kind: "discard" })}
					>
						<div className="mb-1.5 flex items-center justify-between gap-2">
							<span className="flex items-center gap-1.5 text-xs font-semibold text-stone-400">
								Discard
								{isFinalTurn && <Badge>still required on a last turn</Badge>}
							</span>
						</div>
						{/* TODO: Convert to CardRow component */}
						<div
							className={cx(
								// CardRow
								"flex min-h-18.5 flex-wrap items-center gap-1.5",
								"min-h-14",
							)}
						>
							{discardCard ? (
								<CardTile
									card={discardCard}
									small
									onClick={() => returnToHand(discardCard.id)}
									title="Return to hand"
									{...cardDragProps(discardCard.id)}
								/>
							) : (
								<span className="text-xs text-stone-400">
									The one card you throw away.
								</span>
							)}
						</div>
					</div>
				</div>
			</Panel>

			{/* -------------------------------- hand ----------------------------- */}
			<Panel>
				<div className={cx(row, "justify-between")}>
					<H3>
						Your hand · {you.hand.length} card{you.hand.length === 1 ? "" : "s"}
					</H3>
					<span className="text-xs text-stone-400">
						{active.kind === "discard"
							? "Clicking a card sets it as your discard"
							: `Clicking a card adds it to word ${active.index + 1}`}
						{" · drag a card onto another to re-order"}
					</span>
				</div>
				<CardRow
					data-zone="hand"
					cards={handCards}
					className={cx(
						"mt-2",
						dragOver === "hand" &&
							"rounded-lg outline-1 outline-offset-4 outline-dashed outline-amber-400",
					)}
					emptyTitle={
						you.hand.length === 0 ? "No cards." : "Every card is staged."
					}
					renderCard={(card) => {
						const marker = dropSlot?.id === card.id && dragging !== card.id;

						return (
							<div
								key={card.id}
								className={cx(
									"relative flex flex-none",
									marker && dropSlot?.side === "before" && insertBefore,
									marker && dropSlot?.side === "after" && insertAfter,
								)}
								{...handSlotProps(card.id)}
							>
								<CardTile
									card={card}
									onClick={() => moveToZone(card.id, active)}
									{...cardDragProps(card.id)}
								/>
							</div>
						);
					}}
				/>

				<div className={cx(row, "mt-3.5")}>
					{!isFinalTurn && (
						<>
							<Button
								variant={ButtonVariant.Primary}
								disabled={!goOutReady || busy}
								onClick={() => void playWords()}
								title="Lay down your whole hand and end the round"
							>
								Go out
							</Button>
							<Button
								disabled={!discardReady || busy}
								onClick={() => void discardAndEnd()}
							>
								Discard & end turn
							</Button>
						</>
					)}
					{isFinalTurn && (
						<Button
							variant={ButtonVariant.Primary}
							disabled={!finishReady || busy}
							onClick={() => void playWords()}
						>
							{filledWords.length ? "Lay down & discard" : "Discard & end turn"}
						</Button>
					)}
					{canAct && !isFinalTurn && !goOutReady && filledWords.length > 0 && (
						<span className="text-xs text-stone-400">
							{handCards.length > 0
								? `To go out, place all ${you.hand.length} cards: ${handCards.length} still in hand.`
								: !discardSlot
									? "Going out needs one card in the discard slot."
									: stagedInvalid.length
										? "One of your words is not a valid word."
										: "Checking words…"}
						</span>
					)}
					{canAct && isFinalTurn && !finishReady && (
						<span className="text-xs text-stone-400">
							{!discardSlot
								? "Your last turn still ends with a discard — put one card in the discard slot."
								: stagedInvalid.length
									? "One of your words is not a valid word."
									: "Checking words…"}
						</span>
					)}
				</div>
			</Panel>

			{/* --------------------------- laid down ----------------------------- */}
			{state.players.some((p) => p.laid.length > 0) && (
				<Panel className="flex flex-col gap-2.5">
					<H3>Laid down this round</H3>
					{state.players
						.filter((p) => p.laid.length > 0)
						.map((p) => (
							<div key={p.id}>
								<div className="text-sm text-stone-400">
									{p.name}
									{p.isYou && " (you)"}
								</div>
								<div className={cx(row, "mt-1 gap-4")}>
									{p.laid.map((w) => (
										<div
											key={w.cards.map((c) => c.id).join("-")}
											className={cx(row, "gap-1")}
										>
											{w.cards.map((c) => (
												<CardTile key={c.id} card={c} small />
											))}
											<Badge>{w.points}</Badge>
										</div>
									))}
								</div>
							</div>
						))}
				</Panel>
			)}
		</div>
	);
}
