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
  constructor(private text: string = "") {}

  toSsml(): string {
    return SSML.encloseContent(this.text);
  }

  toText(): string {
    return this.text;
  }
}

class RandomResponse implements SpeechComponent {
  private text: string;

  constructor(keyword: string = "", length: number) {
    this.text =
      keyword === "" ? "" : Dictionary[Utils.randomMessage(keyword, length)];
  }

  toSsml(): string {
    return SSML.encloseContent(this.text);
  }

  toText(): string {
    return this.text;
  }
}

class Credit implements SpeechComponent {
  private text: string;

  constructor(publisher: string, unixtime: number) {
    const fromNow = moment.unix(unixtime).fromNow();
    this.text = `from ${publisher} ${fromNow}. `;
  }

  toSsml(): string {
    return SSML.encloseContent(this.text);
  }

  toText(): string {
    return this.text;
  }
}

class Quote implements SpeechComponent {
  constructor(
    private text: string = "",
    private speakingSpeedRate: number = 100
  ) {}

  toSsml(): string {
    return SSML.encloseTextWithSpeedRate(
      `"${this.text}" `,
      this.speakingSpeedRate
    );
  }

  toText(): string {
    return `"${this.text}" `;
  }
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
    return this.text;
  }

  private get speakingSpeedRate(): number {
    if (this.answerResult.isPoor) {
      return 100;
    }

    return this.answerResult.similarity > 50
      ? this.answerResult.similarity
      : 50;
  }
}

class Break implements SpeechComponent {
  constructor(private time: number = 0.5) {}

  toSsml(): string {
    return SSML.break(this.time);
  }

  toText(): string {
    return " ";
  }
}

class Audio implements SpeechComponent {
  constructor(private src: string, private alt: string) {}

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
