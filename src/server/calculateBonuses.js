// TODO: Optimize function to not loop every player if bonus is null
const calculateLongestWordBonus = (players) => players.reduce((longestWord, player) => {
  if (longestWord === undefined) {
    return longestWord;
  }

  const playerLongestWord = player.words.toSorted((a, b) => b.word.length - a.word.length)[0];
  const playerWordLength = playerLongestWord?.word.length || 0;
  const currentLongestWordLength = longestWord[0]?.word.length || 0;

  if (playerWordLength > currentLongestWordLength) {
    return [{ player, word: playerLongestWord.word }];
  }

  if (playerWordLength && playerWordLength === currentLongestWordLength) {
    return undefined;
  }

  return longestWord;
}, []);

// TODO: Optimize function to not loop every player if bonus is null
const calculateMostWordsBonus = (players) => players.reduce((mostWords, player) => {
  if (mostWords === undefined) {
    return mostWords;
  }

  const playerWordCount = player.words.length;
  const currentMostWordsCount = mostWords[0]?.count || 0;

  if (playerWordCount > currentMostWordsCount) {
    return [{ count: playerWordCount, player }];
  }

  if (playerWordCount && playerWordCount === currentMostWordsCount) {
    return undefined;
  }

  return mostWords;
}, []);

const calculateBonuses = (players, { longestWordBonus, mostWordsBonus }) => ({
  longestWord: longestWordBonus ? calculateLongestWordBonus(players) : undefined,
  mostWords: mostWordsBonus ? calculateMostWordsBonus(players) : undefined,
});

// eslint-disable-next-line no-undef
module.exports = {
  calculateBonuses
};
