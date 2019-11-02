import { DialogflowConversation, Contexts } from "actions-on-google";
import { Scenario } from "./Scenario";

const DEFAULT_READING_SPEED_RATE: number = 100; // (%)

export default class ScenarioStore {
  static load(conv: DialogflowConversation<unknown, unknown, Contexts>) {
    const data = conv.data as {
      articleId: string;
      questionText: string;
      practiceCount: number;
      retryCount: number;
      readingSpeedRate: number;
    };

    return new Scenario(
      data.articleId || "",
      data.questionText || "",
      data.practiceCount || 0,
      data.retryCount || 0,
      data.readingSpeedRate || DEFAULT_READING_SPEED_RATE
    );
  }

  static save(
    conv: DialogflowConversation<unknown, unknown, Contexts>,
    scenario: Scenario
  ) {
    conv.data = {
      articleId: scenario.articleId,
      questionText: scenario.questionText,
      practiceCount: scenario.practiceCount,
      retryCount: scenario.retryCount,
      readingSpeedRate: scenario.readingSpeedRate
    };
  }

  static reset(conv: DialogflowConversation<unknown, unknown, Contexts>) {
    conv.data = {
      articleId: "",
      questionText: "",
      practiceCount: 0,
      retryCount: 0,
      readingSpeedRate: DEFAULT_READING_SPEED_RATE
    };
  }
}
