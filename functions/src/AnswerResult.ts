const levenshtein = require("js-levenshtein");

const REGRETTABLE_LEVEL: number = 75;
const GOOD_LEVEL: number = 85;
const PERFECT_LEVEL: number = 95;

export default class AnswerResult {
  constructor(private similarity: number) {}

  static get(questionText: string, answerText: string): AnswerResult {
    return new AnswerResult(this.textSimilarity(questionText, answerText));
  }

  static textSimilarity(original: string, target: string): number {
    const originalText = this.removePunctuations(original);
    const targetText = this.removePunctuations(target);

    const result: number = levenshtein(originalText, targetText);
    const originalTextLength = originalText.length;
    const difference: number = Math.max(result - originalTextLength / 8, 0);
    const rate = ((originalTextLength - difference) / originalTextLength) * 100;

    return Math.floor(rate);
  }

  private static removePunctuations(string: string): string {
    const matchedArray = string.match(/\w+/g);
    if (matchedArray === null) {
      return "";
    }
    return matchedArray.join(" ");
  }

  get isPoor(): boolean {
    return this.similarity < REGRETTABLE_LEVEL;
  }

  get isRegrettable(): boolean {
    return REGRETTABLE_LEVEL <= this.similarity && this.similarity < GOOD_LEVEL;
  }

  get isGood(): boolean {
    return GOOD_LEVEL <= this.similarity && this.similarity < PERFECT_LEVEL;
  }

  get isExcellent(): boolean {
    return PERFECT_LEVEL <= this.similarity;
  }
}
