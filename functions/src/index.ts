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
    const scenario = await Scenario.welcome(userData);
    conv.ask(scenario.ssml);
  } catch (error) {
    console.error(error);
    conv.close(error.message);
  }
});

app.intent("User Answered Intent", async (conv, { answer }) => {
  try {
    const userData = UserData.load(conv);
    if (typeof answer !== "string" || answer === "") {
      const scenario = await Scenario.sayAgain(userData);
      conv.ask(scenario.ssml);
      return;
    }

    const answered_scenario = await Scenario.userAnswered(userData, answer);
    conv.ask(answered_scenario.ssml);
  } catch (error) {
    console.error(error);
    conv.close(error.message);
  }
});

app.intent("Skip Article Intent", async conv => {
  try {
    const userData = UserData.load(conv);
    const scenario = await Scenario.skipArticle(userData);
    conv.ask(scenario.ssml);
  } catch (error) {
    console.error(error);
    conv.close(error.message);
  }
});

app.intent("Say It Again Intent", async conv => {
  try {
    const userData = UserData.load(conv);
    const scenario = await Scenario.sayAgain(userData);
    conv.ask(scenario.ssml);
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
    await Batch.deleteOldArticles();
  });
