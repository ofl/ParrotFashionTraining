import SSML from "./SSML";

enum SpeechType {
  Continue,
  Ask,
  Close
}

type Speech = Reply | Credit | RawText;
type Dictionary = { [key: string]: string };

class Reply {
  constructor(
    public keyword: string = "",
    public dictionary: { [key: string]: string } = {},
    public speechType: SpeechType = SpeechType.Ask
  ) {}
}

class Credit {
  constructor(
    public from: string,
    public unixtime: number,
    public speechType: SpeechType = SpeechType.Ask
  ) {}
}

class RawText {
  constructor(
    public text: string = "",
    public readingSpeed: number = 100,
    public speechType: SpeechType = SpeechType.Ask
  ) {}

  toSsml(): string {
    let ssml = "";
    ssml += SSML.addBreak(1);
    ssml += SSML.encloseSentence(this.text, `${this.readingSpeed}%`);
    return ssml;
  }
}

export { Speech, Dictionary, Reply, Credit, RawText, SpeechType };
