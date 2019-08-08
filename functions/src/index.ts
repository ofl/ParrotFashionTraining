import * as functions from "firebase-functions";
import * as firebase from "firebase-admin";
import {
  dialogflow,
  DialogflowConversation,
  Contexts
} from "actions-on-google";
import { WhereFilterOp, Query } from "@google-cloud/firestore";

interface UserData {
  repeatCount?: number;
  lastReadUnixtime?: number;
}
interface Sentence {
  body: string;
  unixtime: number;
}

type Conversation = DialogflowConversation<unknown, unknown, Contexts>;

const SENTENCE_COLLECTION_PATH = "sentences";
const THREE_DAYS_MS = 60 * 60 * 24 * 3 * 1000;
const PASSING_LINE_PERCENTAGE = 70;

firebase.initializeApp(functions.config().firebase);

const app = dialogflow();
const firestore = firebase.firestore();

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

app.intent("Default Welcome Intent", async conv => {
  const userData = loadUserData(conv);
  console.log("welcome");
  console.log(userData.lastReadUnixtime);

  // TEST: load;
  if (typeof userData.lastReadUnixtime !== "undefined") {
    const sentences = await loadSentence(
      userData.lastReadUnixtime - THREE_DAYS_MS
    );

    if (sentences.length > 0) {
      console.log(sentences[0].body);
    }
  }

  // TEST: count
  // if (typeof userData.lastReadUnixtime !== "undefined") {
  //   const count = await sentenceCount(
  //     userData.lastReadUnixtime - THREE_DAYS_MS
  //   );
  //   console.log(count);
  // }

  // TEST: create
  // await createSentences(exampleSentences);

  // TEST: delete
  // await deleteOldSentences(new Date().getTime() - 60 * 60 * 24 * 1 * 1000);

  // TEST: compare original sentence and user reply
  const originalSentence =
    "The doctor used a lot of medical terms that I couldn’t understand.";
  const userRepliedSentence =
    "The teacher use a lot of technical word that we couldn not realize.";

  if (
    percentageOfSimilarity(originalSentence, userRepliedSentence) >=
    PASSING_LINE_PERCENTAGE
  ) {
    conv.ask("That's ok");
  } else {
    conv.ask("That's not ok");
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

async function loadSentence(unixtime: number): Promise<Sentence[]> {
  const snapshot = await sentenceQuery(unixtime)
    .limit(1)
    .get();

  return snapshot.docs.map(doc => {
    return doc.data() as Sentence;
  });
}

// async function sentenceCount(unixtime: number): Promise<number> {
//   const snapshot = await sentenceQuery(unixtime).get();

//   return snapshot.size;
// }

// async function createSentences(data: Sentence[]): Promise<void> {
//   if (data.length === 0) {
//     return;
//   }

//   const batch = firestore.batch();

//   data.forEach(sentenceData => {
//     batch.set(
//       firestore.collection(SENTENCE_COLLECTION_PATH).doc(),
//       sentenceData
//     );
//   });

//   await batch.commit();
// }

// async function deleteOldSentences(
//   unixtime: number = new Date().getTime() - THREE_DAYS_MS
// ): Promise<void> {
//   const snapshot = await sentenceQuery(unixtime, "<").get();

//   if (snapshot.size === 0) {
//     console.log("nothing to delete");
//     return;
//   }

//   const batch = firestore.batch();

//   snapshot.docs.forEach(doc => {
//     batch.delete(doc.ref);
//   });

//   await batch.commit();
// }

function sentenceQuery(unixtime: number, opStr: WhereFilterOp = ">="): Query {
  return firestore
    .collection(SENTENCE_COLLECTION_PATH)
    .where("unixtime", opStr, unixtime)
    .orderBy("unixtime");
}

function percentageOfSimilarity(
  originalSentence: string,
  userRepliedSentence: string
): number {
  const orginalWords = new Set(sentenceToWordArray(originalSentence));
  const userWords = new Set(sentenceToWordArray(userRepliedSentence));
  const intersection = new Set([...orginalWords].filter(e => userWords.has(e)));

  return Math.round((intersection.size / orginalWords.size) * 100);
}

function sentenceToWordArray(sentence: string): string[] {
  const words = sentence.match(/\S+/g);
  if (words === null) {
    return [];
  }

  return words.map(word => {
    return word.toLowerCase();
  });
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
