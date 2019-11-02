import Article from "./Article";
import ArticleStore from "./ArticleStore";
import AnswerResult from "./AnswerResult";
import { ArticleNotFound, QuestionTextNotFound } from "./errors";
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

const DEFAULT_READING_SPEED_RATE: number = 100; // (%)
const MAX_RETRY_COUNT = 3;
const CONFIRMATION_INTERVAL = 10;

class Scenario {
  speeches: Speech[] = [];

  constructor(
    public articleId: string = "",
    public questionText: string = "",
    public practiceCount: number = 0,
    public retryCount: number = 0,
    public readingSpeedRate: number = DEFAULT_READING_SPEED_RATE
  ) {}

  async welcome(): Promise<void> {
    this.reset();

    this.addSpeech([
      new Response(Dictionary["WELCOME"]),
      new RandomResponse("YELL", 3)
    ]);

    await this.readNewQuestionText();
  }

  async userAnswered(answer: string): Promise<void> {
    const questionText = this.questionText;
    if (questionText === "") {
      throw new QuestionTextNotFound("NOT_FOUND");
    }

    const answerResult = AnswerResult.get(questionText, answer);

    if (this.mustRetry(this.retryCount, answerResult)) {
      this.incrementRetryCount();
      this.speakSlowly();

      if (!answerResult.isPoor) {
        this.addSpeech([this.getResultResponse(answerResult)]);
      }
      this.addPractice(questionText);
    } else {
      this.addSpeech([this.getResultResponse(answerResult)]);

      if (this.isConfirmationPeriod) {
        this.addConfirmation();
        return;
      }

      await this.readNewQuestionText();
    }
  }

  async skipArticle(): Promise<void> {
    this.addSpeech([
      new RandomResponse("ACCEPTED", 3),
      new Response(Dictionary["SKIP_ARTICLE"])
    ]);

    await this.readNewQuestionText();
  }

  async skipQuestionText(): Promise<void> {
    this.addSpeech([
      new RandomResponse("ACCEPTED", 3),
      new Response(Dictionary["SKIP_QUESTION_TEXT"])
    ]);

    await this.readNewQuestionText();
  }

  async sayAgain(): Promise<void> {
    this.speakSlowly();

    if (this.questionText === "") {
      throw new QuestionTextNotFound("NOT_FOUND");
    }

    this.addSpeech([new RandomResponse("ACCEPTED", 3)]);
    this.addPractice(this.questionText);
  }

  async sayGoodBye(): Promise<void> {
    this.addSpeech([new RandomResponse("BYE", 3)], EndStatus.Close);
  }

  private async readNewQuestionText(): Promise<void> {
    const article = await this.findArticleForNextQuestionText();
    this.setNewPractice(article);

    if (this.questionText === "") {
      throw new QuestionTextNotFound("NOT_FOUND");
    }

    this.addPractice(this.questionText, article);
  }

  private addPractice(questionText: string, article?: Article) {
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
          new Quote(questionText, this.readingSpeedRate)
        ],
        EndStatus.WaitingAnswer
      );
    } else {
      this.addSpeech(
        [new Break(1.0), new Quote(questionText, this.readingSpeedRate)],
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

  private async findArticleForNextQuestionText(): Promise<Article> {
    try {
      let article: Article;

      if (this.articleId === "") {
        article = await ArticleStore.findOnePublishedBefore();
      } else {
        article = await ArticleStore.findOneIncludingNextQuestionText(
          this.articleId,
          this.questionText
        );
      }

      return article;
    } catch (error) {
      if (error instanceof ArticleNotFound) {
        this.reset();
      }

      throw error;
    }
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

  private speakSlowly() {
    if (this.readingSpeedRate > 70) {
      this.readingSpeedRate -= 15;
    }
  }

  private incrementRetryCount() {
    this.retryCount++;
  }

  private incrementPracticeCount() {
    this.practiceCount++;
  }

  private setNewPractice(article: Article) {
    this.articleId = article.guid;
    this.retryCount = 0;
    this.questionText = article.questionText;
    this.readingSpeedRate = DEFAULT_READING_SPEED_RATE;
    this.incrementPracticeCount();
  }

  private reset() {
    this.articleId = "";
    this.retryCount = 0;
    this.questionText = "";
    this.readingSpeedRate = DEFAULT_READING_SPEED_RATE;
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

  private mustRetry(retryCount: number, result: AnswerResult): boolean {
    if (retryCount >= MAX_RETRY_COUNT) {
      return false;
    }
    return result.isPoor || result.isRegrettable;
  }
}

export { Scenario, EndStatus };
