// const exampleSentenceData = [
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

import * as functions from "firebase-functions";
import * as firebase from "firebase-admin";
import { WhereFilterOp, Query } from "@google-cloud/firestore";
import { SentenceLoadError } from "./errors";

firebase.initializeApp(functions.config().firebase);

const firestore = firebase.firestore();
const SENTENCE_COLLECTION_PATH = "sentences";

export default class Sentence {
  readonly body: string;
  readonly unixtime: number;

  constructor(body: string, unixtime: number) {
    this.body = body;
    this.unixtime = unixtime;
  }

  static async load(
    unixtime: number,
    loadNext: boolean = false
  ): Promise<Sentence> {
    const sentences = await this.loadList(unixtime, loadNext);

    if (sentences.length > 0) {
      return sentences[0];
    } else {
      throw new SentenceLoadError("Sentence not found");
    }
  }

  private static async loadList(
    unixtime: number,
    loadNext: boolean = false
  ): Promise<Sentence[]> {
    const opStr: WhereFilterOp = loadNext ? ">" : ">=";
    const snapshot = await this.sentenceQuery(unixtime, opStr)
      .limit(1)
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return new this(data.body, data.unixtime);
    });
  }

  private static sentenceQuery(
    unixtime: number,
    opStr: WhereFilterOp = ">="
  ): Query {
    return firestore
      .collection(SENTENCE_COLLECTION_PATH)
      .where("unixtime", opStr, unixtime)
      .orderBy("unixtime");
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
}
