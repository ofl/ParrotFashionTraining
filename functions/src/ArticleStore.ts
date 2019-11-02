import * as firebase from "firebase-admin";
import * as moment from "moment";

import Article from "./Article";
import { AvailableArticleNotExist, ArticleNotFound } from "./errors";
import Utils from "./Utils";

import { Query } from "@google-cloud/firestore";

const firestore = firebase.firestore();
const ARTICLE_COLLECTION_PATH = "articles";

export default class ArticleStore {
  static async findOnePublishedBefore(
    unixtime: number = moment().unix()
  ): Promise<Article> {
    const query = this.queryPublishedBefore(unixtime);
    return await this.findOne(query);
  }

  static async findOneIncludingNextQuestionText(
    articleId: string,
    currentQuestionText: string
  ): Promise<Article> {
    const currentArticle = await this.get(Utils.md5hex(articleId));
    currentArticle.setIndex(currentQuestionText);

    if (currentArticle.hasNextQuestionText) {
      currentArticle.incrementIndex();

      return currentArticle;
    }

    return await this.findOnePublishedBefore(currentArticle.unixtime);
  }

  static queryPublishedBefore(unixtime: number): Query {
    return firestore
      .collection(ARTICLE_COLLECTION_PATH)
      .where("unixtime", "<", unixtime)
      .orderBy("unixtime", "desc");
  }

  static async bulkCreate(
    dictionaries: { [key: string]: string }[]
  ): Promise<void> {
    const batch = firestore.batch();

    const articles = Article.bulkCreateFromDictionaries(dictionaries);
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

  static async bulkDelete(
    snapshot: FirebaseFirestore.QuerySnapshot
  ): Promise<void> {
    console.log(`deleting ${snapshot.docs.length} articles`);

    const batch = firestore.batch();

    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  }

  private static async findOne(query: Query): Promise<Article> {
    const snapshot = await query.limit(1).get();
    const articles: Article[] = await this.list(snapshot);

    if (articles.length === 0) {
      throw new AvailableArticleNotExist("NOT_EXIST");
    }

    return articles[0];
  }

  private static async get(articleId: string): Promise<Article> {
    const doc = await firestore
      .collection(ARTICLE_COLLECTION_PATH)
      .doc(articleId)
      .get();

    const data = doc.data();
    if (!data) {
      throw new ArticleNotFound("Article not found");
    }

    return Article.createFromDocumentData(data);
  }

  private static async list(
    snapshot: FirebaseFirestore.QuerySnapshot
  ): Promise<Article[]> {
    return snapshot.docs.map(doc => {
      return Article.createFromDocumentData(doc.data());
    });
  }
}
