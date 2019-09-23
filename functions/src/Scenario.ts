import { Conversation } from "./interfaces";
import UserData from "./UserData";
import Article from "./Article";
import Speaker from "./Speaker";
import Message from "./Message";
import AnswerResult from "./AnswerResult";
import {
  ApplicationError,
  ArticleNotFound,
  CurrentSentenceNotFound
} from "./errors";

const MAX_RETRY_COUNT = 2;

export default class Scenario {
  static async welcome(conv: Conversation) {
    console.log("welcome");

    await this.readNewArticle(conv);
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
      const currentArticle = await this.getCurrentArticle(userData);
      const nextSentence = currentArticle.currentSentence;
      speaker.setSentence(nextSentence);
      if (currentArticle.currentIndex === 0) {
        speaker.setTitleAndPublisher(
          currentArticle.title,
          currentArticle.publisher
        );
      }
    }

    speaker.ask();
  }

  static async skipArticle(conv: Conversation) {
    console.log("skipped");

    await this.readNewArticle(conv);
  }

  static async readNewArticle(conv: Conversation) {
    const userData = UserData.load(conv);
    const currentArticle = await this.getCurrentArticle(userData);
    const nextSentence = currentArticle.currentSentence;

    const speaker = Speaker.setUp(
      conv,
      userData.readingSpeed,
      nextSentence,
      Message.resultSkipped
    );
    speaker.setTitleAndPublisher(
      currentArticle.title,
      currentArticle.publisher
    );
    speaker.ask();
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
}
