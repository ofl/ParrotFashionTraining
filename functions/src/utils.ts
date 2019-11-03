const crypto = require("crypto");

export default class Utils {
  static md5hex(str: string) {
    const md5 = crypto.createHash("md5");
    return md5.update(str, "binary").digest("hex");
  }

  static findKeyInText(
    text: string,
    dict: { [key: string]: string }
  ): string | undefined {
    const result: string | undefined = Object.keys(dict).find(domain => {
      return text.indexOf(domain) >= 0;
    });

    return result;
  }

  static selectRandomly<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  static randomMessage(key: string, length: number): string {
    return `${key}_${this.dice(length)}`;
  }

  static dice(length: number): number {
    return Math.floor(Math.random() * length) + 1;
  }

  static maxWordCountOfTextInArray(array: string[]): number {
    let maxWordCount = 0;
    array.forEach(text => {
      maxWordCount = Math.max(maxWordCount, this.countWord(text));
    });

    return maxWordCount;
  }

  static countWord(text: string): number {
    return text.split(/\b\s\b/).length;
  }
}
