import React, { PropsWithChildren } from "react";
import classNames from "classnames";

type H2Props = {
  className?: string;
};

const H2 = ({ children, className }: PropsWithChildren<H2Props>) => {
  return (
    <h2 className={classNames(className, "text-xl")}>
      {children}
    </h2>
  );
};

export default H2;
