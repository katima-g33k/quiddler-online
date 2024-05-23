import React, { useState } from "react";
import H1 from "@/components/H1";
import H2 from "@/components/H2";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import { useGame } from "@/contexts/GameContext";
import type { ModalProps } from "@/components/Modal";

const RoundEndModal = (props: ModalProps) => {
  const [hasClicked, setHasClicked] = useState(false);
  const { bonuses, players, round, socket } = useGame();
  const sortedPlayers = players.toSorted((a, b) => b.score - a.score);

  const handleStartRound = () => {
    if (!hasClicked) {
      socket.emit("start-round");
      setHasClicked(true);
    }
  };

  return (
    <Modal {...props}>
      <div className="flex flex-col gap-3">
        <H1 className="self-center">End of round {round}</H1>
        {!!bonuses?.longestWord && (
          <div>
            <H2>Longest word bonus</H2>
            {bonuses.longestWord.map(({ player, word }) => (
              <p key={player.id}>
                <span className="capitalize">{player.name}</span> with <span className="uppercase">{word}</span>
              </p>
            ))}
          </div>
        )}

        {!!bonuses?.mostWords && (
          <div>
            <H2>Most words bonus</H2>
            {bonuses.mostWords.map(({ count, player }) => (
              <p key={player.id}>
                <span className="capitalize">{player.name}</span> with <span className="uppercase">{count}</span> words
              </p>
            ))}
          </div>
        )}

        <div>
          <H2>Scores</H2>
          <ol className="list-decimal ml-4">
            {sortedPlayers.map(player => (
              <li key={player.id}><span className="capitalize">{player.name}</span> ({player.score} pts)</li>
            ))}
          </ol>
        </div>

        <Button
          className="self-center mt-2"
          disabled={hasClicked}
          label={hasClicked ? "Waiting for other players" : "Start next round"}
          onClick={handleStartRound}
        />
      </div>
    </Modal>
  );
};

export default RoundEndModal;
