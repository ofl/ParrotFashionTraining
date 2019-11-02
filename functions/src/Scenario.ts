import Article from "./Article";
import Practice from "./Practice";
import AnswerResult from "./AnswerResult";
import { PracticeNotFound } from "./errors";
import { Speech, EndStatus } from "./Speech";
import {
  SpeechComponent,
  Dictionary,
  Response,
  RandomResponse,
  Credit,
  Quote,
  Break
} from "./SpeechComponent";

const CONFIRMATION_INTERVAL = 10;

class Scenario {
  speeches: Speech[] = [];

  constructor(public practiceCount: number = 0, public practice: Practice) {}

  async welcome(): Promise<void> {
    this.addSpeech([
      new Response(Dictionary["WELCOME"]),
      new RandomResponse("YELL", 3)
    ]);

    await this.setNewPractice();
  }

  async userAnswered(answer: string): Promise<void> {
    if (this.practice.questionText === "") {
      throw new PracticeNotFound("NOT_FOUND");
    }

    const answerResult = this.practice.judgeAnswer(answer);

    if (this.practice.canRetry && this.practice.mustRetry) {
      if (!answerResult.isPoor) {
        this.addSpeech([this.getResultResponse(answerResult)]);
      }
      this.addQuestionText(this.practice.questionText);
    } else {
      this.addSpeech([this.getResultResponse(answerResult)]);

      if (this.isConfirmationPeriod) {
        this.addConfirmation();
        return;
      }

      await this.setNewPractice();
    }
  }

  async skipArticle(): Promise<void> {
    this.addSpeech([
      new RandomResponse("ACCEPTED", 3),
      new Response(Dictionary["SKIP_ARTICLE"])
    ]);

    await this.setNewPractice();
  }

  async skipPractice(): Promise<void> {
    this.addSpeech([
      new RandomResponse("ACCEPTED", 3),
      new Response(Dictionary["SKIP_QUESTION_TEXT"])
    ]);

    await this.setNewPractice();
  }

  async sayAgain(): Promise<void> {
    this.practice.speakSlowly();

    if (this.practice.questionText === "") {
      throw new PracticeNotFound("NOT_FOUND");
    }

    this.addSpeech([new RandomResponse("ACCEPTED", 3)]);
    this.addQuestionText(this.practice.questionText);
  }

  async sayGoodBye(): Promise<void> {
    this.addSpeech([new RandomResponse("BYE", 3)], EndStatus.Close);
  }

  private async setNewPractice(): Promise<void> {
    const article = await this.practice.findArticleForNextPractice();
    this.practice = Practice.createByArticle(article);

    if (this.practice.questionText === "") {
      throw new PracticeNotFound("NOT_FOUND");
    }

    this.incrementPracticeCount();
    this.addQuestionText(this.practice.questionText, article);
  }

  private addQuestionText(questionText: string, article?: Article) {
    if (article instanceof Article && article.isFirstQuestionText) {
      this.addSpeech(
        [
          new Break(),
          new Response(Dictionary["INTRODUCTION"]),
          new Quote(article.title),
          new Credit(article.publisher, article.unixtime),
          new Break(),
          new Response(Dictionary["REPEAT_AFTER_ME"]),
          new Break(1.0),
          new Quote(questionText, this.practice.speakingSpeedRate)
        ],
        EndStatus.WaitingAnswer
      );
    } else {
      this.addSpeech(
        [
          new Break(1.0),
          new Quote(questionText, this.practice.speakingSpeedRate)
        ],
        EndStatus.WaitingAnswer
      );
    }
  }

  private addConfirmation() {
    this.addSpeech(
      [
        new Break(),
        new Response(`You have trained ${this.practiceCount} times.`),
        new Break(),
        new Response(Dictionary["CONTINUE_PRACTICE"])
      ],
      EndStatus.Confirm
    );
  }

  private getResultResponse(result: AnswerResult): RandomResponse {
    if (result.isExcellent) {
      return new RandomResponse("EXCELLENT", 2);
    } else if (result.isGood) {
      return new RandomResponse("GOOD", 3);
    } else if (result.isRegrettable) {
      return new RandomResponse("REGRETTABLE", 2);
    } else {
      return new RandomResponse("POOR", 2);
    }
  }

  private incrementPracticeCount() {
    this.practiceCount++;
  }

  private addSpeech(
    components: SpeechComponent[],
    endStatus: EndStatus = EndStatus.Continue
  ) {
    this.speeches.push(new Speech(components, endStatus));
  }

  private get isConfirmationPeriod(): boolean {
    return this.practiceCount % CONFIRMATION_INTERVAL === 0;
  }
}

export { Scenario, EndStatus };
