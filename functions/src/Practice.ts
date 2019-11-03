import AnswerResult from "./AnswerResult";
import Article from "./Article";

const DEFAULT_SPEAKING_SPEED_RATE: number = 100; // (%)
const MAX_RETRY_COUNT = 3;

export default class Practice {
  public result: AnswerResult | undefined;

  constructor(
    public articleId: string = "",
    public questionText: string = "",
    public retryCount: number = 0,
    public speakingSpeedRate: number = DEFAULT_SPEAKING_SPEED_RATE
  ) {}

  static createByArticle(article: Article): Practice {
    return new Practice(article.guid, article.questionText);
  }

  getResult(answer: string): AnswerResult {
    this.result = AnswerResult.get(this.questionText, answer);
    if (this.mustRetry) {
      this.incrementRetryCount();
      this.speakSlowly();
    }

    return this.result;
  }

  get canRetry(): boolean {
    return this.retryCount < MAX_RETRY_COUNT;
  }

  get mustRetry(): boolean {
    if (typeof this.result === "undefined") {
      return false;
    }
    return this.result.isPoor || this.result.isRegrettable;
  }

  incrementRetryCount() {
    this.retryCount++;
  }

  speakSlowly() {
    if (this.speakingSpeedRate > 70) {
      this.speakingSpeedRate -= 15;
    }
  }
}
