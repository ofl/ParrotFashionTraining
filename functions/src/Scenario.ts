import Article from "./Article";
import ArticleStore from "./ArticleStore";
import Message from "./Message";
import AnswerResult from "./AnswerResult";
import { ArticleNotFound, CurrentSentenceNotFound } from "./errors";
import { Speech, Reply, Credit, RawText, SpeechType } from "./Speech";
import Utils from "./Utils";

const DEFAULT_READING_SPEED: number = 100; // (%)
const MAX_RETRY_COUNT = 3;

export default class Scenario {
  speeches: Speech[] = [];

  constructor(
    public articleId: string = "",
    public currentSentence: string = "",
    public retryCount: number = 0,
    public readingSpeed: number = Scenario.defaultReadingSpeed
  ) {}

  static get defaultReadingSpeed(): number {
    return DEFAULT_READING_SPEED;
  }

  async welcome(): Promise<void> {
    console.log("welcome");
    this.reset();

    await this.readNewArticle(Message.welcome);
  }

  async userAnswered(answer: string): Promise<void> {
    console.log("user answered");

    if (this.currentSentence === "") {
      throw new CurrentSentenceNotFound("NOT_FOUND");
    }

    const answerResult = AnswerResult.get(this.currentSentence, answer);

    if (this.mustRetry(this.retryCount, answerResult)) {
      this.incrementRetryCount();
      this.speakSlowly();

      this.speeches.push(new Reply(this.getResultMessage(answerResult, true)));
      this.speeches.push(new RawText(this.currentSentence, this.readingSpeed));
    } else {
      const article = await this.findArticleForNextSentence();
      const nextSentence = article.currentSentence;
      const questionText = new RawText(nextSentence);

      this.setNewPractice(article);

      this.speeches.push(new Reply(this.getResultMessage(answerResult)));
      if (article.currentIndex === 0) {
        this.speeches.push(new Credit(article.publisher, article.unixtime));
      }
      this.speeches.push(questionText);
    }
  }

  async skipArticle(): Promise<void> {
    console.log("skipped article");

    await this.readNewArticle(Message.resultSkipped);
  }

  async skipSentence(): Promise<void> {
    console.log("skipped sentence");

    await this.readNewSentence(Message.resultSkipped);
  }

  async readNewSentence(message: string): Promise<void> {
    const article = await this.findArticleForNextSentence();
    this.setNewPractice(article);
    const currentSentence = article.currentSentence;

    if (currentSentence === "") {
      throw new CurrentSentenceNotFound("NOT_FOUND");
    }

    this.speeches.push(new Reply(message));
    this.speeches.push(new Reply("REPEAT_AFTER_ME"));
    this.speeches.push(new RawText(currentSentence));
  }

  private async readNewArticle(message: string): Promise<void> {
    const article = await this.findArticleForNextSentence();
    this.setNewPractice(article);
    const currentSentence = article.currentSentence;

    if (currentSentence === "") {
      throw new CurrentSentenceNotFound("NOT_FOUND");
    }

    this.speeches.push(new Reply(message));
    this.speeches.push(new Reply("NEXT_TITLE"));
    this.speeches.push(new RawText(article.title));
    this.speeches.push(new Credit(article.publisher, article.unixtime));
    this.speeches.push(new Reply("REPEAT_AFTER_ME"));
    this.speeches.push(new RawText(currentSentence));
  }

  async sayAgain(): Promise<void> {
    console.log("once again");

    const currentSentence = this.currentSentence;
    if (currentSentence === "") {
      throw new CurrentSentenceNotFound("NOT_FOUND");
    }

    this.speeches.push(new Reply(Utils.randomMessage("ACCEPTED", 3)));

    this.speakSlowly();
    const questionText = new RawText(currentSentence, this.readingSpeed);

    this.speeches.push(questionText);
  }

  async sayGoodBye(): Promise<void> {
    console.log("goodbye");

    this.speeches.push(
      new Reply(Utils.randomMessage("BYE", 3), {}, SpeechType.Close)
    );
  }

  private mustRetry(retryCount: number, result: AnswerResult): boolean {
    if (retryCount >= MAX_RETRY_COUNT) {
      return false;
    }
    return result.isPoor || result.isRegrettable;
  }

  private async findArticleForNextSentence(): Promise<Article> {
    try {
      let article: Article;

      if (this.articleId === "") {
        article = await ArticleStore.findEasiest();
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

  private setNewPractice(article: Article) {
    this.articleId = article.guid;
    this.retryCount = 0;
    this.currentSentence = article.currentSentence;
    this.readingSpeed = Scenario.defaultReadingSpeed;
  }

  private reset() {
    this.articleId = "";
    this.retryCount = 0;
    this.currentSentence = "";
    this.readingSpeed = Scenario.defaultReadingSpeed;
  }
}
