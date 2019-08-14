export default class Utils {
  static getUnixtimeOfDaysBeforeNow(days: number = 1): number {
    return new Date().getTime() - 60 * 60 * 24 * 1000 * days;
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
