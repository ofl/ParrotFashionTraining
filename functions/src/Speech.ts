import SSML from "./SSML";
const moment = require("moment");

const Dictionary: { [key: string]: string } = {
  WELCOME: "Welcome to Parrot Fashion Training.",
  BYE_1: "Goodbye.",
  BYE_2: "Bye.",
  BYE_3: "See you again.",
  YELL_1: "Let's start.",
  YELL_2: "Let's begin.",
  YELL_3: "Here we go.",
  ACCEPTED_1: "Okay.",
  ACCEPTED_2: "All right!",
  ACCEPTED_3: "Sure!",
  AGAIN: "Try again!",
  EXCELLENT_1: "Perfect!",
  EXCELLENT_2: "Excellent!",
  GOOD_1: "OK!",
  GOOD_2: "Good job!",
  GOOD_3: "Well done!",
  REGRETTABLE_1: "So close!",
  REGRETTABLE_2: "Almost had it!",
  POOR_1: "Don't mind!",
  POOR_2: "Let's do your best next time!",
  SKIP_SENTENCE: "Let's start next sentence.",
  SKIP_ARTICLE: "Let's start next article.",
  INTRODUCTION: "The title of the next article is",
  REPEAT_AFTER_ME: "Repeat after me.",
  FROM: "from {{source}} {{fromNow}}",
  NOT_FOUND: "Current sentence not found",
  NOT_EXIST: "Articles for practice not found"
};

enum SpeechType {
  Continue,
  Ask,
  Close
}

type Speech = Reply | Credit | RawText | Break;

interface SSMLConvertAble {
  toSsml(): string;
  speechType: SpeechType;
}

class Reply implements SSMLConvertAble {
  constructor(
    public keyword: string = "",
    public speechType: SpeechType = SpeechType.Ask
  ) {}

  toSsml(): string {
    if (this.keyword === "") {
      return "";
    }

    return SSML.encloseMessage(Dictionary[this.keyword]);
  }
}

class Credit implements SSMLConvertAble {
  constructor(
    public publisher: string,
    public unixtime: number,
    public speechType: SpeechType = SpeechType.Ask
  ) {}

  toSsml(): string {
    const fromNow = moment.unix(this.unixtime).fromNow();
    const credit = `from ${this.publisher} ${fromNow}`;

    return SSML.encloseMessage(credit);
  }
}

class RawText implements SSMLConvertAble {
  constructor(
    public text: string = "",
    public readingSpeed: number = 100,
    public speechType: SpeechType = SpeechType.Ask
  ) {}

  toSsml(): string {
    return SSML.encloseRawText(` "${this.text}"`, `${this.readingSpeed}%`);
  }
}

class Break implements SSMLConvertAble {
  constructor(
    public time: number = 0.5,
    public speechType: SpeechType = SpeechType.Ask
  ) {}

  toSsml(): string {
    return SSML.addBreak(this.time);
  }
}

export { Speech, Reply, Credit, RawText, Break, SpeechType };
