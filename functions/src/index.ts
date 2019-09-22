import * as functions from "firebase-functions";
import * as firebase from "firebase-admin";
firebase.initializeApp();

import { dialogflow } from "actions-on-google";

import Article from "./article";
import UserData from "./user_data";
import AnswerResult from "./AnswerResult";
import {
  CurrentSentenceNotFound,
  ArticleNotFound,
  AvailableArticleNotExist
} from "./errors";
import Batch from "./batch";
import Message from "./Message";
import Speaker from "./Speaker";

const app = dialogflow();
const MAX_RETRY_COUNT = 2;

app.intent("Default Welcome Intent", async conv => {
  try {
    console.log("welcome");

    const userData = UserData.load(conv);
    const nextSentence = await getNextSentence(userData);
    Speaker.setUp(
      conv,
      userData.readingSpeed,
      nextSentence,
      Message.welcome
    ).ask();
  } catch (error) {
    console.error(error);

    if (error instanceof AvailableArticleNotExist) {
      conv.close(error.message);
      return;
    }

    conv.close(error.message);
  }
});

app.intent("User Answered Intent", async (conv, { answer }) => {
  try {
    console.log("user answered");

    const userData = UserData.load(conv);
    const currentSentence = userData.currentSentence;
    const speaker = Speaker.setUp(conv, userData.readingSpeed, currentSentence);

    if (currentSentence === "") {
      userData.reset();

      throw new CurrentSentenceNotFound("Current sentence not found");
    }

    if (typeof answer !== "string" || answer === "") {
      speaker.addReply(Message.retry);
      speaker.ask();

      return;
    }

    const answerResult = AnswerResult.get(currentSentence, answer);
    speaker.addReply(Message.getResultMessage(answerResult));

    if (canRetry(userData.retryCount, answerResult)) {
      speaker.speakSlowly();
      userData.incrementRetryCount();
      userData.setReadingSpeed(speaker.readingSpeed);
    } else {
      const nextSentence = await getNextSentence(userData);
      speaker.setSentence(nextSentence);
    }

    speaker.ask();
  } catch (error) {
    console.error(error);

    conv.close(error.message);
  }
});

app.intent("Skip Article Intent", async conv => {
  try {
    console.log("skipped");

    const userData = UserData.load(conv);
    const nextSentence = await getNextSentence(userData);

    Speaker.setUp(
      conv,
      userData.readingSpeed,
      nextSentence,
      Message.resultSkipped
    ).ask();
  } catch (error) {
    console.error(error);

    if (error instanceof AvailableArticleNotExist) {
      conv.close(error.message);
      return;
    }

    conv.close(error.message);
  }
});

app.intent("Default Goodbye Intent", conv => {
  console.log("goodbye");

  conv.close(Message.bye);
});

const getNextSentence = async (userData: UserData): Promise<string> => {
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
};

const canRetry = (retryCount: number, result: AnswerResult): boolean => {
  if (retryCount >= MAX_RETRY_COUNT) {
    return false;
  }
  return result.isPoor || result.isRegrettable;
};

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);

exports.scheduledBatchCreateArticles = functions.pubsub
  .schedule("10 * * * *")
  .timeZone("Asia/Tokyo")
  .onRun(async _context => {
    console.log("Batch.createArticlesFromRSS");

    await Batch.createArticlesFromRSS();
  });

exports.scheduledBatchDeleteArticles = functions.pubsub
  .schedule("20 1 * * *")
  .timeZone("Asia/Tokyo")
  .onRun(async _context => {
    console.log("Batch.deleteOldArticles");

    await Batch.deleteOldArticles();
  });
