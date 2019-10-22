import * as functions from "firebase-functions";
import * as firebase from "firebase-admin";
firebase.initializeApp();

import {
  dialogflow,
  DialogflowConversation,
  Contexts,
  Confirmation
} from "actions-on-google";

import UserStatusStore from "./UserStatusStore";
import Batch from "./Batch";
import { Scenario, EndStatus } from "./Scenario";
import { Reply } from "./Speech";

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

app.intent("User Answered Intent", async (conv, { answer }) => {
  try {
    const scenario = UserStatusStore.loadScenario(conv);

    if (typeof answer !== "string" || answer === "") {
      await scenario.skipArticle();
      UserStatusStore.saveScenario(conv, scenario);

      conv.close(scenario.toSsml());
      return;
    }

    await scenario.userAnswered(answer);
    UserStatusStore.saveScenario(conv, scenario);

    if (scenario.endStatus === EndStatus.Confirm) {
      conv.contexts.set(AppContexts.CONTINUE_PRACTICE, 1);
      conv.ask(new Confirmation(scenario.toSsml()));
      return;
    }

    conv.ask(scenario.toSsml());
  } catch (error) {
    console.error(error);

    UserStatusStore.resetScenario(conv);
    conv.close(new Reply(error.message).toSsml());
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
      return scenario.skipSentence();
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

app.intent("Continue Confirmation Handler", async (conv, _, confirmation) => {
  if (confirmation) {
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
    const scenario = UserStatusStore.loadScenario(conv);

    await callback(scenario);

    UserStatusStore.saveScenario(conv, scenario);

    if (scenario.endStatus === EndStatus.Continue) {
      conv.ask(scenario.toSsml());
    } else {
      conv.close(scenario.toSsml());
    }
  } catch (error) {
    console.error(error);

    UserStatusStore.resetScenario(conv);
    conv.close(new Reply(error.message).toSsml());
  }
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
