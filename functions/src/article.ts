import { DocumentData } from "@google-cloud/firestore";
import * as moment from "moment";
import Utils from "./Utils";
import TextSplitter from "./TextSplitter";

const NEWS_SOURCES: { [key: string]: string } = {
  "nytimes.com": "New York Times",
  "cnn.com": "CNN",
  "reuters.com": "Reuters",
  "bbc.co.uk": "BBC"
};
const MAX_WORD_COUNT_IN_SENTENCE = 9;
const DAYS_BEFORE = 9;

export default class Article {
  private currentIndex: number;

  constructor(
    readonly guid: string,
    readonly title: string,
    readonly body: string,
    readonly sentences: string[],
    readonly creator: string,
    readonly unixtime: number
  ) {
    this.currentIndex = 0;
  }

  static bulkCreateFromDictionaries(
    dictionaries: { [key: string]: string }[]
  ): Article[] {
    const articles: Article[] = dictionaries.map(dictionary => {
      return this.createFromDictionary(dictionary);
    });

    return articles
      .filter(article => !article.isTooOld())
      .filter(article => !article.hasTooManyWordInSentence());
  }

  static createFromDocumentData(data: DocumentData): Article {
    return new Article(
      data.guid,
      data.title,
      data.body,
      data.sentences,
      data.creator,
      data.unixtime
    );
  }

  static createFromDictionary(dictionary: { [key: string]: string }): Article {
    const sentences: string[] = TextSplitter.run(dictionary.contentSnippet);
    const unixTimeOfPublishedAt = moment(dictionary.isoDate).unix();

    return new Article(
      dictionary.guid,
      dictionary.title,
      dictionary.contentSnippet,
      sentences,
      dictionary.creator,
      unixTimeOfPublishedAt
    );
  }

  setIndex(currentQuestionText: string) {
    this.currentIndex = this.sentences.indexOf(currentQuestionText);
  }

  toObject(): Object {
    return {
      guid: this.guid,
      title: this.title,
      body: this.body,
      sentences: this.sentences,
      creator: this.creator,
      unixtime: this.unixtime
    };
  }

  incrementIndex() {
    this.currentIndex++;
  }

  get questionText(): string {
    return this.sentences[this.currentIndex];
  }

  get publisher(): string {
    return this.newsSource || this.creator;
  }

  get newsSource(): string | null {
    return Utils.findValueOfKeyInText(this.guid, NEWS_SOURCES);
  }

  get hasNextQuestionText(): boolean {
    return this.currentIndex < this.sentences.length - 1;
  }

  get isFirstQuestionText(): boolean {
    return this.currentIndex === 0;
  }

  hasTooManyWordInSentence(max: number = MAX_WORD_COUNT_IN_SENTENCE): boolean {
    return Utils.maxWordCountInSentences(this.sentences) > max;
  }

  isTooOld(days: number = DAYS_BEFORE): boolean {
    const daysFromNow: number = moment()
      .add(-days, "day")
      .unix();

    return this.unixtime < daysFromNow;
  }
}
