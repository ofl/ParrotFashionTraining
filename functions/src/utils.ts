const crypto = require("crypto");

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

  static md5hex(str: string) {
    const md5 = crypto.createHash("md5");
    return md5.update(str, "binary").digest("hex");
  }

  static findValueOfKeyInText(
    text: string,
    dict: { [key: string]: string }
  ): string | null {
    const result: string | undefined = Object.keys(dict).find(domain => {
      return text.indexOf(domain) >= 0;
    });
    if (typeof result === "undefined") {
      return null;
    }

    return dict[result];
  }

  static selectRandomly<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private static sentenceToWordArray(sentence: string): string[] {
    const words = sentence.match(/\S+/g);
    if (words === null) {
      return [];
    }

    return words.map(word => {
      return word.toLowerCase();
    });
  }
}
