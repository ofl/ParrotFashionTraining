import { describe, it } from "mocha";
import { assert } from "chai";

import Utils from "../src/Utils";

describe(".textSimilarity", () => {
  const originalSentence =
    "A New TV Show from The New York Times on FX and Hulu.";

  it("比較されたテキストの類似度が返ること1", () => {
    const targetSentence =
      "A New TV Show from The New York Times on FX and Hulu";

    assert.equal(Utils.textSimilarity(originalSentence, targetSentence), 100);
  });

  it("比較されたテキストの類似度が返ること2", () => {
    const targetSentence = "A New TV Show from CNN on FX and Hulu";

    assert.equal(Utils.textSimilarity(originalSentence, targetSentence), 79);
  });

  it("比較されたテキストの類似度が返ること3", () => {
    const targetSentence = "A New TV Show from CNN on FX";

    assert.equal(Utils.textSimilarity(originalSentence, targetSentence), 62);
  });
});

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

describe(".selectRandomly", () => {
  it("文字列の配列を渡すとランダムな文字が返ること", () => {
    const array: string[] = ["foo", "bar", "baz"];

    assert.isString(Utils.selectRandomly(array));
  });

  it("数値の配列を渡すとランダムな数値が返ること", () => {
    const array: number[] = [1, 2, 3];

    assert.isNumber(Utils.selectRandomly(array));
  });
});

describe(".maxWordCountInSentences", () => {
  it("テキストの配列を渡すと最も大きい単語数が返ること", () => {
    const array: string[] = ["foo bar baz", "bar foo bar baz", "baz bsr"];

    assert.equal(Utils.maxWordCountInSentences(array), 4);
  });
});

describe(".countWord", () => {
  it("テキストの配列を渡すと最も大きい単語数が返ること", () => {
    const sentence: string =
      "No 10 source says an accompanying letter makes clear Boris Johnson believes an extension would be a mistake.";

    assert.equal(Utils.countWord(sentence), 18);
  });
});
