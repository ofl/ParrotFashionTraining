import Utils from "./Utils";
import Crawler from "./Crawler";
import TextSplitter from "./TextSplitter";
import Article from "./Article";
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
const EASINESS_WEIGHT: number = 10000000000;

export default class Batch {
  static async createArticlesFromRSS(days: number = 1) {
    const articles: Article[] = [];

    const contents = await Crawler.getFeedContents(
      Utils.selectRandomly(SOURCES)
    );
    contents.forEach(content => {
      const sentences: string[] = TextSplitter.run(content.contentSnippet);
      const maxWordCount = Utils.maxWordCountInSentences(sentences);
      const easinessAndDate = EASINESS_WEIGHT * maxWordCount - unixtime;

      articles.push(
        new Article(
          content.guid,
          content.title,
          content.contentSnippet,
          sentences,
          easinessAndDate,
          content.creator,
          moment(content.isoDate).unix()
        )
      );
    });

    const unixtime: number = moment()
      .add(-days, "day")
      .unix();
    const currentArticles = articles.filter(
      article => article.unixtime > unixtime
    );

    return Article.batchCreate(currentArticles);
  }

  static async deleteOldArticles(days: number = 2): Promise<void> {
    const unixtime: number = moment()
      .add(-days, "day")
      .unix();
    const snapshot = await Article.queryOfPublishedBefore(unixtime).get();

    if (snapshot.size === 0) {
      console.log("nothing to delete");
      return;
    }

    return Article.batchDelete(snapshot);
  }
}
