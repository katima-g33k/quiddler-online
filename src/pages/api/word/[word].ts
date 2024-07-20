import type { NextApiRequest, NextApiResponse } from "next";
import { addAllowedWord, loadAllowedWords } from "@/server/allowedWords";

const addWord = (req: NextApiRequest, res: NextApiResponse) => {
  const word = req.query.word;

  try {
    addAllowedWord(`${word}`);
    res.status(200).json({});
  } catch (error) {
    res.status(500).json({ error });
  }
};

const verifyWord = async (req: NextApiRequest, res: NextApiResponse) => {
  const word = req.query.word;
  const allowedWords = loadAllowedWords();

  if (allowedWords.has(`${word}`)) {
    res.status(200).json({});
  } else {
    const result = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    res.status(result.status).json({});
  }
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
      return verifyWord(req, res);
    case "POST":
      return addWord(req, res);
    default:
      res.status(405).json({});
  }
}
