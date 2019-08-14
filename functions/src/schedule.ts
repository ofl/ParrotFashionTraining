import * as functions from "firebase-functions";
import Batch from "./batch";

exports.scheduledFunction = functions.pubsub
  .schedule("10 * * * *")
  .onRun(async _context => {
    console.log("Batch.createArticlesFromRSS");

    await Batch.createArticlesFromRSS();
  });

exports.scheduledFunction = functions.pubsub
  .schedule("20 1 * * *")
  .onRun(async _context => {
    console.log("Batch.deleteOldArticles");

    await Batch.deleteOldArticles();
  });
