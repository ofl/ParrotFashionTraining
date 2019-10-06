import Utils from "./Utils";
import Crawler from "./Crawler";
import Article from "./Article";
import * as moment from "moment";

export default class Batch {
  static async createArticlesFromRSS(days: number = 1) {
    const articles = await Crawler.getFeedContents(
      "http://feeds.nytimes.com/nyt/rss/Technology"
    );

    const unixtime: number = moment()
      .add(-days, "day")
      .unix();
    const currentArticles = articles.filter(
      article => article.unixtime > unixtime
    );

    return Article.batchCreate(currentArticles);
  }

  static async deleteOldArticles(days: number = 1): Promise<void> {
    const unixtime: number = moment()
      .add(-days, "day")
      .unix();
    const snapshot = await Article.getBefore(unixtime).get();

    if (snapshot.size === 0) {
      console.log("nothing to delete");
      return;
    }

    return Article.batchDelete(snapshot);
  }
}
