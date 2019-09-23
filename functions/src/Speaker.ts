import { Conversation } from "./interfaces";
import SSML from "./SSML";

const READING_SPEED: string[] = ["x-slow", "slow", "medium", "fast", "x-fast"];

export default class Speaker {
  private static instance: Speaker;

  private publisher: string = "";
  private title: string = "";

  private constructor(
    private conv: Conversation,
    public readingSpeed: number,
    private sentence: string,
    private reply: string
  ) {}

  static setUp(
    conv: Conversation,
    readingSpeed: number = Speaker.defaultReadingSpeed(),
    sentence: string = "",
    reply: string = ""
  ) {
    if (!this.instance) {
      this.instance = new this(conv, readingSpeed, sentence, reply);
    }
    return this.instance;
  }

  static defaultReadingSpeed(): number {
    return READING_SPEED.indexOf("medium");
  }

  ask() {
    this.conv.ask(this.ssml);
  }

  close() {
    this.conv.close(this.ssml);
  }

  speakSlowly() {
    if (0 < this.readingSpeed) {
      this.readingSpeed -= 1;
    }
  }

  addReply(value: string) {
    this.reply += value;
  }

  setSentence(value: string) {
    this.sentence = value;
  }

  setTitleAndPublisher(title: string, publisher: string) {
    this.title = title;
    this.publisher = publisher;
  }

  private get ssml() {
    return SSML.enclose(this.body);
  }

  private get body(): string {
    let text = this.reply;
    text += SSML.addBreak(1);

    if (this.title !== "") {
      text += `${this.title} by ${this.publisher}`;
      text += SSML.addBreak(1);
    }

    if (this.sentence !== "") {
      text += SSML.encloseSentence(
        this.sentence,
        READING_SPEED[this.readingSpeed]
      );
    }

    return text;
  }
}
