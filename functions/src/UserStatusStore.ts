import { DialogflowConversation, Contexts } from "actions-on-google";
import { Scenario } from "./Scenario";

export default class UserStatusStore {
  static loadScenario(
    conv: DialogflowConversation<unknown, unknown, Contexts>
  ) {
    const data = conv.data as {
      articleId: string;
      currentSentence: string;
      retryCount: number;
      readingSpeed: number;
      practiceCount: number;
    };

    return new Scenario(
      data.articleId || "",
      data.currentSentence || "",
      data.retryCount || 0,
      data.readingSpeed || Scenario.defaultReadingSpeed,
      data.practiceCount || 0
    );
  }

  static saveScenario(
    conv: DialogflowConversation<unknown, unknown, Contexts>,
    scenario: Scenario
  ) {
    conv.data = {
      articleId: scenario.articleId,
      currentSentence: scenario.currentSentence,
      retryCount: scenario.retryCount,
      readingSpeed: scenario.readingSpeed,
      practiceCount: scenario.practiceCount
    };
  }

  static resetScenario(
    conv: DialogflowConversation<unknown, unknown, Contexts>
  ) {
    conv.data = {
      articleId: "",
      currentSentence: "",
      retryCount: 0,
      readingSpeed: Scenario.defaultReadingSpeed,
      practiceCount: 0
    };
  }
}
