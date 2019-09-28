import UserData from "./UserData";
import Article from "./Article";
import Message from "./Message";
import AnswerResult from "./AnswerResult";
import SSML from "./SSML";
import { ArticleNotFound, CurrentSentenceNotFound } from "./errors";

const MAX_RETRY_COUNT = 2;
const READING_SPEED: string[] = ["x-slow", "slow", "medium", "fast", "x-fast"];

export default class Scenario {
  private publisher: string = "";
  private title: string = "";

  constructor(
    public readingSpeed: number,
    private sentence: string,
    private reply: string
  ) {}

  static setUp(
    readingSpeed: number = Scenario.defaultReadingSpeed(),
    sentence: string = "",
    reply: string = ""
  ): Scenario {
    return new this(readingSpeed, sentence, reply);
  }

  static defaultReadingSpeed(): number {
    return READING_SPEED.indexOf("medium");
  }

  static async welcome(userData: UserData): Promise<Scenario> {
    console.log("welcome");

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
      const currentArticle = await this.getCurrentArticle(userData);
      const nextSentence = currentArticle.currentSentence;
      scenario.setSentence(nextSentence);
      if (currentArticle.currentIndex === 0) {
        scenario.setTitleAndPublisher(
          currentArticle.title,
          currentArticle.publisher
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
    const currentArticle = await this.getCurrentArticle(userData);
    const nextSentence = currentArticle.currentSentence;

    const scenario = Scenario.setUp(
      userData.readingSpeed,
      nextSentence,
      message
    );
    scenario.setTitleAndPublisher(
      currentArticle.title,
      currentArticle.publisher
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

  private static async getCurrentArticle(userData: UserData): Promise<Article> {
    try {
      let article: Article;
      if (userData.isEmpty) {
        article = await Article.getNext();
      } else {
        article = await Article.getNextOrIncrementCurrentIndex(
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
    if (0 < this.readingSpeed) {
      this.readingSpeed -= 1;
    }
  }

  setSentence(value: string) {
    this.sentence = value;
  }

  addReply(value: string) {
    this.reply += value;
  }

  setTitleAndPublisher(title: string, publisher: string) {
    this.title = title;
    this.publisher = publisher;
  }

  get ssml(): string {
    let ssml = `<p>`;
    ssml += `<s>${this.reply}</s>`;

    if (this.title !== "") {
      ssml += SSML.addBreak(1);
      ssml += `<s>Next title is "${this.title}" from ${this.publisher}.</s>`;
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
