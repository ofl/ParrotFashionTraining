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
  NOT_EXIST: "Articles for practice not found",
  CONTINUE_PRACTICE: "Do you want to continue?"
};

interface Speech {
  toSsml(): string;
  toText(): string;
}

class Reply implements Speech {
  constructor(public keyword: string = "") {}

  toSsml(): string {
    if (this.keyword === "") {
      return "";
    }
    return SSML.encloseMessage(Dictionary[this.keyword]);
  }

  toText(): string {
    if (this.keyword === "") {
      return "";
    }
    return Dictionary[this.keyword];
  }
}

class Credit implements Speech {
  constructor(public publisher: string, public unixtime: number) {}

  toSsml(): string {
    return SSML.encloseMessage(this.toText());
  }

  toText(): string {
    const fromNow = moment.unix(this.unixtime).fromNow();
    return `from ${this.publisher} ${fromNow}`;
  }
}

class Quote implements Speech {
  constructor(public text: string = "", public readingSpeed: number = 100) {}

  toSsml(): string {
    return SSML.encloseQuote(`"${this.text}"`, `${this.readingSpeed}%`);
  }

  toText(): string {
    return `"${this.text}"`;
  }
}

class RawText implements Speech {
  constructor(public text: string = "") {}

  toSsml(): string {
    return this.text;
  }

  toText(): string {
    return this.text;
  }
}

class Break implements Speech {
  constructor(public time: number = 0.5) {}

  toSsml(): string {
    return SSML.addBreak(this.time);
  }

  toText(): string {
    return " ";
  }
}

export { Speech, Reply, Credit, Quote, RawText, Break };
