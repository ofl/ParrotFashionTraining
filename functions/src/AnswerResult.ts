const levenshtein = require("js-levenshtein");

const REGRETTABLE_LEVEL: number = 75;
const GOOD_LEVEL: number = 85;
const PERFECT_LEVEL: number = 95;

export default class AnswerResult {
  constructor(public similarity: number) {}

  static get(questionText: string, answerText: string): AnswerResult {
    return new AnswerResult(this.textSimilarity(questionText, answerText));
  }

  // privateだがテストのため宣言していない。
  static textSimilarity(original: string, target: string): number {
    const originalText = this.normalize(original);
    const targetText = this.normalize(target);
    const originalTextLength = originalText.length;

    // 出題文と回答の文字単位の相違数
    const difference: number = levenshtein(originalText, targetText);

    // 出題に対する正解率
    return Math.floor(
      ((originalTextLength - difference) / originalTextLength) * 100
    );
  }

  // テキストを比較しやすいように記号を取り除いてすべて小文字化する
  // privateだがテストのため宣言していない。
  static normalize(string: string): string {
    const matched: string[] | null = string.match(/\w+/g);
    if (matched === null) {
      return "";
    }

    return matched
      .map(word => {
        return word.toLowerCase();
      })
      .join(" ");
  }

  get keyword(): string {
    if (this.isExcellent) {
      return "EXCELLENT";
    } else if (this.isRegrettable) {
      return "REGRETTABLE";
    } else if (this.isRegrettable) {
      return "GOOD";
    } else {
      return "POOR";
    }
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
