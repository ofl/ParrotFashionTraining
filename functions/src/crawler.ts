import Parser = require("rss-parser");

export default class Crawler {
  static async getFeedContents(
    url: string
  ): Promise<{ [key: string]: string }[]> {
    const parser = new Parser();
    const feed = await parser.parseURL(url);
    const result: { [key: string]: string }[] = [];

    if (typeof feed.items === "undefined") {
      console.log("no articles exist");
      return result;
    }

    feed.items.forEach(item => {
      if (
        typeof item.guid !== "undefined" &&
        typeof item.title !== "undefined" &&
        typeof item.contentSnippet !== "undefined" &&
        typeof item.isoDate !== "undefined"
      ) {
        result.push({
          guid: item.guid,
          title: item.title,
          contentSnippet: item.contentSnippet,
          creator: item.creator || "",
          isoDate: item.isoDate
        });
      }
    });

    return result;
  }
}
