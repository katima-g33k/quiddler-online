export default function RulesPanel() {
	return (
		<details>
			<summary className="cursor-pointer text-sm text-stone-400">
				How to play / house rules
			</summary>
			<ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-stone-400">
				<li>
					Eight rounds. Round 1 deals 3 cards, growing by one each round up to
					10 in round 8.
				</li>
				<li>
					Each turn: draw one card from the deck or the discard pile, then
					either discard one card to end your turn, or go out.
				</li>
				<li>
					<strong>Going out</strong> means laying down words that use every card
					in your hand except one, which you discard.
				</li>
				<li>
					After someone goes out, everyone else gets{" "}
					<strong>one last turn</strong>: draw a card, lay down whatever words
					you can, and still discard one card to end the turn. Every card left
					in your hand after that is subtracted from your score.
				</li>
				<li>
					Words are at least 2 letters. A two-letter card counts as one card but
					two letters, so
					<em> IN</em> alone is a legal word and helps you win the longest-word
					bonus.
				</li>
				<li>
					Words are checked against dictionaryapi.dev. If a real word is missing
					there, add it to the house dictionary and play it.
				</li>
				<li>
					Bonuses are worth 10 points each and are only awarded when a single
					player holds them outright — a tie awards nothing.
				</li>
				<li>Highest total after round 8 wins.</li>
			</ul>
		</details>
	);
}
