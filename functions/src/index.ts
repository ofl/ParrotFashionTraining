import * as functions from "firebase-functions";
import {
  dialogflow,
  DialogflowConversation,
  Contexts
} from "actions-on-google";

const app = dialogflow();

type Conversation = DialogflowConversation<unknown, unknown, Contexts>;

interface UserData {
  repeatCount?: number;
  lastReadUnixtime?: number;
}

app.intent("Default Welcome Intent", conv => {
  const userData = loadUserData(conv);
  console.log("welcome");
  console.log(userData.lastReadUnixtime);

  conv.ask("Are you ok?");
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
