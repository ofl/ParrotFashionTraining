import AnswerResult from "./AnswerResult";
import Article from "./Article";
import ArticleStore from "./ArticleStore";
import { PracticeNotFound } from "./errors";
import Practice from "./Practice";
import { Speech, EndStatus } from "./Speech";
import {
  SpeechComponent,
  Dictionary,
  Response,
  RandomResponse,
  Credit,
  Quote,
  Break,
  Audio
} from "./SpeechComponent";

const CONFIRMATION_INTERVAL = 10;

class Scenario {
  speeches: Speech[] = [];
  public practice: Practice | undefined;

  constructor(public practiceCount: number = 0, practice?: Practice) {
    this.practice = practice;
  }

  async welcome(): Promise<void> {
    this.addSpeech([
      new Response(Dictionary["WELCOME"]),
      new Break(),
      new Response(Dictionary["DESCRIPTION"]),
      new Response(Dictionary["HOW_TO_USE"]),
      new Break(),
      new RandomResponse("YELL", 3)
    ]);

    await this.setNewPractice();
  }

  async userAnswered(answer: string): Promise<void> {
    if (typeof this.practice === "undefined") {
      throw new PracticeNotFound("NOT_FOUND");
    }

    const answerResult = this.practice.getResult(answer);

    if (this.practice.canRetry && this.practice.mustRetry) {
      if (!answerResult.isPoor) {
        this.addResultResponse(answerResult);
      }
      this.addQuestionText(this.practice.questionText);
    } else {
      this.addResultResponse(answerResult);

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
    if (typeof this.practice === "undefined") {
      throw new PracticeNotFound("NOT_FOUND");
    }

    this.practice.speakSlowly();
    this.addSpeech([new RandomResponse("ACCEPTED", 3)]);
    this.addQuestionText(this.practice.questionText);
  }

  async confirmStopPractice(): Promise<void> {
    this.addSpeech(
      [new Break(), new Response(Dictionary["BYE_PRACTICE_CONFIRMATION"])],
      EndStatus.ConfirmStop
    );
  }

  async sayGoodBye(): Promise<void> {
    this.addSpeech([new RandomResponse("BYE", 3)], EndStatus.Close);
  }

  private async setNewPractice(): Promise<void> {
    const article = await this.findArticleForNextPractice();
    this.practice = Practice.createByArticle(article);

    this.incrementPracticeCount();
    this.addQuestionText(this.practice.questionText, article);
  }

  private addQuestionText(questionText: string, article?: Article) {
    if (typeof this.practice === "undefined") {
      throw new PracticeNotFound("NOT_FOUND");
    }

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
          new Quote(questionText, this.practice.speakingSpeedRate),
          new Audio(Dictionary["BEEP_SOUND_URL"], "BEEP!!")
        ],
        EndStatus.WaitingAnswer
      );
    } else {
      this.addSpeech(
        [
          new Break(1.0),
          new Quote(questionText, this.practice.speakingSpeedRate),
          new Audio(Dictionary["BEEP_SOUND_URL"], "BEEP!!")
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
      EndStatus.ConfirmContinue
    );
  }

  private addResultResponse(result: AnswerResult) {
    const response: RandomResponse = (() => {
      if (result.isExcellent) {
        return new RandomResponse("EXCELLENT", 2);
      } else if (result.isGood) {
        return new RandomResponse("GOOD", 3);
      } else if (result.isRegrettable) {
        return new RandomResponse("REGRETTABLE", 2);
      } else {
        return new RandomResponse("POOR", 2);
      }
    })();
    this.addSpeech([response]);
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

  private async findArticleForNextPractice(): Promise<Article> {
    try {
      let article: Article;

      if (typeof this.practice === "undefined") {
        article = await ArticleStore.findOnePublishedBefore();
      } else {
        article = await ArticleStore.findOneIncludingNextQuestionText(
          this.practice.articleId,
          this.practice.questionText
        );
      }

      return article;
    } catch (error) {
      throw error;
    }
  }
}

export { Scenario, EndStatus };
