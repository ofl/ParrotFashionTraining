export default class SSML {
  static enclose(text: string): string {
    return `<speak>${text}</speak>`;
  }

  static encloseSentence(sentence: string, rate: string): string {
    return `<p><s><prosody rate="${rate}">${sentence}</prosody></s></p>`;
  }

  static addBreak(time: number = 0.5): string {
    return `<break time="${time}s" />`;
  }
}
