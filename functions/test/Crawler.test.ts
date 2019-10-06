import { describe, it } from "mocha";
import { assert } from "chai";

import Crawler from "../src/Crawler";

describe(".getFeedContents", () => {
  // const url = "http://feeds.nytimes.com/nyt/rss/World";
  const url = "http://feeds.bbci.co.uk/news/world/rss.xml";
  // const url = "http://feeds.reuters.com/Reuters/worldNews";

  it("RSSのフィードデータが返ること", async () => {
    const result: { [key: string]: string }[] = await Crawler.getFeedContents(
      url
    );

    assert.exists(result);
  });
});
