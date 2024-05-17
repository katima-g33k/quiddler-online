import React, { useRef, useState } from "react";
import classNames from "classnames";
import type { Card } from "@/types";

type CardProps = {
  card?: Card;
  disabled?: boolean;
  index?: number;
  onClick?: (e: MouseEvent) => void;
  type?: "button" | "checkbox";
}

const Card = ({ card, disabled, index, onClick, type = "button" }: CardProps) => {
  const [checked, setChecked] = useState(false);
  const handleOnClick = (e: MouseEvent) => {
    setChecked(e.target.checked);
    onClick?.(e);
  };

  return (
    <label className={classNames(
      "flex relative rounded items-center justify-center w-24 h-32 border border-solid border-blac text-black",
      { "cursor-pointer": !disabled && onClick },
      { "bg-blue-900": !card },
      { "bg-gray-400": checked },
      { "bg-gray-300": !checked && card },
    )}>
      {index && (
        <span className="flex justify-center items-center z-10 -mt-2 -ml-2 absolute top-0 left-0 bg-blue-800 text-white size-6 rounded-full">
          {index}
        </span>
      )}
      {card && (
        <>
          <span className="font-semibold text-xl uppercase">{card.char}</span>
          <span className="text-xs absolute bottom-1 right-1">{card.points} pts</span>
        </>
      )}
      <input
        className="appearance-none"
        disabled={disabled}
        onClick={handleOnClick}
        type={type}
      />
    </label>
  );
};

export default Card;
