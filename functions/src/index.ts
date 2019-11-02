import * as functions from "firebase-functions";
import * as firebase from "firebase-admin";
firebase.initializeApp();

import {
  dialogflow,
  DialogflowConversation,
  Contexts
} from "actions-on-google";

import ScenarioStore from "./ScenarioStore";
import Batch from "./Batch";
import { Scenario, EndStatus } from "./Scenario";
import { Response } from "./SpeechComponent";
import { Speech } from "./Speech";

const app = dialogflow();

const AppContexts = {
  WAITING_ANSWER: "waiting_answer",
  CONTINUE_PRACTICE: "continue_practice"
};

app.intent("Default Welcome Intent", async conv => {
  await actScenario(
    conv,
    (scenario: Scenario): Promise<void> => {
      return scenario.welcome();
    }
  );
});

app.intent("User Answered Handler", async (conv, { answer }) => {
  try {
    const scenario = ScenarioStore.load(conv);

    if (typeof answer !== "string" || answer === "") {
      await scenario.skipArticle();
      ScenarioStore.save(conv, scenario);

      speak(conv, scenario.speeches);
      return;
    }

    await scenario.userAnswered(answer);
    ScenarioStore.save(conv, scenario);

    speak(conv, scenario.speeches);
  } catch (error) {
    console.error(error);

    ScenarioStore.reset(conv);
    conv.close(new Response(error.message).toSsml());
  }
});

app.intent("Skip Article Intent", async conv => {
  await actScenario(
    conv,
    (scenario: Scenario): Promise<void> => {
      return scenario.skipArticle();
    }
  );
});

app.intent("Skip Sentence Intent", async conv => {
  await actScenario(
    conv,
    (scenario: Scenario): Promise<void> => {
      return scenario.skipPractice();
    }
  );
});

app.intent("Say It Again Intent", async conv => {
  await actScenario(
    conv,
    (scenario: Scenario): Promise<void> => {
      return scenario.sayAgain();
    }
  );
});

app.intent("Default Goodbye Intent", async conv => {
  await actScenario(
    conv,
    (scenario: Scenario): Promise<void> => {
      return scenario.sayGoodBye();
    }
  );
});

app.intent("Continue Confirmation Handler", async (conv, { Boolean }) => {
  if (Boolean === "true") {
    await actScenario(
      conv,
      (scenario: Scenario): Promise<void> => {
        return scenario.skipArticle();
      }
    );
  } else {
    await actScenario(
      conv,
      (scenario: Scenario): Promise<void> => {
        return scenario.sayGoodBye();
      }
    );
  }
});

app.intent("Stop Practice Intent", async conv => {
  await actScenario(
    conv,
    (scenario: Scenario): Promise<void> => {
      return scenario.sayGoodBye();
    }
  );
});

const actScenario = async (
  conv: DialogflowConversation<unknown, unknown, Contexts>,
  callback: (scenario: Scenario) => Promise<void>
) => {
  try {
    const scenario = ScenarioStore.load(conv);

    await callback(scenario);

    ScenarioStore.save(conv, scenario);

    speak(conv, scenario.speeches);
  } catch (error) {
    console.error(error);

    ScenarioStore.reset(conv);
    conv.close(new Response(error.message).toSsml());
  }
};

const speak = (
  conv: DialogflowConversation<unknown, unknown, Contexts>,
  speeches: Speech[]
) => {
  speeches.forEach(speech => {
    switch (speech.endStatus) {
      case EndStatus.Close:
        conv.close(speech.toSsml());
        break;

      case EndStatus.Confirm:
        conv.contexts.set(AppContexts.CONTINUE_PRACTICE, 1);
        conv.ask(speech.toSsml());
        break;

      case EndStatus.WaitingAnswer:
        conv.contexts.set(AppContexts.WAITING_ANSWER, 1);
        conv.ask(speech.toSsml());
        break;

      default:
        conv.ask(speech.toSsml());
        break;
    }
  });
};

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);

exports.scheduledBatchCreateArticles = functions.pubsub
  .schedule("10 * * * *")
  .timeZone("Asia/Tokyo")
  .onRun(async _context => {
    console.log("Batch.createArticlesFromRSS");

    await Batch.createArticlesFromRSS();
    await Batch.deleteOldArticles();
  });
