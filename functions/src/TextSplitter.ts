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
  static run(text: string): string[] {
    let sentences = this.textToSentences(text);
    sentences = this.splitSentencesWithPunctuations(sentences, PUNCTUATIONS);
    sentences = this.splitSentencesWithSeparatorWords(
      sentences,
      INTERROGATIVES
    );
    sentences = this.splitSentencesWithSeparatorWords(sentences, CONJUNCTIONS);
    sentences = this.splitSentencesWithSeparatorWords(sentences, PREPOSITIONS);

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

  private static splitSentencesWithSeparatorWords(
    sentences: string[],
    separatorWords: string[]
  ): string[] {
    const result: string[] = [];

    sentences.forEach(sentence => {
      const matchedSeparatorWords = this.matchedSeparatorWords(
        sentence,
        separatorWords
      );
      this.splitSentenceWithSeparatorWords(
        sentence,
        matchedSeparatorWords
      ).forEach(splittedSentence => {
        result.push(splittedSentence);
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

  private static splitSentenceWithPunctuations(
    sentence: string,
    punctuations: string[],
    depth: number = 0
  ): string[] {
    const punctuation = punctuations[depth];

    if (punctuation == null || this.isShortEnough(sentence)) {
      return [sentence];
    }
    const array = this.splitTextWithPunctuation(sentence, punctuation);

    const result: string[] = [];
    array.forEach(splittedSentence => {
      this.splitSentenceWithPunctuations(
        splittedSentence,
        punctuations,
        depth + 1
      ).forEach(splittedSplittedSentence => {
        result.push(splittedSplittedSentence);
      });
    });
    return result;
  }

  private static splitSentenceWithSeparatorWords(
    sentence: string,
    separatorWords: string[],
    depth: number = 0
  ): string[] {
    const separatorWord = separatorWords[depth];

    if (separatorWord == null || this.isShortEnough(sentence)) {
      return [sentence];
    }
    const array = this.splitTextWithSeparatorWord(sentence, separatorWord);

    const result: string[] = [];
    array.forEach(splittedSentence => {
      this.splitSentenceWithSeparatorWords(
        splittedSentence,
        separatorWords,
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

  private static isShortEnough(
    text: string,
    maxWordCount: number = MAX_WORDS_COUNT
  ): boolean {
    return this.wordCountFewerThan(text, maxWordCount);
  }

  private static isTooShort(
    text: string,
    minWordCount: number = MIN_WORD_COUNT
  ): boolean {
    return this.wordCountFewerThan(text, minWordCount);
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

  private static splitTextWithSeparatorWord(
    text: string,
    separatorWord: string
  ): string[] {
    const regex = new RegExp(this.separatorWordRegexStr(separatorWord));
    return text.split(regex).map((splittedText, index) => {
      return index === 0 ? splittedText : ` ${separatorWord} ${splittedText}`;
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

  private static matchedSeparatorWords(
    text: string,
    separatorWords: string[]
  ): string[] {
    const regexStr = separatorWords
      .map(separatorWord => {
        return this.separatorWordRegexStr(separatorWord);
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

  private static separatorWordRegexStr(separatorWord: string): string {
    return `(?=\\b)(?:\\s)${separatorWord}\\s(?=\\b)`;
  }

  private static punctuationRegexStr(punctuation: string): string {
    return `(?=\\b)${punctuation}\\s(?=\\b)`;
  }

  private static wordCountFewerThan(text: string, count: number): boolean {
    return Utils.countWord(text) <= count;
  }
}
