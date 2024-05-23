const calculateLongestWordBonus = (players) => players.reduce((longestWord, player) => {
  const playerLongestWord = player.words.toSorted((a, b) => b.word.length - a.word.length)[0];
  const playerWordLength = playerLongestWord?.word.length || 0;
  const currentLongestWordLength = longestWord[0]?.word.length || 0;

  if (playerWordLength > currentLongestWordLength) {
    return [{ player, word: playerLongestWord.word }];
  }

  if (playerWordLength && playerWordLength === currentLongestWordLength) {
    return [
      ...longestWord,
      { player, word: playerLongestWord.word },
    ];
  }

  return longestWord;
}, []);

const calculateMostWordsBonus = (players) => players.reduce((mostWords, player) => {
  const playerWordCount = player.words.length;
  const currentMostWordsCount = mostWords[0]?.count || 0;

  if (playerWordCount > currentMostWordsCount) {
    return [{ count: playerWordCount, player }];
  }

  if (playerWordCount && playerWordCount === currentMostWordsCount) {
    return [
      ...mostWords,
      { count: playerWordCount, player },
    ];
  }

  return mostWords;
}, []);

const calculateBonuses = (players, { useLongestWordBonus, useMostWordsBonus }) => ({
  longestWord: useLongestWordBonus ? calculateLongestWordBonus(players) : undefined,
  mostWords: useMostWordsBonus ? calculateMostWordsBonus(players) : undefined,
});

module.exports = {
  calculateBonuses
};
