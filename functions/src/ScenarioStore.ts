import { DialogflowConversation, Contexts } from "actions-on-google";
import { Scenario } from "./Scenario";
import Practice from "./Practice";

export default class ScenarioStore {
  static load(conv: DialogflowConversation<unknown, unknown, Contexts>) {
    const data = conv.data as {
      articleId: string;
      questionText: string;
      practiceCount: number;
      retryCount: number;
      speakingSpeedRate: number;
    };

    if (data.articleId) {
      const practice = new Practice(
        data.articleId || "",
        data.questionText || "",
        data.retryCount || 0,
        data.speakingSpeedRate
      );
      return new Scenario(data.practiceCount || 0, practice);
    }

    return new Scenario(data.practiceCount || 0);
  }

  static save(
    conv: DialogflowConversation<unknown, unknown, Contexts>,
    scenario: Scenario
  ) {
    if (typeof scenario.practice === "undefined") {
      conv.data = { practiceCount: scenario.practiceCount };
      return;
    }

    conv.data = {
      practiceCount: scenario.practiceCount,
      articleId: scenario.practice.articleId,
      questionText: scenario.practice.questionText,
      retryCount: scenario.practice.retryCount,
      speakingSpeedRate: scenario.practice.speakingSpeedRate
    };
  }

  static reset(conv: DialogflowConversation<unknown, unknown, Contexts>) {
    conv.data = {};
  }
}
