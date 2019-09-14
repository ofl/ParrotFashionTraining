import { describe, it } from "mocha";
import { assert } from "chai";

import Utils from "../src/utils";

describe(".findValueOfKeyInText", () => {
  const NEWS_SOURCES: { [key: string]: string } = {
    "cnn.com": "CNN",
    "nytimes.com": "New York Times",
    "reuters.com": "Reuters"
  };

  it("文章にKeyが含まれている場合は対応するValueが返ること", () => {
    const guid =
      "https://www.nytimes.com/2019/09/09/health/vaping-juul-e-cigarettes-fda.html";

    assert.equal(
      Utils.findValueOfKeyInText(guid, NEWS_SOURCES),
      "New York Times"
    );
  });

  it("文章にKeyが含まれていない場合は対応するnullが返ること", () => {
    const guid =
      "https://www.bbc.com/2019/09/09/health/vaping-juul-e-cigarettes-fda.html";

    assert.isNull(Utils.findValueOfKeyInText(guid, NEWS_SOURCES));
  });
});
