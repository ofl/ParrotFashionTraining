import Utils from "./Utils";

const NEWS_SOURCES: { [key: string]: string } = {
  "nytimes.com": "New York Times",
  "cnn.com": "CNN",
  "reuters.com": "Reuters",
  "bbc.co.uk": "BBC"
};

export default class Article {
  currentIndex: number;

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

  get currentSentence(): string {
    return this.sentences[this.currentIndex];
  }

  get publisher(): string {
    return this.newsSource || this.creator;
  }

  get newsSource(): string | null {
    return Utils.findValueOfKeyInText(this.guid, NEWS_SOURCES);
  }
}
