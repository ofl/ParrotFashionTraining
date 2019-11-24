import SSML from "./SSML";
import Utils from "./Utils";
import AnswerResult from "./AnswerResult";
const moment = require("moment");

const Dictionary: { [key: string]: string } = {
  WELCOME: "Welcome to Parrot Fashion Training.",
  DESCRIPTION: "This application reads short sentences from English news.",
  HOW_TO_USE: "Please repeat it, after beep sound.",
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
  EXCELLENT_3: "Great!",
  GOOD_1: "OK!",
  GOOD_2: "Good job!",
  GOOD_3: "Well done!",
  REGRETTABLE_1: "So close!",
  REGRETTABLE_2: "Almost had it!",
  REGRETTABLE_3: "Nearly there!",
  POOR_1: "Don't mind!",
  POOR_2: "Never mind!",
  POOR_3: "Let's do your best next time!",
  EXCELLENT: "Alright!",
  GOOD: "OK!",
  REGRETTABLE: "So close!",
  POOR: "Don't mind!",
  SKIP_QUESTION_TEXT: "Let's start next sentence.",
  SKIP_ARTICLE: "Let's start next article.",
  INTRODUCTION: "The title of the next article is",
  REPEAT_AFTER_ME: "Repeat after me.",
  FROM: "from {{source}} {{fromNow}}",
  NOT_FOUND: "Current sentence not found",
  NOT_EXIST: "Articles for practice not found",
  CONTINUE_PRACTICE: "Do you want to continue?",
  BYE_PRACTICE_CONFIRMATION:
    "Are you sure want to stop Parrot fashion training?",
  BEEP_SOUND_URL: "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
};

interface SpeechComponent {
  toSsml(): string;
  toText(): string;
}

class Response implements SpeechComponent {
  constructor(public text: string = "") {}

  toSsml(): string {
    if (this.text === "") {
      return "";
    }
    return SSML.encloseContent(this.text);
  }

  toText(): string {
    return this.text;
  }
}

class RandomResponse implements SpeechComponent {
  constructor(public keyword: string = "", public length: number) {}

  toSsml(): string {
    if (this.keyword === "") {
      return "";
    }
    return SSML.encloseContent(
      Dictionary[Utils.randomMessage(this.keyword, this.length)]
    );
  }

  toText(): string {
    if (this.keyword === "") {
      return "";
    }
    return Dictionary[Utils.randomMessage(this.keyword, this.length)];
  }
}

class Credit implements SpeechComponent {
  constructor(public publisher: string, public unixtime: number) {}

  toSsml(): string {
    return SSML.encloseContent(this.toText());
  }

  toText(): string {
    const fromNow = moment.unix(this.unixtime).fromNow();
    return `from ${this.publisher} ${fromNow}.`;
  }
}

class Quote implements SpeechComponent {
  constructor(
    public text: string = "",
    public speakingSpeedRate: number = 100
  ) {}

  toSsml(): string {
    return SSML.encloseQuote(`"${this.text}"`, `${this.speakingSpeedRate}%`);
}

class Result implements SpeechComponent {
  private text: string;

  constructor(private answerResult: AnswerResult) {
    this.text = Dictionary[Utils.randomMessage(answerResult.keyword, 3)];
  }

  toSsml(): string {
    return SSML.encloseTextWithSpeedRate(this.text, this.speakingSpeedRate);
  }

  toText(): string {
    return `"${this.text}"`;
  }
}

class Break implements SpeechComponent {
  constructor(public time: number = 0.5) {}

  toSsml(): string {
    return SSML.break(this.time);
  }

  toText(): string {
    return " ";
  }
}

class Audio implements SpeechComponent {
  constructor(public src: string, public alt: string) {}

  toSsml(): string {
    return SSML.audio(this.src, this.alt);
  }

  toText(): string {
    return this.alt;
  }
}

export {
  SpeechComponent,
  Dictionary,
  Response,
  RandomResponse,
  Credit,
  Quote,
  Result,
  Break,
  Audio
};
