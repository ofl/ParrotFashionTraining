import { DialogflowConversation, Contexts } from "actions-on-google";
import Article from "./Article";
import Scenario from "./Scenario";

// Singleton class
export default class UserData {
  private static instance: UserData;

  private constructor(
    private conv: DialogflowConversation<unknown, unknown, Contexts>,
    public articleId: string,
    public currentSentence: string,
    public retryCount: number,
    public readingSpeed: number
  ) {}

  static load(conv: DialogflowConversation<unknown, unknown, Contexts>) {
    if (!this.instance) {
      const data = conv.data as {
        articleId: string;
        currentSentence: string;
        retryCount: number;
        readingSpeed: number;
        lastReadUnixtime: number;
      };

      this.instance = new this(
        conv,
        data.articleId || "",
        data.currentSentence || "",
        data.retryCount || 0,
        data.readingSpeed || Scenario.defaultReadingSpeed
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

  setReadingSpeed(value: number) {
    this.readingSpeed = value;
    this.save;
  }

  setCurrentPractice(article: Article) {
    this.articleId = article.guid;
    this.retryCount = 0;
    this.currentSentence = article.currentSentence;
    this.readingSpeed = Scenario.defaultReadingSpeed;
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
