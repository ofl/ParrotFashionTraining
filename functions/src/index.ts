import * as functions from "firebase-functions";
import { dialogflow } from "actions-on-google";

const app = dialogflow();

app.intent("Default Welcome Intent", conv => {
  console.log(conv);
  conv.ask("Are you ok?");
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
