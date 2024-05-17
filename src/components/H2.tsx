import React, { PropsWithChildren } from "react";

const H2 = ({ children }: PropsWithChildren) => {
  return <h2 className="text-xl">{children}</h2>;
};

export default H2;
