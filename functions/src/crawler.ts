import Parser = require("rss-parser");
import Article from "./Article";
import TextSplitter from "./TextSplitter";

export default class Crawler {
  static async getFeedContents(url: string): Promise<Article[]> {
    const parser = new Parser();
    const feed = await parser.parseURL(url);
    const result: Article[] = [];

    if (typeof feed.items === "undefined") {
      console.log("no articles exist");
      return result;
    }

    feed.items.forEach(item => {
      if (
        typeof item.guid !== "undefined" &&
        typeof item.title !== "undefined" &&
        typeof item.contentSnippet !== "undefined" &&
        typeof item.creator !== "undefined" &&
        typeof item.isoDate !== "undefined"
      ) {
        result.push(
          new Article(
            item.guid,
            item.title,
            item.contentSnippet,
            TextSplitter.run(item.contentSnippet),
            item.creator,
            item.isoDate
          )
        );
      }
    });

    return result;
  }
}
