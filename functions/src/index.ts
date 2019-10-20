import * as functions from "firebase-functions";
import * as firebase from "firebase-admin";
firebase.initializeApp();

import {
  dialogflow,
  DialogflowConversation,
  Contexts
} from "actions-on-google";

import UserStatusStore from "./UserStatusStore";
import Batch from "./Batch";
import Scenario from "./Scenario";
import { Speech, SpeechType, Reply } from "./Speech";
import SSML from "./SSML";

const app = dialogflow();

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

      speak(conv, scenario.speeches);
      return;
    }

    await scenario.userAnswered(answer);
    UserStatusStore.saveScenario(conv, scenario);

    speak(conv, scenario.speeches);
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

const actScenario = async (
  conv: DialogflowConversation<unknown, unknown, Contexts>,
  callback: (scenario: Scenario) => Promise<void>
) => {
  try {
    const scenario = UserStatusStore.loadScenario(conv);

    await callback(scenario);

    UserStatusStore.saveScenario(conv, scenario);

    speak(conv, scenario.speeches);
  } catch (error) {
    console.error(error);

    UserStatusStore.resetScenario(conv);
    conv.close(new Reply(error.message).toSsml());
  }
};

const speak = (
  conv: DialogflowConversation<unknown, unknown, Contexts>,
  speeches: Speech[]
) => {
  let ssml = "";
  let lastSpeechType: SpeechType = SpeechType.Ask;

  speeches.forEach(speech => {
    ssml += speech.toSsml();
    lastSpeechType = speech.speechType;
  });

  if (lastSpeechType === SpeechType.Ask) {
    conv.ask(SSML.enclose(ssml));
  } else {
    conv.close(SSML.enclose(ssml));
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
