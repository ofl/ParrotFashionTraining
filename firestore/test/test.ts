/// <reference path='../node_modules/mocha-typescript/globals.d.ts' />
import * as firebase from "@firebase/testing";
import * as fs from "fs";

/*
 * ============
 *    Setup
 * ============
 */
const projectId = "prm-test";
const coverageUrl = `http://localhost:8080/emulator/v1/projects/${projectId}:ruleCoverage.html`;

const rules = fs.readFileSync("../firestore.rules", "utf8");

/**
 * Creates a new app with authentication data matching the input.
 *
 * @param {object} auth the object to use for authentication (typically {uid: some-uid})
 * @return {object} the app.
 */
function authedApp(auth) {
  return firebase.initializeTestApp({ projectId, auth }).firestore();
}

/*
 * ============
 *  Test Cases
 * ============
 */
before(async () => {
  await firebase.loadFirestoreRules({ projectId, rules });
});

beforeEach(async () => {
  // Clear the database between tests
  await firebase.clearFirestoreData({ projectId });
});

after(async () => {
  await Promise.all(firebase.apps().map(app => app.delete()));
  console.log(`View rule coverage information at ${coverageUrl}\n`);
});

@suite
class Article {
  @test
  async "should let anyone read article"() {
    const db = authedApp(null);
    const article = db.collection("articles").doc("article");
    await firebase.assertSucceeds(article.get());
  }

  @test
  async "should not let anyone create a article"() {
    const db = authedApp({ uid: "alice" });
    const article = db.collection("articles").doc("firebase");
    await firebase.assertFails(
      article.set({
        guid: "foobarbaz",
        sentences: ["All Things Firebase"],
        title: "Foo Bar baz",
        unixtime: new Date().getTime()
      })
    );
  }
}
