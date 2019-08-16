import { Conversation } from "./interfaces";
import Article from "./article";

// Singleton class
export default class UserData {
  private static instance: UserData;

  private conv: Conversation;
  currentSentence: string;
  articleId: string;
  retryCount: number;

  private constructor(
    conv: Conversation,
    articleId: string,
    currentSentence: string,
    retryCount: number
  ) {
    this.conv = conv;
    this.articleId = articleId;
    this.currentSentence = currentSentence;
    this.retryCount = retryCount;
  }

  static load(conv: Conversation) {
    if (!this.instance) {
      const data = conv.data as {
        articleId: string;
        currentSentence: string;
        retryCount: number;
        lastReadUnixtime: number;
      };

      this.instance = new this(
        conv,
        data.articleId || "",
        data.currentSentence || "",
        data.retryCount || 0
      );
    }
    return this.instance;
  }

  save() {
    this.conv.data = {
      articleId: this.articleId,
      currentSentence: this.currentSentence,
      retryCount: this.retryCount
    };
  }

  incrementRetryCount() {
    this.retryCount++;
    this.save();
  }

  setCurrentPractice(article: Article) {
    this.articleId = article.guid;
    this.retryCount = 0;
    this.currentSentence = article.currentSentence;
    this.save();
  }

  reset() {
    this.articleId = "";
    this.retryCount = 0;
    this.currentSentence = "";
    this.save();
  }

  get isEmpty(): boolean {
    return this.articleId === "";
  }
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
