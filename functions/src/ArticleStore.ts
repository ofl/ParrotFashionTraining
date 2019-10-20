import * as firebase from "firebase-admin";
import { WhereFilterOp, Query } from "@google-cloud/firestore";
import * as moment from "moment";

import Article from "./Article";
import Utils from "./Utils";
import TextSplitter from "./TextSplitter";
import { AvailableArticleNotExist, ArticleNotFound } from "./errors";

const firestore = firebase.firestore();
const ARTICLE_COLLECTION_PATH = "articles";
const MAX_SENTENCE_LENGTH: number = 10;

export default class ArticleStore {
  static async findLatest(
    unixtime: number = moment().unix()
  ): Promise<Article> {
    const query = firestore
      .collection(ARTICLE_COLLECTION_PATH)
      .where("unixtime", "<", unixtime)
      .orderBy("unixtime", "desc");

    return await this.findOne(query);
  }

  static async getNextArticleOrIncrementIndexOfSentences(
    articleId: string,
    currentSentence: string
  ): Promise<Article> {
    const currentArticle = await this.get(Utils.md5hex(articleId));

    const nextIndex = currentArticle.sentences.indexOf(currentSentence) + 1;
    if (nextIndex > 0 && nextIndex < currentArticle.sentences.length) {
      currentArticle.currentIndex = nextIndex;

      return currentArticle;
    }

    return await this.findLatest(currentArticle.unixtime);
  }

  static queryOfPublishedBefore(
    unixtime: number,
    opStr: WhereFilterOp = "<"
  ): Query {
    return firestore
      .collection(ARTICLE_COLLECTION_PATH)
      .where("unixtime", opStr, unixtime)
      .orderBy("unixtime", "desc");
  }

  static async batchCreate(
    contents: { [key: string]: string }[],
    days: number = 1
  ): Promise<void> {
    const batch = firestore.batch();

    const currentArticles = this.filterOldOrLongSentenceArticles(
      contents,
      days
    );
    console.log(`creating ${currentArticles.length} articles`);

    currentArticles.forEach(article => {
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

  private static async get(articleId: string): Promise<Article> {
    const doc = await firestore
      .collection(ARTICLE_COLLECTION_PATH)
      .doc(articleId)
      .get();
    const data = doc.data();

    if (!data) {
      throw new ArticleNotFound("Article not found");
    } else {
      return new Article(
        data.guid,
        data.title,
        data.body,
        data.sentences,
        data.creator,
        data.unixtime
      );
    }
  }

  private static async findOne(query: Query): Promise<Article> {
    const snapshot = await query.limit(1).get();
    const articles: Article[] = await this.loadList(snapshot);

    if (articles.length > 0) {
      return articles[0];
    } else {
      throw new AvailableArticleNotExist("NOT_EXIST");
    }
  }

  private static async loadList(
    snapshot: FirebaseFirestore.QuerySnapshot
  ): Promise<Article[]> {
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return new Article(
        data.guid,
        data.title,
        data.body,
        data.sentences,
        data.creator,
        data.unixtime
      );
    });
  }

  private static filterOldOrLongSentenceArticles(
    contents: { [key: string]: string }[],
    days: number
  ): Article[] {
    const articles: Article[] = [];

    contents.forEach(content => {
      const sentences: string[] = TextSplitter.run(content.contentSnippet);
      const publishedAtUnixTime = moment(content.isoDate).unix();

      if (sentences.length > MAX_SENTENCE_LENGTH) {
        return;
      }

      articles.push(
        new Article(
          content.guid,
          content.title,
          content.contentSnippet,
          sentences,
          content.creator,
          publishedAtUnixTime
        )
      );
    });

    const daysFromNowUnixtime: number = moment()
      .add(-days, "day")
      .unix();
    const currentArticles = articles.filter(
      article => article.unixtime > daysFromNowUnixtime
    );

    return currentArticles;
  }
}
