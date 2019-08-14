import Utils from "./utils";
import Crawler from "./crawler";
import Article from "./article";

export default class Batch {
  static async createArticlesFromRSS() {
    const articles = await Crawler.getFeedContents(
      "http://feeds.nytimes.com/nyt/rss/Technology"
    );

    return Article.batchCreate(articles);
  }

  static async deleteOldArticles(days: number = 3): Promise<void> {
    const unixtime: number = Utils.getUnixtimeOfDaysBeforeNow(days);
    const snapshot = await Article.getQuery(unixtime, "<").get();

    if (snapshot.size === 0) {
      console.log("nothing to delete");
      return;
    }

    return Article.batchDelete(snapshot);
  }
}
