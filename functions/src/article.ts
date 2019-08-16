import * as firebase from "firebase-admin";
import { WhereFilterOp, Query } from "@google-cloud/firestore";
import Utils from "./utils";

const firestore = firebase.firestore();
const ARTICLE_COLLECTION_PATH = "articles";

export default class Article {
  readonly guid: string;
  readonly title: string;
  readonly sentences: string[];
  readonly unixtime: number;
  currentIndex: number;

  constructor(
    guid: string,
    title: string,
    sentences: string[],
    isoDate: string
  ) {
    this.guid = guid;
    this.title = title;
    this.sentences = sentences;
    this.unixtime = new Date(isoDate).getTime();
    this.currentIndex = 0;
  }

  static async batchCreate(articles: Article[]): Promise<void> {
    const batch = firestore.batch();

    articles.forEach(article => {
      batch.set(
        firestore
          .collection(ARTICLE_COLLECTION_PATH)
          .doc(Utils.md5hex(article.guid)),
        article.toObject()
      );
    });

    await batch.commit();
  }

  static async batchDelete(
    snapshot: FirebaseFirestore.QuerySnapshot
  ): Promise<void> {
    const batch = firestore.batch();

    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  }

  static getQuery(unixtime: number, opStr: WhereFilterOp = ">="): Query {
    return firestore
      .collection(ARTICLE_COLLECTION_PATH)
      .where("unixtime", opStr, unixtime)
      .orderBy("unixtime");
  }

  }

  toObject(): Object {
    return {
      guid: this.guid,
      title: this.title,
      sentences: this.sentences,
      unixtime: this.unixtime
    };
  }
}
