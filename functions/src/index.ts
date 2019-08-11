import * as functions from "firebase-functions";
import { dialogflow } from "actions-on-google";

import Utils from "./utils";
import Sentence from "./sentence";
import UserData from "./user_data";
import { Conversation, LastResult } from "./interfaces";
import { EmptyAnswerError } from "./errors";

const app = dialogflow();
const MAX_RETRY_COUNT = 2;
const PASSING_LINE_PERCENTAGE = 70;

app.intent("Default Welcome Intent", async conv => {
  console.log("welcome");
  await startPractice(conv);
});

app.intent("User Replied Intent", async (conv, { answer }) => {
  try {
    console.log("user replied");

    if (typeof answer !== "string") {
      throw new EmptyAnswerError("User answer not found");
    }

    const userData = UserData.load(conv);
    console.log(userData.retryCount);

    const originalSentence = await Sentence.load(userData.lastReadUnixtime);
    const overMaxRetryCount = userData.retryCount >= MAX_RETRY_COUNT;

    if (
      Utils.percentageOfSimilarity(originalSentence.body, answer) >=
      PASSING_LINE_PERCENTAGE
    ) {
      await startPractice(conv, LastResult.succeeded);
    } else if (overMaxRetryCount) {
      await startPractice(conv, LastResult.failed);
    } else {
      userData.incrementRetryCount();
      conv.ask("Try again!." + originalSentence.body);
    }
  } catch (error) {
    console.error(error);
    conv.close("Sorry, something is wrong. Closing application.");
  }
});

app.intent("Default Goodbye Intent", conv => {
  console.log("goodbye");

  conv.close("Goodbye.");
});

const startPractice = async (
  conv: Conversation,
  lastResult?: LastResult
): Promise<void> => {
  const userData = UserData.load(conv);
  const newSentence = await Sentence.load(userData.lastReadUnixtime, true);
  userData.reset(newSentence.unixtime);

  conv.ask(beforeNewSentenceMessage(lastResult) + newSentence.body);
};

const beforeNewSentenceMessage = (lastResult?: LastResult): string => {
  if (typeof lastResult === "undefined") {
    return "Let's start!.";
  }

  switch (lastResult) {
    case 0:
      // => succeeded
      return "Good job!.";
    default:
      // => failed
      return "Don't mind!.";
  }
};

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
