import { DialogflowConversation, Contexts } from "actions-on-google";
import { Scenario } from "./Scenario";
import Practice from "./Practice";

const DEFAULT_SPEAKING_SPEED_RATE: number = 100; // (%)

export default class ScenarioStore {
  static load(conv: DialogflowConversation<unknown, unknown, Contexts>) {
    const data = conv.data as {
      articleId: string;
      questionText: string;
      practiceCount: number;
      retryCount: number;
      speakingSpeedRate: number;
    };

    const practice = new Practice(
      data.articleId || "",
      data.questionText || "",
      data.retryCount || 0,
      data.speakingSpeedRate || DEFAULT_SPEAKING_SPEED_RATE
    );

    return new Scenario(data.practiceCount || 0, practice);
  }

  static save(
    conv: DialogflowConversation<unknown, unknown, Contexts>,
    scenario: Scenario
  ) {
    conv.data = {
      articleId: scenario.practice.articleId,
      questionText: scenario.practice.questionText,
      practiceCount: scenario.practiceCount,
      retryCount: scenario.practice.retryCount,
      speakingSpeedRate: scenario.practice.speakingSpeedRate
    };
  }

  static reset(conv: DialogflowConversation<unknown, unknown, Contexts>) {
    conv.data = {
      articleId: "",
      questionText: "",
      practiceCount: 0,
      retryCount: 0,
      speakingSpeedRate: DEFAULT_SPEAKING_SPEED_RATE
    };
  }
}
