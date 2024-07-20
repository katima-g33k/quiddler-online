import fs from "node:fs";

export const loadAllowedWords = (): Set<string> => {
  try {
    const allowedWords = fs.readFileSync("./allowed-words.json", "utf8");
    return new Set(JSON.parse(allowedWords));
  } catch (err) {
    return new Set([]);
  }
};

export const addAllowedWord = (word: string) => {
  const allowedWords = loadAllowedWords();
  allowedWords.add(word);

  fs.writeFileSync("./allowed-words.json", JSON.stringify(Array.from(allowedWords)));
};
