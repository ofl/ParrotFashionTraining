const SENSITIVE_WORDS: string[] = [
  "kill",
  "death",
  "died",
  "dead",
  "murder",
  "slaughter",
  "massacre",
  "wound",
  "injure",
  "murder",
  "shooting",
  "rampage",
  "suicide",
  "homicide",
  "genocide",
  "attack",
  "assault",
  "outrage",
  "rape",
  "abuse"
];

const CONFLICT_WORDS: string[] = [
  "stop",
  "skip",
  "next",
  "goodbye",
  "article",
  "sentence"
];

export default class ContentsFilter {
  static isIncludingNGWords(text: string): boolean {
    const ngWords: string[] = SENSITIVE_WORDS.concat(CONFLICT_WORDS);
    const regexStr = ngWords.join("|");

    return new RegExp(regexStr, "g").test(text);
  }
}
