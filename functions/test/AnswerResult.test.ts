import { describe, it } from "mocha";
import { assert } from "chai";

import AnswerResult from "../src/AnswerResult";

describe(".textSimilarity", () => {
  const originalSentence =
    "A New TV Show from The New York Times on FX and Hulu.";

  it("比較されたテキストの類似度が返ること1", () => {
    const targetSentence =
      "A New TV Show from The New York Times on FX and Hulu";

    assert.equal(
      AnswerResult.textSimilarity(originalSentence, targetSentence),
      100
    );
  });

  it("比較されたテキストの類似度が返ること2", () => {
    const targetSentence = "A New TV Show from CNN on FX and Hulu";

    assert.equal(
      AnswerResult.textSimilarity(originalSentence, targetSentence),
      67
    );
  });

  it("比較されたテキストの類似度が返ること3", () => {
    const targetSentence = "A New TV Show from CNN on FX";

    assert.equal(
      AnswerResult.textSimilarity(originalSentence, targetSentence),
      50
    );
  });
});

describe(".removePunctuations", () => {
  it("記号を取り除いて小文字化したテキストが返ること1", () => {
    const targetSentence =
      "Many of Thursday's front pages focus on the US president's extraordinary election intervention.";

    assert.equal(
      AnswerResult.normalize(targetSentence),
      "many of thursday s front pages focus on the us president s extraordinary election intervention"
    );
  });

  it("記号を取り除いて小文字化したテキストが返ること2", () => {
    const targetSentence =
      "Janice Farman was killed in front of her 10-year-old son during a robbery at her home in July 2017.";

    assert.equal(
      AnswerResult.normalize(targetSentence),
      "janice farman was killed in front of her 10 year old son during a robbery at her home in july 2017"
    );
  });
});
