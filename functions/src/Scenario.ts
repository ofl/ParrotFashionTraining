import { Conversation } from "./interfaces";
import UserData from "./UserData";
import Article from "./Article";
import Speaker from "./Speaker";
import Message from "./Message";
import {
  ApplicationError,
  ArticleNotFound,
  CurrentSentenceNotFound
} from "./errors";
import AnswerResult from "./AnswerResult";

const MAX_RETRY_COUNT = 2;

export default class Scenario {
  static async welcome(conv: Conversation) {
    console.log("welcome");

    const userData = UserData.load(conv);
    const nextSentence = await this.getNextSentence(userData);
    Speaker.setUp(
      conv,
      userData.readingSpeed,
      nextSentence,
      Message.welcome
    ).ask();
  }

  static async userAnswered(conv: Conversation, answer: string) {
    console.log("user answered");

    const userData = UserData.load(conv);
    const currentSentence = userData.currentSentence;
    const speaker = Speaker.setUp(conv, userData.readingSpeed, currentSentence);

    if (currentSentence === "") {
      userData.reset();

      throw new CurrentSentenceNotFound("Current sentence not found");
    }

    const answerResult = AnswerResult.get(currentSentence, answer);
    speaker.addReply(Message.getResultMessage(answerResult));

    if (this.canRetry(userData.retryCount, answerResult)) {
      speaker.speakSlowly();
      userData.incrementRetryCount();
      userData.setReadingSpeed(speaker.readingSpeed);
    } else {
      const nextSentence = await this.getNextSentence(userData);
      speaker.setSentence(nextSentence);
    }

    speaker.ask();
  }

  static async skipArticle(conv: Conversation) {
    console.log("skipped");

    const userData = UserData.load(conv);
    const nextSentence = await this.getNextSentence(userData);

    Speaker.setUp(
      conv,
      userData.readingSpeed,
      nextSentence,
      Message.resultSkipped
    ).ask();
  }

  static async sayAgain(conv: Conversation) {
    console.log("once again");

    const userData = UserData.load(conv);
    const currentSentence = userData.currentSentence;
    const speaker = Speaker.setUp(conv, userData.readingSpeed, currentSentence);

    if (currentSentence === "") {
      userData.reset();

      throw new CurrentSentenceNotFound("Current sentence not found");
    }

    speaker.speakSlowly();
    speaker.addReply(Message.okay);
    speaker.ask();
  }

  static errorRaised(conv: Conversation, error: ApplicationError) {
    console.error(error);
    conv.close(error.message);
  }

  static goodbye(conv: Conversation) {
    console.log("goodbye");

    conv.close(Message.bye);
  }

  private static canRetry(retryCount: number, result: AnswerResult): boolean {
    if (retryCount >= MAX_RETRY_COUNT) {
      return false;
    }
    return result.isPoor || result.isRegrettable;
  }

  private static async getNextSentence(userData: UserData): Promise<string> {
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

      return article.currentSentence;
    } catch (error) {
      if (error instanceof ArticleNotFound) {
        userData.reset();
      }

      throw error;
    }
  }
}
