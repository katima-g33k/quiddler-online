import React, { PropsWithChildren } from "react";
import classNames from "classnames";

type H1Props = {
  className?: string;
}

const H1 = ({ children, className }: PropsWithChildren<H1Props>) => {
  return (
    <h1 className={classNames(className, "text-3xl font-bold")}>
      {children}
    </h1>
  );
};

export default H1;
