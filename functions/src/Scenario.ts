import Article from "./Article";
import ArticleStore from "./ArticleStore";
import AnswerResult from "./AnswerResult";
import { ArticleNotFound, CurrentSentenceNotFound } from "./errors";
import { Speech, Reply, Credit, RawText, Quote, Break } from "./Speech";
import Utils from "./Utils";
import SSML from "./SSML";

const DEFAULT_READING_SPEED: number = 100; // (%)
const MAX_RETRY_COUNT = 3;
const CONFIRM_CONTINUE_INTERVAL = 3;

enum EndStatus {
  Continue,
  Confirm,
  Close
}

class Scenario {
  speeches: Speech[] = [];
  endStatus: EndStatus = EndStatus.Continue;

  constructor(
    public articleId: string = "",
    public currentSentence: string = "",
    public retryCount: number = 0,
    public readingSpeed: number = Scenario.defaultReadingSpeed,
    public practiceCount: number = 0
  ) {}

  static get defaultReadingSpeed(): number {
    return DEFAULT_READING_SPEED;
  }

  async welcome(): Promise<void> {
    this.reset();

    this.speeches.push(new Reply("WELCOME"));
    this.speeches.push(new Reply(Utils.randomMessage("YELL", 3)));

    await this.readNewArticle();
  }

  async userAnswered(answer: string): Promise<void> {
    const questionText = this.currentSentence;

    if (questionText === "") {
      throw new CurrentSentenceNotFound("NOT_FOUND");
    }

    const answerResult = AnswerResult.get(questionText, answer);

    if (this.mustRetry(this.retryCount, answerResult)) {
      this.incrementRetryCount();
      this.speakSlowly();

      this.speeches.push(new Reply(this.getResultMessage(answerResult, true)));
      this.speeches.push(new Break(1.0));
      this.speeches.push(new Quote(questionText, this.readingSpeed));
    } else {
      this.speeches.push(new Reply(this.getResultMessage(answerResult)));

      if (this.isPracticeConfirmationPeriod) {
        this.endStatus = EndStatus.Confirm;
        this.speeches.push(
          new RawText(`You have trained ${this.practiceCount} times.`)
        );
        this.speeches.push(new Reply("CONTINUE_PRACTICE"));
        return;
      }

      const article = await this.findArticleForNextSentence();
      this.setNewPractice(article);

      if (article.currentIndex === 0) {
        this.addArticleIntroduction(article);
      }
      this.startPractice(article.currentSentence);
    }
  }

  async skipArticle(): Promise<void> {
    this.speeches.push(new Reply("SKIP_ARTICLE"));
    await this.readNewArticle();
  }

  async skipSentence(): Promise<void> {
    this.speeches.push(new Reply("SKIP_SENTENCE"));
    await this.readNewSentence();
  }

  async sayAgain(): Promise<void> {
    const currentSentence = this.currentSentence;
    if (currentSentence === "") {
      throw new CurrentSentenceNotFound("NOT_FOUND");
    }

    this.speeches.push(new Reply(Utils.randomMessage("ACCEPTED", 3)));

    this.speakSlowly();
    const questionText = new Quote(currentSentence, this.readingSpeed);

    this.speeches.push(new Break(1.0));
    this.speeches.push(questionText);
  }

  async sayGoodBye(): Promise<void> {
    this.endStatus = EndStatus.Close;
    this.speeches.push(new Reply(Utils.randomMessage("BYE", 3)));
  }

  get isPracticeConfirmationPeriod(): boolean {
    return this.practiceCount % CONFIRM_CONTINUE_INTERVAL === 0;
  }

  toSsml(): string {
    const text: string = this.speeches
      .map(speech => {
        return speech.toSsml();
      })
      .join(" ");

    return SSML.enclose(text);
  }

  toText(): string {
    return this.speeches
      .map(speech => {
        return speech.toText();
      })
      .join(" ");
  }

  private mustRetry(retryCount: number, result: AnswerResult): boolean {
    if (retryCount >= MAX_RETRY_COUNT) {
      return false;
    }
    return result.isPoor || result.isRegrettable;
  }

  private async readNewSentence(): Promise<void> {
    const article = await this.findArticleForNextSentence();
    this.setNewPractice(article);

    const questionText = article.currentSentence;
    if (questionText === "") {
      throw new CurrentSentenceNotFound("NOT_FOUND");
    }

    this.startPractice(questionText);
  }

  private async readNewArticle(): Promise<void> {
    const article = await this.findArticleForNextSentence();
    this.setNewPractice(article);

    const questionText = article.currentSentence;
    if (questionText === "") {
      throw new CurrentSentenceNotFound("NOT_FOUND");
    }

    this.addArticleIntroduction(article);
    this.startPractice(questionText);
  }

  private async findArticleForNextSentence(): Promise<Article> {
    try {
      let article: Article;

      if (this.articleId === "") {
        article = await ArticleStore.findLatest();
      } else {
        article = await ArticleStore.getNextArticleOrIncrementIndexOfSentences(
          this.articleId,
          this.currentSentence
        );
      }

      return article;
    } catch (error) {
      if (error instanceof ArticleNotFound) {
        this.reset();
      }

      throw error;
    }
  }

  private getResultMessage(
    result: AnswerResult,
    retrying: boolean = false
  ): string {
    if (result.isExcellent) {
      return Utils.randomMessage("EXCELLENT", 2);
    } else if (result.isGood) {
      return Utils.randomMessage("GOOD", 3);
    } else if (result.isRegrettable) {
      return Utils.randomMessage("REGRETTABLE", 2);
    } else if (!retrying) {
      return Utils.randomMessage("POOR", 2);
    }
    return "";
  }

  private speakSlowly() {
    if (this.readingSpeed > 70) {
      this.readingSpeed -= 15;
    }
  }

  private incrementRetryCount() {
    this.retryCount++;
  }

  private incrementPracticeCount() {
    this.practiceCount++;
  }

  private setNewPractice(article: Article) {
    this.articleId = article.guid;
    this.retryCount = 0;
    this.currentSentence = article.currentSentence;
    this.readingSpeed = Scenario.defaultReadingSpeed;
    this.incrementPracticeCount();
  }

  private reset() {
    this.articleId = "";
    this.retryCount = 0;
    this.currentSentence = "";
    this.readingSpeed = Scenario.defaultReadingSpeed;
  }

  private addArticleIntroduction(article: Article) {
    this.speeches.push(new Break());
    this.speeches.push(new Reply("INTRODUCTION"));
    this.speeches.push(new RawText(article.title));
    this.speeches.push(new Credit(article.publisher, article.unixtime));
    this.speeches.push(new Break());
    this.speeches.push(new Reply("REPEAT_AFTER_ME"));
  }

  private startPractice(questionText: string) {
    this.speeches.push(new Break(1.0));
    this.speeches.push(new RawText(questionText));
  }
}

export { Scenario, EndStatus };
