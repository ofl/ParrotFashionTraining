export default class SSML {
  static enclose(text: string): string {
    return `<speak><p>${text}</p></speak>`;
  }

  static encloseContent(message: string): string {
    return `<s>${message}</s>`;
  }

  static encloseQuote(questionText: string, rate: string): string {
    return `<s><prosody rate="${rate}">${questionText}</prosody></s>`;
  }

  static break(time: number = 0.5): string {
    return `<break time="${time}s" />`;
  }
}
