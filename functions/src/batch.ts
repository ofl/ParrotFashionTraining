import Crawler from "./crawler";
import Article from "./article";

export default class Batch {
  static async createArticlesFromRSS() {
    const articles = await Crawler.getFeedContents(
      "http://feeds.nytimes.com/nyt/rss/Technology"
    );

    return Article.batchCreate(articles);
  }
}
