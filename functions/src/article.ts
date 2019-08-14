import * as firebase from "firebase-admin";

const firestore = firebase.firestore();
const ARTICLE_COLLECTION_PATH = "articles";
const crypto = require("crypto");

export default class Article {
  guid: string;
  title: string;
  body: string;
  unixtime: number;

  constructor(
    guid: string,
    title: string,
    contentSnippet: string,
    isoDate: string
  ) {
    this.guid = guid;
    this.title = title;
    this.body = contentSnippet;
    this.unixtime = new Date(isoDate).getTime();
  }

  static async batchCreate(articles: Article[]): Promise<void> {
    const batch = firestore.batch();

    articles.forEach(article => {
      batch.set(
        firestore
          .collection(ARTICLE_COLLECTION_PATH)
          .doc(this.md5hex(article.guid)),
        article.toObject()
      );
    });

    await batch.commit();
  }

  private static md5hex(str: string) {
    const md5 = crypto.createHash("md5");
    return md5.update(str, "binary").digest("hex");
  }

  toObject(): Object {
    return {
      guid: this.guid,
      title: this.title,
      body: this.body,
      unixtime: this.unixtime
    };
  }
}
