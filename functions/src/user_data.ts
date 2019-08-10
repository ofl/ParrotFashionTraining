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
