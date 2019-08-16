import * as functions from "firebase-functions";
import * as firebase from "firebase-admin";
firebase.initializeApp();

import { dialogflow } from "actions-on-google";

import Utils from "./utils";
import Article from "./article";
import UserData from "./user_data";
// import Batch from "./batch";
import { LastResult } from "./interfaces";
import {
  CurrentSentenceNotFound,
  ArticleNotFound,
  AvailableArticleNotExist
} from "./errors";
import Batch from "./batch";

const app = dialogflow();
const MAX_RETRY_COUNT = 2;
const PASSING_LINE_PERCENTAGE = 70;

app.intent("Default Welcome Intent", async conv => {
  try {
    console.log("welcome");

    const userData = UserData.load(conv);
    const nextSentence = await getNextSentence(userData);

    conv.ask(beforeNewSentenceMessage() + nextSentence);

    // await Batch.createArticlesFromRSS();
  } catch (error) {
    console.error(error);

    if (error instanceof AvailableArticleNotExist) {
      conv.close("Sorry, available practice is not exist. Please try later.");
      return;
    }

    conv.close("Sorry, something is wrong. Closing application.");
  }
});

app.intent("User Replied Intent", async (conv, { answer }) => {
  try {
    console.log("user replied");

    const userData = UserData.load(conv);
    const currentSentence = userData.currentSentence;

    if (currentSentence === "") {
      userData.reset();

      throw new CurrentSentenceNotFound("Current sentence not found");
    }

    if (typeof answer !== "string" || answer === "") {
      conv.ask("Try again!." + currentSentence);

      return;
    }

    if (
      Utils.percentageOfSimilarity(currentSentence, answer) >=
      PASSING_LINE_PERCENTAGE
    ) {
      const nextSentence = await getNextSentence(userData);
      conv.ask(beforeNewSentenceMessage(LastResult.succeeded) + nextSentence);
    } else if (userData.retryCount >= MAX_RETRY_COUNT) {
      const nextSentence = await getNextSentence(userData);
      conv.ask(beforeNewSentenceMessage(LastResult.failed) + nextSentence);
    } else {
      userData.incrementRetryCount();
      conv.ask("Try again!." + currentSentence);
    }
  } catch (error) {
    console.error(error);

    if (error instanceof AvailableArticleNotExist) {
      conv.close("Sorry, available practice is not exist. Please try later.");
      return;
    }

    conv.close("Sorry, something is wrong. Closing application.");
  }
});

app.intent("Skip Article Intent", async conv => {
  try {
    console.log("skipped");

    const userData = UserData.load(conv);
    const nextSentence = await getNextSentence(userData);

    conv.ask(beforeNewSentenceMessage(LastResult.skipped) + nextSentence);
  } catch (error) {
    console.error(error);

    if (error instanceof AvailableArticleNotExist) {
      conv.close("Sorry, available practice is not exist. Please try later.");
      return;
    }

    conv.close("Sorry, something is wrong. Closing application.");
  }
});

app.intent("Default Goodbye Intent", conv => {
  console.log("goodbye");

  conv.close("Goodbye.");
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

const beforeNewSentenceMessage = (lastResult?: LastResult): string => {
  if (typeof lastResult === "undefined") {
    return "Let's start!.";
  }

  switch (lastResult) {
    case 0:
      // => succeeded
      return "Good job!.";
    case 1:
      // => failed
      return "Don't mind!.";
    default:
      // => skipped
      return "All right. Let's start next sentence!.";
  }
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
