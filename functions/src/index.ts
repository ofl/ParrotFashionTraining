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
import { Speech, Reply, Credit, RawText, SpeechType } from "./Speech";

const app = dialogflow();
const i18n = require("i18n");
const moment = require("moment");

i18n.configure({
  locales: ["en-US", "ja-JP"],
  directory: __dirname + "/locales",
  defaultLocale: "en-US"
});

app.middleware(conv => {
  i18n.setLocale(conv.user.locale);
  moment.locale(conv.user.locale);
});

app.intent("Default Welcome Intent", async conv => {
  await doScenario(
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
    conv.close(i18n.__(error.message));
  }
});

app.intent("Skip Article Intent", async conv => {
  await doScenario(
    conv,
    (scenario: Scenario): Promise<void> => {
      return scenario.skipArticle();
    }
  );
});

app.intent("Skip Sentence Intent", async conv => {
  await doScenario(
    conv,
    (scenario: Scenario): Promise<void> => {
      return scenario.skipSentence();
    }
  );
});

app.intent("Say It Again Intent", async conv => {
  await doScenario(
    conv,
    (scenario: Scenario): Promise<void> => {
      return scenario.sayAgain();
    }
  );
});

app.intent("Default Goodbye Intent", async conv => {
  await doScenario(
    conv,
    (scenario: Scenario): Promise<void> => {
      return scenario.sayGoodBye();
    }
  );
});

const doScenario = async (
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
    conv.close(i18n.__(error.message));
  }
};

const speak = (
  conv: DialogflowConversation<unknown, unknown, Contexts>,
  speeches: Speech[]
) => {
  // async対策
  app.middleware(conv2 => {
    i18n.setLocale(conv2.user.locale);
    moment.locale(conv2.user.locale);
  });

  let text = "";

  speeches.forEach(speech => {
    text += translate(speech);

    if (speech.speechType == SpeechType.Continue) {
      return;
    } else if (speech.speechType == SpeechType.Ask) {
      conv.ask(text);
    } else if (speech.speechType == SpeechType.Close) {
      conv.close(text);
    }
    text = "";
  });
};

const translate = (speech: Reply | Credit | RawText): string => {
  if (speech instanceof Reply) {
    return i18n.__(speech.keyword, speech.dictionary);
  } else if (speech instanceof Credit) {
    return i18n.__("FROM", {
      source: speech.from,
      fromNow: moment.unix(speech.unixtime).fromNow()
    });
  } else {
    return speech.text;
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
