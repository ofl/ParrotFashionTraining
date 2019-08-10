export default class Utils {
  private static ONE_DAY_MS = 60 * 60 * 24 * 1000;

  static oneDayBeforeNow(): number {
    return new Date().getTime() - this.ONE_DAY_MS;
  }

  static percentageOfSimilarity(
    originalSentence: string,
    targetSentence: string
  ): number {
    const orginalWords = new Set(this.sentenceToWordArray(originalSentence));
    const targetWords = new Set(this.sentenceToWordArray(targetSentence));
    const intersection = new Set(
      [...orginalWords].filter(e => targetWords.has(e))
    );

    return Math.round((intersection.size / orginalWords.size) * 100);
  }

  static sentenceToWordArray(sentence: string): string[] {
    const words = sentence.match(/\S+/g);
    if (words === null) {
      return [];
    }

    return words.map(word => {
      return word.toLowerCase();
    });
  }
}
