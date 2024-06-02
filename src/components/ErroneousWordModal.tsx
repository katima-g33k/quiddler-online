import React from "react";
import Button from "@/components/Button";
import Modal from "@/components/Modal";

type ErroneousWordModalProps = {
  onConfirm: () => void;
  word?: string;
}

const ErroneousWordModal = ({ onConfirm, word }: ErroneousWordModalProps) => {
  return (
    <Modal open={!!word}>
      <div className='flex flex-col items-center gap-4'>
        <p>Sorry, <strong>{word}</strong> is not a word</p>
        <Button label="Okay" onClick={onConfirm} />
      </div>
    </Modal>
  );
};

export default ErroneousWordModal;
