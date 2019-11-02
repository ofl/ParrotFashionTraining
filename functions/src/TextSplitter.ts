import Utils from "./Utils";

const Tokenizer = require("sentence-tokenizer");

const MIN_WORD_COUNT = 2;
const MAX_WORDS_COUNT = 9;

const PUNCTUATIONS: string[] = [","];
const INTERROGATIVES: string[] = [
  "what",
  "who",
  "where",
  "when",
  "why",
  "how",
  "whose"
];
const CONJUNCTIONS: string[] = [
  "and",
  "after",
  "also",
  "although",
  "because",
  "before",
  "but",
  "however",
  "if",
  "that",
  "though",
  "unless",
  "until"
];
const PREPOSITIONS: string[] = [
  "about",
  "as",
  "at",
  "between",
  "during",
  "for",
  "from",
  "in",
  "on",
  "over",
  "regarding",
  "since",
  "till",
  "to",
  "under",
  "unless",
  "until",
  "with",
  "within",
  "without"
];

export default class TextSplitter {
  static execute(text: string): string[] {
    let array = this.textToArray(text);
    array = this.splitTextInArrayWithPunctuations(array, PUNCTUATIONS);
    array = this.splitTextInArrayWithArrayOfSeparators(array, INTERROGATIVES);
    array = this.splitTextInArrayWithArrayOfSeparators(array, CONJUNCTIONS);
    array = this.splitTextInArrayWithArrayOfSeparators(array, PREPOSITIONS);

    return array;
  }

  private static splitTextInArrayWithPunctuations(
    array: string[],
    punctuations: string[]
  ): string[] {
    const result: string[] = [];

    array.forEach(text => {
      const matchedPunctuations = this.matchedPunctuations(text, punctuations);
      this.splitTextWithPunctuations(text, matchedPunctuations).forEach(
        splittedText => {
          result.push(splittedText);
        }
      );
    });

    return this.rejoinText(result);
  }

  private static splitTextInArrayWithArrayOfSeparators(
    array: string[],
    arrayOfSeparators: string[]
  ): string[] {
    const result: string[] = [];

    array.forEach(text => {
      const matchedArrayOfSeparators = this.matchedArrayOfSeparators(
        text,
        arrayOfSeparators
      );
      this.splitTextWithArrayOfSeparators(
        text,
        matchedArrayOfSeparators
      ).forEach(splittedText => {
        result.push(splittedText);
      });
    });

    return this.rejoinText(result);
  }

  private static rejoinText(splittedText: string[]): string[] {
    if (splittedText.length <= 1) {
      return splittedText;
    }

    const result: string[] = [];
    let currentText = splittedText[0];

    splittedText.forEach((text, index, arr) => {
      if (index === 0) {
        return;
      }

      if (
        this.isTooShort(currentText) ||
        this.isTooShort(text) ||
        (/,\s$/.test(currentText) &&
          ((this.isTooShort(text) && /,\s$/.test(text)) ||
            /^\s*and\s/.test(text)))
      ) {
        currentText += text;
      } else {
        result.push(currentText);
        currentText = text;
      }

      if (this.isLastIndex(arr, index)) {
        result.push(currentText);
      }
    });

    return result;
  }

  private static splitTextWithPunctuations(
    text: string,
    punctuations: string[],
    depth: number = 0
  ): string[] {
    const punctuation = punctuations[depth];

    if (punctuation == null || this.isShortEnough(text)) {
      return [text];
    }
    const array = this.splitTextWithPunctuation(text, punctuation);

    const result: string[] = [];
    array.forEach(splittedText => {
      this.splitTextWithPunctuations(
        splittedText,
        punctuations,
        depth + 1
      ).forEach(splittedSplittedText => {
        result.push(splittedSplittedText);
      });
    });
    return result;
  }

  private static splitTextWithArrayOfSeparators(
    text: string,
    arrayOfSeparators: string[],
    depth: number = 0
  ): string[] {
    const separator = arrayOfSeparators[depth];

    if (separator == null || this.isShortEnough(text)) {
      return [text];
    }
    const array = this.splitTextWithSeparator(text, separator);

    const result: string[] = [];
    array.forEach(splittedText => {
      this.splitTextWithArrayOfSeparators(
        splittedText,
        arrayOfSeparators,
        depth + 1
      ).forEach(splittedSplittedText => {
        result.push(splittedSplittedText);
      });
    });
    return result;
  }

  private static textToArray(text: string): string[] {
    const tokenizer = new Tokenizer("Chuck");
    tokenizer.setEntry(text);

    return tokenizer.getSentences();
  }

  private static isShortEnough(
    text: string,
    maxWordCount: number = MAX_WORDS_COUNT
  ): boolean {
    return this.wordCountLessThan(text, maxWordCount);
  }

  private static isTooShort(
    text: string,
    minWordCount: number = MIN_WORD_COUNT
  ): boolean {
    return this.wordCountLessThan(text, minWordCount);
  }

  private static isLastIndex(arr: string[], index: number): boolean {
    return index === arr.length - 1;
  }

  private static splitTextWithPunctuation(
    text: string,
    punctuation: string
  ): string[] {
    const regex = new RegExp(this.punctuationRegexStr(punctuation));
    return text.split(regex).map((splittedText, index, arr) => {
      return this.isLastIndex(arr, index)
        ? splittedText
        : `${splittedText}${punctuation} `;
    });
  }

  private static splitTextWithSeparator(
    text: string,
    separator: string
  ): string[] {
    const regex = new RegExp(this.separatorRegexStr(separator));
    return text.split(regex).map((splittedText, index) => {
      return index === 0 ? splittedText : ` ${separator} ${splittedText}`;
    });
  }

  private static matchedPunctuations(
    text: string,
    punctuations: string[]
  ): string[] {
    const regexStr = punctuations
      .map(punctuation => {
        return this.punctuationRegexStr(punctuation);
      })
      .join("|");

    return this.matched(text, regexStr);
  }

  private static matchedArrayOfSeparators(
    text: string,
    arrayOfSeparators: string[]
  ): string[] {
    const regexStr = arrayOfSeparators
      .map(separator => {
        return this.separatorRegexStr(separator);
      })
      .join("|");

    return this.matched(text, regexStr);
  }

  private static matched(text: string, regexStr: string): string[] {
    const result = text.match(new RegExp(regexStr, "g"));
    return result == null
      ? []
      : result.map(matched => {
          return matched.trim();
        });
  }

  private static separatorRegexStr(separator: string): string {
    return `(?=\\b)(?:\\s)${separator}\\s(?=\\b)`;
  }

  private static punctuationRegexStr(punctuation: string): string {
    return `(?=\\b)${punctuation}\\s(?=\\b)`;
  }

  private static wordCountLessThan(text: string, count: number): boolean {
    return Utils.countWord(text) <= count;
  }
}
