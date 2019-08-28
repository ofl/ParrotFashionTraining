const Tokenizer = require("sentence-tokenizer");
const crypto = require("crypto");

export default class Utils {
  static getUnixtimeOfDaysBeforeNow(days: number = 1): number {
    return new Date().getTime() - 60 * 60 * 24 * 1000 * days;
  }

  static percentageOfSimilarity(
    originalSentence: string,
    targetSentence: string
  ): number {
    const orginalWords = new Set(this.sentenceToWordArray(originalSentence));
    const targetWords = new Set(this.sentenceToWordArray(targetSentence));
    const intersection = new Set(
      [...orginalWords].filter(e => targetWords.has(e))
    );

    return Math.round((intersection.size / orginalWords.size) * 100);
  }

  static sentenceToWordArray(sentence: string): string[] {
    const words = sentence.match(/\S+/g);
    if (words === null) {
      return [];
    }

    return words.map(word => {
      return word.toLowerCase();
    });
  }

  static textToSentences(text: string): string[] {
    return this.getTokenizer(text).getSentences();
  }

  static splitSentenceWithComma(text: string): string[] {
    if (this.sentenceIsShortEnough(text)) {
      return [text];
    }
    const array = text.split(",");
    if (array.length < 2) {
      return [text];
    }
    const result: string[] = [];
    var currentText = array[0];
    for (let index = 1; index < array.length; index++) {
      const nextText = array[index];
      if (nextText.split(/\s/).length < 3 || /^\s*and\s/.test(nextText)) {
        result.push(`${currentText},${nextText}`);
      } else {
        result.push(currentText);
        currentText = nextText;
      }
    }
    return result;
  }

  static md5hex(str: string) {
    const md5 = crypto.createHash("md5");
    return md5.update(str, "binary").digest("hex");
  }

  private static sentenceIsShortEnough(text: string): boolean {
    const tokenizer = this.getTokenizer(text);
    const tokens = tokenizer.getTokens();

    return tokens.lengt < 10;
  }

  private static getTokenizer(text: string): any {
    const tokenizer = new Tokenizer("Chuck");
    tokenizer.setEntry(text);

    return tokenizer;
  }
}
