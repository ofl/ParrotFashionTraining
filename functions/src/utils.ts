const crypto = require("crypto");
const levenshtein = require("js-levenshtein");

export default class Utils {
  static textSimilarity(
    originalSentence: string,
    targetSentence: string
  ): number {
    const result: number = levenshtein(originalSentence, targetSentence);
    const originalSentenceLength = originalSentence.length;
    const difference: number = Math.max(result - originalSentenceLength / 8, 0);
    const rate =
      ((originalSentenceLength - difference) / originalSentenceLength) * 100;

    return Math.floor(rate);
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

  static randomMessage(key: string, length: number): string {
    return `${key}_${this.dice(length)}`;
  }

  static dice(length: number): number {
    return Math.floor(Math.random() * length) + 1;
  }

  static maxWordCountInSentences(sentences: string[]): number {
    let maxWordCount = 0;

    sentences.forEach(sentence => {
      const wordCount = this.countWord(sentence);
      if (maxWordCount < wordCount) {
        maxWordCount = wordCount;
      }
    });
    return maxWordCount;
  }

  static countWord(text: string): number {
    return text.split(/\b\s\b/).length;
  }
}
