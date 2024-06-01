import { useEffect, useState } from "react";

export const useAudio = (src: string) => {
  const [audio, setAudio] = useState<HTMLAudioElement>();

  useEffect(() => {
    setAudio(new Audio(src));
  }, [src]);

  return audio;
};
