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
      79
    );
  });

  it("比較されたテキストの類似度が返ること3", () => {
    const targetSentence = "A New TV Show from CNN on FX";

    assert.equal(
      AnswerResult.textSimilarity(originalSentence, targetSentence),
      62
    );
  });
});
