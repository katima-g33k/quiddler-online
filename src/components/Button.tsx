import React, { MouseEvent } from "react";
import classNames from "classnames";

type ButtonProps = {
  className?: string;
  disabled?: boolean;
  label: string;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  type?: HTMLButtonElement["type"];
};

const Button = ({ className, disabled, label, onClick, type = "button" }: ButtonProps) => (
  <button
    className={classNames(
      className,
      "px-4 py-2 rounded-lg text-white",
      { "hover:bg-blue-600": !disabled },
      disabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-800"
    )}
    disabled={disabled}
    onClick={onClick}
    type={type}
  >
    {label}
  </button>
);

export default Button;
