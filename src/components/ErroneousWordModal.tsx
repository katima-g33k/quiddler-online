import React, { useState } from "react";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import { useDictionary } from "@/hooks/useDictionary";

type ErroneousWordModalProps = {
  onAdd: () => void;
  onConfirm: () => void;
  word?: string;
}

const ErroneousWordModal = ({ onAdd, onConfirm, word }: ErroneousWordModalProps) => {
  const [error, setError] = useState<unknown>();
  const { addWordToDictionary } = useDictionary();

  const handleAddWord = async () => {
    if (!word) {
      return;
    }

    try {
      addWordToDictionary(word);
      onAdd();
    } catch (e) {
      setError(e);
    }
  };

  const handleOnConfirm = () => {
    setError(undefined);
    onConfirm();
  };

  return (
    <Modal open={!!word}>
      <div className='flex flex-col items-center gap-4'>
        <p>Sorry, <strong className="uppercase">{word}</strong> is not a word</p>
        {!!error && <p className="text-red-600">An error occurred, unable to add word</p>}
        <div className="flex justify-around w-full">
          <Button label="Add word" onClick={handleAddWord} />
          <Button label="Okay" onClick={handleOnConfirm} />
        </div>
      </div>
    </Modal>
  );
};

export default ErroneousWordModal;
