import { describe, it } from "mocha";
import { assert } from "chai";

import Utils from "../src/utils";

describe("テストのタイトル", () => {
  it("myFuncのテスト", () => {
    assert.strictEqual(Utils.onePlusOne(), 2);
  });
});
