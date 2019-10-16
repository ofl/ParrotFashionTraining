import Utils from "./Utils";
import Crawler from "./Crawler";
import ArticleStore from "./ArticleStore";
import * as moment from "moment";

const SOURCES: string[] = [
  "http://feeds.nytimes.com/nyt/rss/World",
  "http://feeds.nytimes.com/nyt/rss/US",
  "http://feeds.nytimes.com/nyt/rss/Business",
  "http://feeds.nytimes.com/nyt/rss/Technology",
  "http://feeds.nytimes.com/nyt/rss/Sports",
  "http://feeds.nytimes.com/nyt/rss/Science",
  "http://feeds.nytimes.com/nyt/rss/Health",
  "http://feeds.nytimes.com/nyt/rss/Arts",
  "http://feeds.bbci.co.uk/news/world/rss.xml",
  "http://feeds.bbci.co.uk/news/uk/rss.xml",
  "http://feeds.bbci.co.uk/news/business/rss.xml",
  "http://feeds.bbci.co.uk/news/politics/rss.xml",
  "http://feeds.bbci.co.uk/news/health/rss.xml",
  "http://feeds.bbci.co.uk/news/education/rss.xml",
  "http://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
  "http://feeds.bbci.co.uk/news/technology/rss.xml",
  "http://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml",
  "http://feeds.bbci.co.uk/news/uk/rss.xml",
  "http://feeds.bbci.co.uk/news/uk/rss.xml",
  "http://feeds.bbci.co.uk/news/uk/rss.xml",
  "http://feeds.bbci.co.uk/news/uk/rss.xml",
  "http://feeds.bbci.co.uk/news/uk/rss.xml",
  "http://feeds.reuters.com/news/artsculture",
  "http://feeds.reuters.com/reuters/businessNews",
  "http://feeds.reuters.com/reuters/companyNews",
  "http://feeds.reuters.com/reuters/entertainment",
  "http://feeds.reuters.com/reuters/environment",
  "http://feeds.reuters.com/reuters/healthNews",
  "http://feeds.reuters.com/reuters/lifestyle",
  "http://feeds.reuters.com/news/wealth",
  "http://feeds.reuters.com/reuters/oddlyEnoughNews",
  "http://feeds.reuters.com/ReutersPictures",
  "http://feeds.reuters.com/reuters/peopleNews",
  "http://feeds.reuters.com/Reuters/PoliticsNews",
  "http://feeds.reuters.com/reuters/scienceNews",
  "http://feeds.reuters.com/reuters/sportsNews",
  "http://feeds.reuters.com/reuters/technologyNews",
  "http://feeds.reuters.com/reuters/topNews",
  "http://feeds.reuters.com/Reuters/domesticNews",
  "http://feeds.reuters.com/Reuters/worldNews"
];

export default class Batch {
  static async createArticlesFromRSS() {
    const contents = await Crawler.getFeedContents(
      Utils.selectRandomly(SOURCES)
    );

    return ArticleStore.batchCreate(contents);
  }

  static async deleteOldArticles(days: number = 1): Promise<void> {
    const unixtime: number = moment()
      .add(-days, "day")
      .unix();
    const snapshot = await ArticleStore.queryOfPublishedBefore(unixtime).get();

    if (snapshot.size === 0) {
      console.log("nothing to delete");
      return;
    }

    return ArticleStore.batchDelete(snapshot);
  }
}
