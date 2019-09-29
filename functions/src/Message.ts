import Utils from "./Utils";
import AnswerResult from "./AnswerResult";

class GreetingMessage {
  static readonly WELCOME: string[] = ["Welcome to Parrot Fashion Training."];
  static readonly GOODBYE: string[] = ["Goodbye.", "Bye.", "See you again."];
  static readonly YELL: string[] = [
    "Let's start.",
    "Let's begin.",
    "Here we go."
  ];
}

class AcceptedMessage {
  static readonly ACCEPTED: string[] = ["Okay.", "All right.", "Sure."];
}

class RetryMessage {
  static readonly AGAIN: string[] = ["Try again!."];
}

class ResultMessage {
  static readonly EXCELLENT: string[] = ["Perfect!", "Excellent!"];
  static readonly GOOD: string[] = ["OK!", "Good job!", "Well done!"];
  static readonly REGRETTABLE: string[] = ["So close!", "Almost had it!"];
  static readonly POOR: string[] = [
    "All right!",
    "Don't mind!",
    "Let's do your best next time!"
  ];
  static readonly SKIPPED: string[] = ["All right. Let's start next sentence."];
}

export default class Message {
  static get welcome(): string {
    return (
      Utils.selectRandomly(GreetingMessage.WELCOME) +
      Utils.selectRandomly(GreetingMessage.YELL)
    );
  }
  static get bye(): string {
    return Utils.selectRandomly(GreetingMessage.GOODBYE);
  }
  static get yell(): string {
    return Utils.selectRandomly(GreetingMessage.YELL);
  }
  static get retry(): string {
    return Utils.selectRandomly(RetryMessage.AGAIN);
  }
  static get okay(): string {
    return Utils.selectRandomly(AcceptedMessage.ACCEPTED);
  }
  static get resultExcellent(): string {
    return Utils.selectRandomly(ResultMessage.EXCELLENT);
  }
  static get resultGood(): string {
    return Utils.selectRandomly(ResultMessage.GOOD);
  }
  static get resultRegrettable(): string {
    return Utils.selectRandomly(ResultMessage.REGRETTABLE);
  }
  static get resultPoor(): string {
    return Utils.selectRandomly(ResultMessage.POOR);
  }
  static get resultSkipped(): string {
    return Utils.selectRandomly(ResultMessage.SKIPPED);
  }

  static getResultMessage(result: AnswerResult): string {
    if (result.isExcellent) {
      return this.resultExcellent;
    } else if (result.isGood) {
      return this.resultGood;
    } else if (result.isRegrettable) {
      return this.resultRegrettable;
    } else {
      return this.resultPoor;
    }
  }
}
