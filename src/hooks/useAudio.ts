import { useMemo } from "react";

export const useAudio = (src: string) => {
  return useMemo(() => new Audio(src), [src]);
};
