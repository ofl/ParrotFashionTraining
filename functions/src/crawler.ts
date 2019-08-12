import Parser = require("rss-parser");

export default class Crawler {
  static async getFeedContents(url: string): Promise<string[]> {
    const parser = new Parser();
    const feed = await parser.parseURL(url);

    if (typeof feed.items === "undefined") {
      console.log("no feeds exist");
      return [];
    }

    return feed.items.map(item => {
      return item.contentSnippet as string;
    });
  }
}
