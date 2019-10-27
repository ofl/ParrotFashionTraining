import Article from "./Article";
import ArticleStore from "./ArticleStore";
import AnswerResult from "./AnswerResult";
import { ArticleNotFound, CurrentSentenceNotFound } from "./errors";
import { Speech, EndStatus } from "./Speech";
import {
  SpeechComponent,
  Dictionary,
  Response,
  RandomResponse,
  Credit,
  PlainText,
  Quote,
  Break
} from "./SpeechComponent";

const DEFAULT_READING_SPEED: number = 100; // (%)
const MAX_RETRY_COUNT = 3;
const CONFIRM_CONTINUE_INTERVAL = 10;

class Scenario {
  speeches: Speech[] = [];

  constructor(
    public articleId: string = "",
    public currentSentence: string = "",
    public retryCount: number = 0,
    public readingSpeed: number = Scenario.defaultReadingSpeed,
    public practiceCount: number = 0
  ) {}

  static get defaultReadingSpeed(): number {
    return DEFAULT_READING_SPEED;
  }

  async welcome(): Promise<void> {
    this.reset();
    this.addSpeech([
      new Response(Dictionary["WELCOME"]),
      new RandomResponse("YELL", 3)
    ]);

    await this.readNewSentence();
  }

  async userAnswered(answer: string): Promise<void> {
    const questionText = this.currentSentence;

    if (questionText === "") {
      throw new CurrentSentenceNotFound("NOT_FOUND");
    }

    const answerResult = AnswerResult.get(questionText, answer);

    if (this.mustRetry(this.retryCount, answerResult)) {
      this.incrementRetryCount();
      this.speakSlowly();

      if (!answerResult.isPoor) {
        this.addSpeech([this.getResultMessage(answerResult)]);
      }
      this.addPractice(questionText);
    } else {
      this.addSpeech([this.getResultMessage(answerResult)]);

      if (this.isPracticeConfirmationPeriod) {
        this.continueSpeech([
          new Break(),
          new PlainText(`You have trained ${this.practiceCount} times.`),
          new Break()
        ]);
        this.addSpeech(
          [new Response(Dictionary["CONTINUE_PRACTICE"])],
          EndStatus.Confirm
        );
        return;
      }

      await this.readNewSentence();
    }
  }

  async skipArticle(): Promise<void> {
    this.addSpeech([
      new RandomResponse("ACCEPTED", 3),
      new Response(Dictionary["SKIP_ARTICLE"])
    ]);

    await this.readNewSentence();
  }

  async skipSentence(): Promise<void> {
    this.addSpeech([
      new RandomResponse("ACCEPTED", 3),
      new Response(Dictionary["SKIP_SENTENCE"])
    ]);

    await this.readNewSentence();
  }

  async sayAgain(): Promise<void> {
    this.speakSlowly();

    const currentSentence = this.currentSentence;
    if (currentSentence === "") {
      throw new CurrentSentenceNotFound("NOT_FOUND");
    }

    this.addSpeech([new RandomResponse("ACCEPTED", 3)]);
    this.addPractice(currentSentence);
  }

  async sayGoodBye(): Promise<void> {
    this.addSpeech([new RandomResponse("BYE", 3)], EndStatus.Close);
  }

  get isPracticeConfirmationPeriod(): boolean {
    return this.practiceCount % CONFIRM_CONTINUE_INTERVAL === 0;
  }

  private mustRetry(retryCount: number, result: AnswerResult): boolean {
    if (retryCount >= MAX_RETRY_COUNT) {
      return false;
    }
    return result.isPoor || result.isRegrettable;
  }

  private async readNewSentence(): Promise<void> {
    const article = await this.findArticleForNextSentence();
    this.setNewPractice(article);

    const questionText = article.currentSentence;
    if (questionText === "") {
      throw new CurrentSentenceNotFound("NOT_FOUND");
    }

    this.addPractice(questionText, article);
  }

  private addPractice(questionText: string, article?: Article) {
    if (article instanceof Article && article.currentIndex === 0) {
      this.addSpeech(
        [
          new Break(),
          new Response(Dictionary["INTRODUCTION"]),
          new Quote(article.title),
          new Credit(article.publisher, article.unixtime),
          new Break(),
          new Response(Dictionary["REPEAT_AFTER_ME"]),
          new Break(1.0),
          new Quote(questionText, this.readingSpeed)
        ],
        EndStatus.WaitingAnswer
      );
    } else {
      this.addSpeech(
        [new Break(1.0), new Quote(questionText, this.readingSpeed)],
        EndStatus.WaitingAnswer
      );
    }
  }

  private async findArticleForNextSentence(): Promise<Article> {
    try {
      let article: Article;

      if (this.articleId === "") {
        article = await ArticleStore.findLatest();
      } else {
        article = await ArticleStore.getNextArticleOrIncrementIndexOfSentences(
          this.articleId,
          this.currentSentence
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

  private getResultMessage(result: AnswerResult): RandomResponse {
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
    if (this.readingSpeed > 70) {
      this.readingSpeed -= 15;
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
    this.currentSentence = article.currentSentence;
    this.readingSpeed = Scenario.defaultReadingSpeed;
    this.incrementPracticeCount();
  }

  private reset() {
    this.articleId = "";
    this.retryCount = 0;
    this.currentSentence = "";
    this.readingSpeed = Scenario.defaultReadingSpeed;
  }

  private addSpeech(
    components: SpeechComponent[],
    endStatus: EndStatus = EndStatus.Continue
  ) {
    this.speeches.push(new Speech(components, endStatus));
  }

  private continueSpeech(components: SpeechComponent[]) {
    components.forEach(component => {
      this.speeches[this.speeches.length - 1].components.push(component);
    });
  }
}

export { Scenario, EndStatus };
