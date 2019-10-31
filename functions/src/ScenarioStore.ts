import { DialogflowConversation, Contexts } from "actions-on-google";
import { Scenario } from "./Scenario";

export default class ScenarioStore {
  static load(conv: DialogflowConversation<unknown, unknown, Contexts>) {
    const data = conv.data as {
      articleId: string;
      questionText: string;
      retryCount: number;
      readingSpeed: number;
      practiceCount: number;
    };

    return new Scenario(
      data.articleId || "",
      data.questionText || "",
      data.retryCount || 0,
      data.readingSpeed || Scenario.defaultReadingSpeed,
      data.practiceCount || 0
    );
  }

  static save(
    conv: DialogflowConversation<unknown, unknown, Contexts>,
    scenario: Scenario
  ) {
    conv.data = {
      articleId: scenario.articleId,
      questionText: scenario.questionText,
      retryCount: scenario.retryCount,
      readingSpeed: scenario.readingSpeed,
      practiceCount: scenario.practiceCount
    };
  }

  static reset(conv: DialogflowConversation<unknown, unknown, Contexts>) {
    conv.data = {
      articleId: "",
      questionText: "",
      retryCount: 0,
      readingSpeed: Scenario.defaultReadingSpeed,
      practiceCount: 0
    };
  }
}
