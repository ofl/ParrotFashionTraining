import * as firebase from "firebase-admin";
import { WhereFilterOp, Query } from "@google-cloud/firestore";
import { AvailableArticleNotExist, ArticleNotFound } from "./errors";
import Utils from "./Utils";

const firestore = firebase.firestore();
const ARTICLE_COLLECTION_PATH = "articles";
const NEWS_SOURCES: { [key: string]: string } = {
  "nytimes.com": "New York Times",
  "cnn.com": "CNN",
  "reuters.com": "Reuters"
};

export default class Article {
  readonly guid: string;
  readonly title: string;
  readonly body: string;
  readonly sentences: string[];
  readonly creator: string;
  readonly unixtime: number;
  currentIndex: number;

  constructor(
    guid: string,
    title: string,
    body: string,
    sentences: string[],
    creator: string,
    isoDate: string
  ) {
    this.guid = guid;
    this.title = title;
    this.body = body;
    this.sentences = sentences;
    this.creator = creator;
    this.unixtime = new Date(isoDate).getTime();
    this.currentIndex = 0;
  }

  static async batchCreate(articles: Article[]): Promise<void> {
    const batch = firestore.batch();

    console.log(`creating ${articles.length} articles`);

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

    console.log(`deleting ${snapshot.docs.length} articles`);

    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  }

  static async getNext(): Promise<Article> {
    const query = this.getQuery(Utils.getUnixtimeOfDaysBeforeNow(1));

    return await this.load(query);
  }

  static async getNextOrIncrementCurrentIndex(
    articleId: string,
    currentSentence: string
  ): Promise<Article> {
    const currentArticle = await this.get(Utils.md5hex(articleId));

    const nextIndex = currentArticle.sentences.indexOf(currentSentence) + 1;
    if (nextIndex > 0 && nextIndex < currentArticle.sentences.length) {
      currentArticle.currentIndex = nextIndex;

      return currentArticle;
    }

    const query = this.getQuery(currentArticle.unixtime, ">");

    return await this.load(query);
  }

  static async get(articleId: string): Promise<Article> {
    const doc = await firestore
      .collection(ARTICLE_COLLECTION_PATH)
      .doc(articleId)
      .get();
    const data = doc.data();

    if (!data) {
      throw new ArticleNotFound("Article not found");
    } else {
      return new this(
        data.guid,
        data.title,
        data.body,
        data.sentences,
        data.creator,
        data.unixtime
      );
    }
  }

  static getQuery(unixtime: number, opStr: WhereFilterOp = ">="): Query {
    return firestore
      .collection(ARTICLE_COLLECTION_PATH)
      .where("unixtime", opStr, unixtime)
      .orderBy("unixtime");
  }

  private static async load(query: Query): Promise<Article> {
    const snapshot = await query.limit(1).get();
    const articles: Article[] = await this.loadList(snapshot);

    if (articles.length > 0) {
      return articles[0];
    } else {
      throw new AvailableArticleNotExist("Article not exists");
    }
  }

  private static async loadList(
    snapshot: FirebaseFirestore.QuerySnapshot
  ): Promise<Article[]> {
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return new this(
        data.guid,
        data.title,
        data.body,
        data.sentences,
        data.creator,
        data.unixtime
      );
    });
  }

  toObject(): Object {
    return {
      guid: this.guid,
      title: this.title,
      body: this.body,
      sentences: this.sentences,
      creator: this.creator,
      unixtime: this.unixtime
    };
  }

  get currentSentence(): string {
    return this.sentences[this.currentIndex];
  }

  get publisher(): string {
    return this.newsSource || this.creator;
  }

  get newsSource(): string | null {
    return Utils.findValueOfKeyInText(this.guid, NEWS_SOURCES);
  }
}
