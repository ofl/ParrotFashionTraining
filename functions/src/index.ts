import * as functions from "firebase-functions";
import * as firebase from "firebase-admin";
firebase.initializeApp();

import { dialogflow, DialogflowConversation } from "actions-on-google";

import UserData from "./UserData";
import Batch from "./Batch";
import Scenario from "./Scenario";
import { Reply, Moment, QuestionText, SpeechType } from "./Speech";
// import Message from "./Message";

const app = dialogflow();
const i18n = require("i18n");
const moment = require("moment");

i18n.configure({
  locales: ["en-US", "ja-JP"],
  directory: __dirname + "/locales",
  defaultLocale: "en-US"
});

app.middleware(conv => {
  i18n.setLocale(conv.user.locale);
  moment.locale(conv.user.locale);
});

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
  const text = "BYE_1";
  conv.close(i18n.__(text));
});

const speakDialogs = (
  conv: DialogflowConversation,
  speeches: (Reply | Moment | QuestionText)[]
) => {
  // async対策
  app.middleware(conv => {
    i18n.setLocale(conv.user.locale);
    moment.locale(conv.user.locale);
  });

  let text = "";

  speeches.forEach(speech => {
    text += translate(speech);

    if (speech.speechType == SpeechType.Continue) {
      return;
    } else if (speech.speechType == SpeechType.Ask) {
      conv.ask(text);
    } else if (speech.speechType == SpeechType.Close) {
      conv.close(text);
    }
    text = "";
  });
};

const translate = (speech: Reply | Moment | QuestionText): string => {
  if (speech instanceof Reply) {
    return i18n.__(speech.keyword, speech.dictionary);
  } else if (speech instanceof Moment) {
    return i18n.__(speech.keyword, moment.unix(speech.unixtime).fromNow());
  } else {
    return speech.text;
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
