import * as functions from "firebase-functions";
import {
  dialogflow,
  DialogflowConversation,
  Contexts
} from "actions-on-google";

import Utils from "./utils";
import Sentence from "./sentence";
import { UserDataLoadError, EmptyAnswerError } from "./errors";

interface UserData {
  repeatCount?: number;
  lastReadUnixtime?: number;
}

type Conversation = DialogflowConversation<unknown, unknown, Contexts>;

const THREE_DAYS_MS = 60 * 60 * 24 * 3 * 1000 * 10;
const PASSING_LINE_PERCENTAGE = 70;

const app = dialogflow();

// const exampleSentences: Sentence[] = [
//   {
//     body:
//       "1. The doctor used a lot of medical terms that I couldn’t understand.",
//     unixtime: new Date().getTime()
//   },
//   {
//     body: "2. Could you repeat that last sentence?",
//     unixtime: new Date().getTime()
//   },
//   {
//     body: "There was a mistake in the second sentence 2.",
//     unixtime: new Date().getTime()
//   }
// ];

app.intent("Default Welcome Intent", conv => {
  console.log("welcome");
  conv.ask("Let's start");
});

app.intent("User Replied Intent", async (conv, { answer }) => {
  try {
    console.log("user replied");

    const userData = loadUserData(conv);
    if (typeof userData.lastReadUnixtime === "undefined") {
      throw new UserDataLoadError("lastReadUnixtime not found");
    }

    const originalSentence = await Sentence.loadSentence(
      userData.lastReadUnixtime - THREE_DAYS_MS
    );

    if (typeof answer !== "string") {
      throw new EmptyAnswerError("User answer not found");
    }

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

function loadUserData(conv: Conversation): UserData {
  const data = conv.data as UserData;
  if (
    typeof data.repeatCount !== "undefined" &&
    typeof data.lastReadUnixtime !== "undefined"
  ) {
    return data;
  }

  const userData: UserData = {
    repeatCount: data.repeatCount || 0,
    lastReadUnixtime: data.lastReadUnixtime || new Date().getTime()
  };
  conv.data = userData;

  return userData;
}

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
