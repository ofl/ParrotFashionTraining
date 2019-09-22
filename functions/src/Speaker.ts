import { Conversation } from "./interfaces";
import SSML from "./SSML";

export default class Speaker {
  static readonly READING_SPEED: string[] = [
    "x-slow",
    "slow",
    "medium",
    "fast",
    "x-fast"
  ];

  private static instance: Speaker;

  private constructor(
    private conv: Conversation,
    public readingSpeed: number,
    private sentence: string,
    private reply: string
  ) {}

  static setUp(
    conv: Conversation,
    readingSpeed: number = Speaker.READING_SPEED.indexOf("medium"),
    sentence: string = "",
    reply: string = ""
  ) {
    if (!this.instance) {
      this.instance = new this(conv, readingSpeed, sentence, reply);
    }
    return this.instance;
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

  private get ssml() {
    return SSML.enclose(this.body);
  }

  private get body(): string {
    return this.sentence === ""
      ? this.reply
      : this.reply +
          SSML.encloseSentence(
            this.sentence,
            Speaker.READING_SPEED[this.readingSpeed]
          );
  }
}