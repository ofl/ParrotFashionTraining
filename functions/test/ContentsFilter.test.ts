import { describe, it } from "mocha";
import { assert } from "chai";

import ContentsFilter from "../src/ContentsFilter";

describe(".isIncludingNGWords", () => {
  it("センシティブな単語が含まれる場合Trueとなること", () => {
    const targetSentence =
      'William Finlay told police he should be "shot in the head" after killing the grandmother in her Camelon flat.';

    assert.isTrue(ContentsFilter.isIncludingNGWords(targetSentence));
  });

  it("アプリを操作する単語が含まれる場合Trueとなること", () => {
    const targetSentence =
      "Man who killed ex-wife by shooting her with crossbow";

    assert.isTrue(ContentsFilter.isIncludingNGWords(targetSentence));
  });

  it("NGとなる単語が含まれない場合Falseとなること", () => {
    const targetSentence =
      "More than 30 years later Sweden’s biggest mystery remains unsolved.";

    assert.isNotTrue(ContentsFilter.isIncludingNGWords(targetSentence));
  });
});
