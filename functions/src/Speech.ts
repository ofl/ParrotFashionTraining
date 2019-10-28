import { SpeechComponent } from "./SpeechComponent";
import SSML from "./SSML";

enum EndStatus {
  Continue,
  WaitingAnswer,
  Confirm,
  Close
}

class Speech {
  constructor(
    public components: SpeechComponent[] = [],
    public endStatus: EndStatus = EndStatus.Continue
  ) {}

  toSsml(): string {
    const text: string = this.components
      .map(component => {
        return component.toSsml();
      })
      .join(" ");

    return SSML.enclose(text);
  }

  toText(): string {
    return this.components
      .map(component => {
        return component.toText();
      })
      .join(" ");
  }
}

export { Speech, EndStatus };
