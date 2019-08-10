import * as functions from "firebase-functions";
import { dialogflow } from "actions-on-google";

import Utils from "./utils";
import Sentence from "./sentence";
import UserData from "./user_data";
import { EmptyAnswerError } from "./errors";

const app = dialogflow();
const MAX_RETRY_COUNT = 2;
const PASSING_LINE_PERCENTAGE = 70;

app.intent("Default Welcome Intent", conv => {
  console.log("welcome");
  conv.ask("Let's start");
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

    if (
      Utils.percentageOfSimilarity(originalSentence.body, answer) >=
        PASSING_LINE_PERCENTAGE ||
      userData.retryCount >= MAX_RETRY_COUNT
    ) {
      const message =
        userData.retryCount >= MAX_RETRY_COUNT
          ? "Try next sentence!."
          : "Good job!. Try next sentence!.";
      userData.retryCount = 0;

      const newSentence = await Sentence.load(userData.lastReadUnixtime, true);
      userData.lastReadUnixtime = newSentence.unixtime;

      conv.ask(message + newSentence.body);
    } else {
      userData.retryCount++;
      conv.ask("Try again!." + originalSentence.body);
    }
    UserData.save(conv, userData);
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
