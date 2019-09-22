import Utils from "./utils";

export default class AnswerResult {
  private percentage: number;

  constructor(percentage: number) {
    this.percentage = percentage;
  }

  static get(currentSentence: string, answer: string): AnswerResult {
    const percentage = Utils.percentageOfSimilarity(currentSentence, answer);

    return new AnswerResult(percentage);
  }

  get isPoor(): boolean {
    return this.percentage < 60;
  }

  get isRegrettable(): boolean {
    return 60 <= this.percentage && this.percentage < 80;
  }

  get isGood(): boolean {
    return 80 <= this.percentage && this.percentage < 100;
  }

  get isExcellent(): boolean {
    return 100 <= this.percentage;
  }
}
