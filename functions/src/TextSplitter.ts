const Tokenizer = require("sentence-tokenizer");

const PUNCTUATIONS = [","];
const INTERROGATIVES = ["what", "who", "where", "when", "why", "how", "whose"];
const CONJUNCTIONS = [
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

export default class TextSplitter {
  static run(text: string): string[] {
    let sentences = this.textToSentences(text);
    sentences = this.splitSentencesWithPunctuations(sentences, PUNCTUATIONS);
    sentences = this.splitSentencesWithDelimiters(sentences, INTERROGATIVES);
    sentences = this.splitSentencesWithDelimiters(sentences, CONJUNCTIONS);

    return sentences;
  }

  private static splitSentencesWithPunctuations(
    sentences: string[],
    punctuations: string[]
  ): string[] {
    const result: string[] = [];

    sentences.forEach(sentence => {
      const matchedPunctuations = this.matchedPunctuations(
        sentence,
        punctuations
      );
      this.splitSentenceWithPunctuations(sentence, matchedPunctuations).forEach(
        splittedSentence => {
          result.push(splittedSentence);
        }
      );
    });

    return this.rejoinText(result);
  }

  private static splitSentencesWithDelimiters(
    sentences: string[],
    delimiters: string[]
  ): string[] {
    const result: string[] = [];

    sentences.forEach(sentence => {
      const matchedDelimiters = this.matchedDelimiters(sentence, delimiters);
      this.splitSentenceWithDelimiters(sentence, matchedDelimiters).forEach(
        splittedSentence => {
          result.push(splittedSentence);
        }
      );
    });

    return this.rejoinText(result);
  }

  private static rejoinText(splittedText: string[]): string[] {
    if (splittedText.length <= 1) {
      return splittedText;
    }

    const result: string[] = [];
    let currentText = splittedText[0];

    splittedText.forEach((splittedText, index, arr) => {
      if (index === 0) {
        return;
      }

      if (
        this.isShortEnough(currentText, 3) ||
        this.isShortEnough(splittedText, 3) ||
        (/,\s$/.test(currentText) &&
          ((this.isShortEnough(splittedText, 3) && /,\s$/.test(splittedText)) ||
            /^\s*and\s/.test(splittedText)))
      ) {
        currentText += splittedText;
      } else {
        result.push(currentText);
        currentText = splittedText;
      }

      if (this.isLastIndex(arr, index)) {
        result.push(currentText);
      }
    });

    return result;
  }

  private static splitSentenceWithPunctuations(
    sentence: string,
    punctuations: string[],
    minLength: number = 10,
    depth: number = 0
  ): string[] {
    const punctuation = punctuations[depth];

    if (punctuation == null || this.isShortEnough(sentence, minLength)) {
      return [sentence];
    }
    const array = this.splitTextWithPunctuation(sentence, punctuation);

    const result: string[] = [];
    array.forEach(splittedSentence => {
      this.splitSentenceWithPunctuations(
        splittedSentence,
        punctuations,
        minLength,
        depth + 1
      ).forEach(splittedSplittedSentence => {
        result.push(splittedSplittedSentence);
      });
    });
    return result;
  }

  private static splitSentenceWithDelimiters(
    sentence: string,
    delimiters: string[],
    minLength: number = 10,
    depth: number = 0
  ): string[] {
    const delimiter = delimiters[depth];

    if (delimiter == null || this.isShortEnough(sentence, minLength)) {
      return [sentence];
    }
    const array = this.splitTextWithDelimiter(sentence, delimiter);

    const result: string[] = [];
    array.forEach(splittedSentence => {
      this.splitSentenceWithDelimiters(
        splittedSentence,
        delimiters,
        minLength,
        depth + 1
      ).forEach(splittedSplittedSentence => {
        result.push(splittedSplittedSentence);
      });
    });
    return result;
  }

  private static textToSentences(text: string): string[] {
    const tokenizer = new Tokenizer("Chuck");
    tokenizer.setEntry(text);

    return tokenizer.getSentences();
  }

  private static isShortEnough(text: string, minLength: number = 10): boolean {
    return text.split(/\b\s\b/).length < minLength;
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

  private static splitTextWithDelimiter(
    text: string,
    delimiter: string
  ): string[] {
    const regex = new RegExp(this.delimiterRegexStr(delimiter));
    return text.split(regex).map((splittedText, index) => {
      return index === 0 ? splittedText : ` ${delimiter} ${splittedText}`;
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

  private static matchedDelimiters(
    text: string,
    delimiters: string[]
  ): string[] {
    const regexStr = delimiters
      .map(delimiter => {
        return this.delimiterRegexStr(delimiter);
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

  private static delimiterRegexStr(delimiter: string): string {
    return `(?=\\b)(?:\\s)${delimiter}\\s(?=\\b)`;
  }

  private static punctuationRegexStr(punctuation: string): string {
    return `(?=\\b)${punctuation}\\s(?=\\b)`;
  }
}
