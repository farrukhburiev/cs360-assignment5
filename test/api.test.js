import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import { createAppServer } from "../src/server.js";
import { TranscriptStore } from "../src/transcriptStore.js";

// Starts a fresh server (with an empty store) before every test, so tests never share state.
describe("Transcript API", () => {
  let server;
  let baseURL;

  beforeEach(async () => {
    server = createAppServer(new TranscriptStore());
    await new Promise((resolve) => server.listen(0, resolve));
    baseURL = `http://127.0.0.1:${server.address().port}`;
  });

  afterEach(async () => {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  });

  // Sends one request and returns the status code and the parsed JSON body (if any).
  async function call(method, path, body) {
    const response = await fetch(`${baseURL}${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await response.text();
    return { status: response.status, body: text ? JSON.parse(text) : undefined };
  }

  test("creates a student and returns the transcript", async () => {
    const created = await call("POST", "/transcripts", { name: "Ada" });
    assert.equal(created.status, 201);
    assert.deepEqual(created.body, { studentID: 1 });

    const transcript = await call("GET", "/transcripts/1");
    assert.equal(transcript.status, 200);
    assert.deepEqual(transcript.body, {
      student: { studentID: 1, studentName: "Ada" },
      grades: [],
    });
  });

  test("adds a grade and reads it back", async () => {
    await call("POST", "/transcripts", { name: "Lin" });

    const added = await call("POST", "/transcripts/1/cs360", { grade: 85 });
    assert.equal(added.status, 201);

    const grade = await call("GET", "/transcripts/1/cs360");
    assert.deepEqual(grade.body, { studentID: 1, course: "CS360", grade: 85 });
  });

  test("answers 404 for an unknown request", async () => {
    const response = await call("GET", "/nothing-here");
    assert.equal(response.status, 404);
  });
});
