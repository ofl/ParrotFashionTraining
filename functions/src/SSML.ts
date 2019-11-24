export default class SSML {
  static enclose(text: string): string {
    return `<speak>${text}</speak>`;
  }

  static encloseContent(message: string): string {
    return `<s>${message} </s>`;
  }

  static encloseTextWithSpeedRate(questionText: string, rate: number): string {
    return `<s><prosody rate="${rate}%">${questionText} </prosody></s>`;
  }

  static break(time: number = 0.5): string {
    return `<break time="${time}s" />`;
  }

  static audio(src: string, alt: string): string {
    return `<audio src="${src}">${alt}</audio>`;
  }
}
