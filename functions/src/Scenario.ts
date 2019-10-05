import * as moment from "moment";
import UserData from "./UserData";
import Article from "./Article";
import Message from "./Message";
import AnswerResult from "./AnswerResult";
import SSML from "./SSML";
import { ArticleNotFound, CurrentSentenceNotFound } from "./errors";

const MAX_RETRY_COUNT = 2;
const DEFAULT_READING_SPEED: number = 100; // (%)

export default class Scenario {
  private publisher: string = "";
  private title: string = "";
  private unixtime: number = 0;

  constructor(
    public readingSpeed: number,
    private sentence: string,
    private reply: string
  ) {}

  static setUp(
    readingSpeed: number = this.defaultReadingSpeed,
    sentence: string = "",
    reply: string = ""
  ): Scenario {
    return new this(readingSpeed, sentence, reply);
  }

  static get defaultReadingSpeed(): number {
    return DEFAULT_READING_SPEED;
  }

  static async welcome(userData: UserData): Promise<Scenario> {
    console.log("welcome");
    userData.reset();

    return await this.readNewArticle(userData, Message.welcome);
  }

  static async userAnswered(userData: UserData, answer: string) {
    console.log("user answered");

    const currentSentence = userData.currentSentence;
    const scenario = Scenario.setUp(userData.readingSpeed, currentSentence);

    if (currentSentence === "") {
      userData.reset();

      throw new CurrentSentenceNotFound("Current sentence not found");
    }

    const answerResult = AnswerResult.get(currentSentence, answer);
    scenario.addReply(Message.getResultMessage(answerResult));

    if (this.canRetry(userData.retryCount, answerResult)) {
      scenario.speakSlowly();
      userData.incrementRetryCount();
      userData.setReadingSpeed(scenario.readingSpeed);
    } else {
      const article = await this.getArticle(userData);
      const nextSentence = article.currentSentence;
      scenario.setSentence(nextSentence);
      if (article.currentIndex === 0) {
        scenario.setTitleAndPublisher(
          article.title,
          article.publisher,
          article.unixtime
        );
      }
    }

    return scenario;
  }

  static async skipArticle(userData: UserData): Promise<Scenario> {
    console.log("skipped");

    return await this.readNewArticle(userData, Message.resultSkipped);
  }

  static async readNewArticle(
    userData: UserData,
    message: string
  ): Promise<Scenario> {
    const currentArticle = await this.getArticle(userData);
    const nextSentence = currentArticle.currentSentence;

    const scenario = Scenario.setUp(
      userData.readingSpeed,
      nextSentence,
      message
    );
    scenario.setTitleAndPublisher(
      currentArticle.title,
      currentArticle.publisher,
      currentArticle.unixtime
    );
    return scenario;
  }

  static async sayAgain(userData: UserData): Promise<Scenario> {
    console.log("once again");

    const currentSentence = userData.currentSentence;
    const scenario = Scenario.setUp(userData.readingSpeed, currentSentence);

    if (currentSentence === "") {
      userData.reset();

      throw new CurrentSentenceNotFound("Current sentence not found");
    }

    scenario.speakSlowly();
    scenario.addReply(Message.okay);
    return scenario;
  }

  private static canRetry(retryCount: number, result: AnswerResult): boolean {
    if (retryCount >= MAX_RETRY_COUNT) {
      return false;
    }
    return result.isPoor || result.isRegrettable;
  }

  private static async getArticle(userData: UserData): Promise<Article> {
    try {
      let article: Article;
      if (userData.isEmpty) {
        article = await Article.getLatest();
      } else {
        article = await Article.getNextArticleOrIncrementIndex(
          userData.articleId,
          userData.currentSentence
        );
      }
      userData.setCurrentPractice(article);

      return article;
    } catch (error) {
      if (error instanceof ArticleNotFound) {
        userData.reset();
      }

      throw error;
    }
  }

  speakSlowly() {
    if (this.readingSpeed > 70) {
      this.readingSpeed -= 15;
    }
  }

  setSentence(value: string) {
    this.sentence = value;
  }

  addReply(value: string) {
    this.reply += value;
  }

  setTitleAndPublisher(title: string, publisher: string, unixtime: number) {
    this.title = title;
    this.publisher = publisher;
    this.unixtime = unixtime;
  }

  get ssml(): string {
    let ssml = `<p>`;
    ssml += `<s>${this.reply}</s>`;

    if (this.title !== "") {
      ssml += SSML.addBreak(1);
      ssml += `<s>Next title is "${this.title}" from ${this.publisher} `;
      ssml += `${moment.unix(this.unixtime / 1000).fromNow()}.</s>`;
      ssml += `<s>Repeat after me.</s>`;
    }

    ssml += `</p>`;

    if (this.sentence !== "") {
      ssml += SSML.addBreak(1);
      ssml += SSML.encloseSentence(
        this.sentence,
        READING_SPEED[this.readingSpeed]
      );
    }

    return SSML.enclose(ssml);
  }
}
