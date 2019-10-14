enum SpeechType {
  Continue,
  Ask,
  Close
}

class Speech {
  public speechType: SpeechType = SpeechType.Ask;
}

class Reply extends Speech {
  constructor(
    public keyword: string = "",
    public dictionary: { [key: string]: string } = {},
    public speechType: SpeechType = SpeechType.Ask
  ) {
    super();
  }
}

class Moment {
  constructor(
    public keyword: string = "",
    public unixtime: number,
    public speechType: SpeechType = SpeechType.Ask
  ) {}
}

class QuestionText {
  constructor(
    public text: string = "",
    public readingSpeed: number = 100,
    public speechType: SpeechType = SpeechType.Ask
  ) {}
}

export { Reply, Moment, QuestionText, SpeechType };
