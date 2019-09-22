import { describe, it } from "mocha";
import { assert } from "chai";

import TextSplitter from "../src/TextSplitter";

describe(".run", () => {
  it("文章が適切な位置で分割されること1", () => {
    const testText =
      "Democrats and recommend Republicans at both the federal and state levels are uniting to investigate the power of Big Tech and, potentially, to rein in the dominant companies.";

    assert.sameMembers(TextSplitter.run(testText), [
      "Democrats and recommend Republicans at both the federal",
      " and state levels are uniting to investigate the power of Big Tech and, potentially, ",
      "to rein in the dominant companies."
    ]);
  });

  it("文章が適切な位置で分割されること2", () => {
    const testText =
      "Even before women had the right to vote, Blaché, in her actions and in her films, expressed female drives, desires and self-determination.";

    assert.sameMembers(TextSplitter.run(testText), [
      "Even before women had the right to vote, ",
      "Blaché, in her actions and in her films, ",
      "expressed female drives, ",
      "desires and self-determination."
    ]);
  });

  it("文章が適切な位置で分割されること3", () => {
    const testText =
      "Hackers have been targeting regular people and celebrities with the attack. Last week, it was used to hijack the Twitter account of Twitter’s C.E.O.";

    assert.sameMembers(TextSplitter.run(testText), [
      "Hackers have been targeting regular people",
      " and celebrities with the attack.Last week, ",
      "it was used to hijack the Twitter account of Twitter’s C.E.O."
    ]);
  });

  it("文章が適切な位置で分割されること4", () => {
    const testText =
      "As Bangladesh vowed to cut off mobile phone access in Rohingya camps, refugees who fled terror in Myanmar despaired over their future.";

    assert.sameMembers(TextSplitter.run(testText), [
      "As Bangladesh vowed to cut off mobile phone access in Rohingya camps, refugees",
      " who fled terror in Myanmar despaired over their future."
    ]);
  });

  it("文章が適切な位置で分割されること5", () => {
    const testText =
      "Health officials around the country are still investigating numerous possible causes and have tested only some of the devices used by ill patients.";

    assert.sameMembers(TextSplitter.run(testText), [
      "Health officials around the country are still investigating numerous possible causes",
      " and have tested only some of the devices used by ill patients."
    ]);
  });

  it("文章が適切な位置で分割されること6", () => {
    const testText =
      "A surge of severe lung ailments has baffled doctors and public health experts.";

    assert.sameMembers(TextSplitter.run(testText), [
      "A surge of severe lung ailments has baffled doctors",
      " and public health experts."
    ]);
  });

  it("文章が適切な位置で分割されること7", () => {
    const testText =
      "To expand the pool of workers, companies are recruiting stay-at-home parents, retirees and people with disabilities.";

    assert.sameMembers(TextSplitter.run(testText), [
      "To expand the pool of workers, ",
      "companies are recruiting stay-at-home parents, ",
      "retirees and people with disabilities."
    ]);
  });

  it("文章が適切な位置で分割されること8", () => {
    const testText = "A New TV Show from The New York Times on FX and Hulu";
    assert.sameMembers(TextSplitter.run(testText), [testText]);
  });
});

// describe(".splitSentenceWithPunctuations", () => {
//   it("punctuationsが空の配列の場合、全文が返ること", () => {
//     const testSentence = "a b c d e f g h i j k l, m n o p q r s t u v w x y z";
//     const punctuations: string[] = [];

//     assert.sameMembers(
//       TextSplitter.splitSentenceWithPunctuations(
//         testSentence,
//         punctuations,
//         10
//       ),
//       [testSentence]
//     );
//   });

//   it("文章が十分短い場合、全文が返ること", () => {
//     const testSentence = "k l, m n";
//     const punctuations: string[] = [","];

//     assert.sameMembers(
//       TextSplitter.splitSentenceWithPunctuations(testSentence, punctuations, 5),
//       [testSentence]
//     );
//   });

//   it("文章がpunctuationsで分割された配列が返ること", () => {
//     const testSentence =
//       "a b c d e f/ g h i j k l, m n o p q r s: t u v w x y z";
//     const punctuations: string[] = [",", ":", "/"];

//     assert.sameMembers(
//       TextSplitter.splitSentenceWithPunctuations(testSentence, punctuations, 5),
//       ["a b c d e f/ ", "g h i j k l, ", "m n o p q r s: ", "t u v w x y z"]
//     );
//   });
// });

// describe(".matchedPunctuation", () => {
//   it("文章に含まれるdelimiterの配列が返ること", () => {
//     const testSentence =
//       "So what I want is that my problem, when she was young?";
//     const delimiters = ["\\,", "\\:", "\\?"];

//     assert.sameMembers(
//       TextSplitter.matchedPunctuations(testSentence, delimiters),
//       [","]
//     );
//   });
// });

// describe(".rejoinText", () => {
//   it("単語の羅列のためのカンマの場合分割しないこと", () => {
//     const testSentences = [
//       "Orange, ",
//       "apple, ",
//       "banana, ",
//       "and grape are fruits, ",
//       "but carrot is vegetable."
//     ];

//     assert.sameMembers(TextSplitter.rejoinText(testSentences), [
//       "Orange, apple, banana, and grape are fruits, ",
//       "but carrot is vegetable."
//     ]);
//   });
// });

// describe(".matchedDelimiters", () => {
//   it("文章に含まれるdelimiterの配列が返ること", () => {
//     const testSentence =
//       "So what I want is that my problem when she was young.";
//     const delimiters = ["what", "who", "where", "when", "why", "how", "whose"];

//     assert.sameMembers(
//       TextSplitter.matchedDelimiters(testSentence, delimiters),
//       ["what", "when"]
//     );
//   });
// });
