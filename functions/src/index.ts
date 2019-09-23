import * as functions from "firebase-functions";
import * as firebase from "firebase-admin";
firebase.initializeApp();

import { dialogflow } from "actions-on-google";

import Batch from "./Batch";
import Scenario from "./Scenario";

const app = dialogflow();

app.intent("Default Welcome Intent", async conv => {
  try {
    await Scenario.welcome(conv);
  } catch (error) {
    Scenario.errorRaised(conv, error);
  }
});

app.intent("User Answered Intent", async (conv, { answer }) => {
  try {
    if (typeof answer !== "string" || answer === "") {
      await Scenario.sayAgain(conv);
      return;
    }

    await Scenario.userAnswered(conv, answer);
  } catch (error) {
    Scenario.errorRaised(conv, error);
  }
});

app.intent("Skip Article Intent", async conv => {
  try {
    await Scenario.skipArticle(conv);
  } catch (error) {
    Scenario.errorRaised(conv, error);
  }
});

app.intent("Say It Again Intent", async conv => {
  try {
    await Scenario.sayAgain(conv);
  } catch (error) {
    Scenario.errorRaised(conv, error);
  }
});

app.intent("Default Goodbye Intent", conv => {
  Scenario.goodbye(conv);
});

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
