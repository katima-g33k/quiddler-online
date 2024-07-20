export const useDictionary = () => {
  const addWordToDictionary = async (word: string) => {
    const res = await fetch(`/api/word/${word}`, { method: "POST" });

    if (!res.ok) {
      throw { status: res.status, statusText: res.statusText };
    }

    return res.json();
  };

  const searchDictionary = async (word: string) => {
    const res = await fetch(`/api/word/${word}`);
    return res.ok;
  };

  return { addWordToDictionary, searchDictionary };
};
