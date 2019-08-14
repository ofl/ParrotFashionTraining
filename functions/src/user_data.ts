import Utils from "./utils";
import { Conversation } from "./interfaces";

export default class UserData {
  private static instance: UserData;

  private conv: Conversation;
  retryCount: number;
  lastReadUnixtime: number;

  private constructor(
    conv: Conversation,
    retryCount: number,
    lastReadUnixtime: number
  ) {
    this.conv = conv;
    this.retryCount = retryCount;
    this.lastReadUnixtime = lastReadUnixtime;
  }

  static load(conv: Conversation) {
    if (!this.instance) {
      const data = conv.data as {
        retryCount: number;
        lastReadUnixtime: number;
      };
      const oneDayBefore = Utils.getUnixtimeOfDaysBeforeNow(1);

      const unixtime =
        data.lastReadUnixtime && data.lastReadUnixtime > oneDayBefore
          ? data.lastReadUnixtime
          : oneDayBefore;

      this.instance = new this(conv, data.retryCount || 0, unixtime);
    }
    return this.instance;
  }

  save() {
    this.conv.data = {
      retryCount: this.retryCount,
      lastReadUnixtime: this.lastReadUnixtime
    };
  }

  incrementRetryCount() {
    this.retryCount++;
    this.save();
  }

  reset(unixtime: number) {
    this.retryCount = 0;
    this.lastReadUnixtime = unixtime;
    this.save();
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
