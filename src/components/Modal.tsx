import React, { PropsWithChildren } from "react";

export type ModalProps = {
  open?: boolean;
};

const Modal = ({ children, open }: PropsWithChildren<ModalProps>) => {
  return open && (
    <div className="flex flex-col justify-center items-center absolute top-0 bottom-0 left-0 right-0 bg-[rgba(0,0,0,0.55)] z-10">
      <div className="w-[400px] bg-gray-300 p-4 rounded-md">
        {children}
      </div>
    </div>
  );
};

export default Modal;
