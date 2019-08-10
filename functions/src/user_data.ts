import { DialogflowConversation, Contexts } from "actions-on-google";
import Utils from "./utils";

type Conversation = DialogflowConversation<unknown, unknown, Contexts>;

export default class UserData {
  retryCount: number;
  lastReadUnixtime: number;

  constructor(retryCount: number, lastReadUnixtime: number) {
    this.retryCount = retryCount;
    this.lastReadUnixtime = lastReadUnixtime;
  }

  static load(conv: Conversation): UserData {
    const data = conv.data as { retryCount: number; lastReadUnixtime: number };
    const oneDayBefore = Utils.oneDayBeforeNow();

    const unixtime =
      data.lastReadUnixtime && data.lastReadUnixtime > oneDayBefore
        ? data.lastReadUnixtime
        : oneDayBefore;

    return new this(data.retryCount || 0, unixtime);
  }

  static save(conv: Conversation, userData: UserData) {
    conv.data = {
      retryCount: userData.retryCount,
      lastReadUnixtime: userData.lastReadUnixtime
    };
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
