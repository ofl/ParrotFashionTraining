import * as functions from "firebase-functions";
import * as firebase from "firebase-admin";
firebase.initializeApp();

import { dialogflow } from "actions-on-google";

import UserData from "./UserData";
import Batch from "./Batch";
import Scenario from "./Scenario";
import Message from "./Message";

const app = dialogflow();

app.intent("Default Welcome Intent", async conv => {
  try {
    const userData = UserData.load(conv);
    await Scenario.welcome(userData);
  } catch (error) {
    console.error(error);
    conv.close(error.message);
  }
});

app.intent("User Answered Intent", async (conv, { answer }) => {
  try {
    const userData = UserData.load(conv);
    if (typeof answer !== "string" || answer === "") {
      await Scenario.sayAgain(userData);
      return;
    }

    await Scenario.userAnswered(userData, answer);
  } catch (error) {
    console.error(error);
    conv.close(error.message);
  }
});

app.intent("Skip Article Intent", async conv => {
  try {
    const userData = UserData.load(conv);
    await Scenario.skipArticle(userData);
  } catch (error) {
    console.error(error);
    conv.close(error.message);
  }
});

app.intent("Say It Again Intent", async conv => {
  try {
    const userData = UserData.load(conv);
    await Scenario.sayAgain(userData);
  } catch (error) {
    console.error(error);
    conv.close(error.message);
  }
});

app.intent("Default Goodbye Intent", conv => {
  console.log("goodbye");
  conv.close(Message.bye);
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
