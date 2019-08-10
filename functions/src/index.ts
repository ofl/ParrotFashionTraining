import * as functions from "firebase-functions";
import { dialogflow } from "actions-on-google";

import Utils from "./utils";
import Sentence from "./sentence";
import UserData from "./user_data";
import { EmptyAnswerError } from "./errors";

const THREE_DAYS_MS = 60 * 60 * 24 * 3 * 1000 * 10;
const PASSING_LINE_PERCENTAGE = 70;

const app = dialogflow();

app.intent("Default Welcome Intent", conv => {
  console.log("welcome");
  conv.ask("Let's start");
});

app.intent("User Replied Intent", async (conv, { answer }) => {
  try {
    console.log("user replied");

    const userData = UserData.load(conv);
    const originalSentence = await Sentence.load(
      userData.lastReadUnixtime - THREE_DAYS_MS
    );

    if (typeof answer !== "string") {
      throw new EmptyAnswerError("User answer not found");
    }

    userData.retryCount++;
    UserData.save(conv, userData);

    if (
      Utils.percentageOfSimilarity(originalSentence.body, answer) >=
      PASSING_LINE_PERCENTAGE
    ) {
      conv.ask("That's ok");
    } else {
      conv.ask("That's not ok");
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

// ユーザーが「Voice Match でアカウントに基づく情報を受け取る」場合
// function loadUserDataFromStorage(conv: Conversation): UserData {
//   const storage = conv.user.storage as UserData;
//   if (
//     typeof storage.repeatCount !== "undefined" &&
//     typeof storage.lastReadUnixtime !== "undefined"
//   ) {
//     return storage;
//   }

//   const userData: UserData = {
//     repeatCount: storage.repeatCount || 0,
//     lastReadUnixtime: storage.lastReadUnixtime || new Date().getTime()
//   };
//   conv.user.storage = userData;

//   return userData;
// }

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
