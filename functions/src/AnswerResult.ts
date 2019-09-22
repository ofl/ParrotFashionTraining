import Utils from "./Utils";

const REGRETTABLE_LEVEL: number = 60;
const GOOD_LEVEL: number = 80;
const PERFECT_LEVEL: number = 100;

export default class AnswerResult {
  constructor(private percentage: number) {}

  static get(currentSentence: string, answer: string): AnswerResult {
    const percentage = Utils.percentageOfSimilarity(currentSentence, answer);

    return new AnswerResult(percentage);
  }

  get isPoor(): boolean {
    return this.percentage < REGRETTABLE_LEVEL;
  }

  get isRegrettable(): boolean {
    return REGRETTABLE_LEVEL <= this.percentage && this.percentage < GOOD_LEVEL;
  }

  get isGood(): boolean {
    return GOOD_LEVEL <= this.percentage && this.percentage < PERFECT_LEVEL;
  }

  get isExcellent(): boolean {
    return PERFECT_LEVEL <= this.percentage;
  }
}
