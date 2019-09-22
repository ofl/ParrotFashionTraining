import Utils from "./Utils";
import Crawler from "./Crawler";
import Article from "./Article";

export default class Batch {
  static async createArticlesFromRSS(days: number = 3) {
    const articles = await Crawler.getFeedContents(
      "http://feeds.nytimes.com/nyt/rss/Technology"
    );

    const unixtime: number = Utils.getUnixtimeOfDaysBeforeNow(days);
    const currentArticles = articles.filter(
      article => article.unixtime > unixtime
    );

    return Article.batchCreate(currentArticles);
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
