import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import {
  evaluateJavaScriptProgram,
  evaluatePythonProgram,
} from "../src/lib/foundationRunner.js";
const lessons = JSON.parse(
  readFileSync(
    new URL("../src/data/foundations.json", import.meta.url),
    "utf8",
  ),
);
const python = createRequire(import.meta.url)("skulpt");
for (const lesson of lessons.filter((l) =>
  ["javascript", "python"].includes(l.language),
))
  test("Foundation program: " + lesson.id, async () => {
    const rows =
      lesson.language === "python"
        ? await evaluatePythonProgram(lesson.solution, lesson.output, python)
        : evaluateJavaScriptProgram(lesson.solution, lesson.output);
    const exampleRows = lesson.language === "python"
      ? await evaluatePythonProgram(lesson.example, lesson.exampleOutput, python)
      : evaluateJavaScriptProgram(lesson.example, lesson.exampleOutput);
    assert.ok(exampleRows.every(r => r.passed), JSON.stringify(exampleRows));
    assert.ok(
      rows.every((r) => r.passed),
      JSON.stringify(rows),
    );
  });
test("Wrong output cannot pass", () => {
  assert.equal(
    evaluateJavaScriptProgram("console.log(8)", "12")[0].passed,
    false,
  );
});
test("All courses have coherent lesson content and begin at the basics", () => {
  assert.equal(new Set(lessons.map((l) => l.id)).size, 96);
  for (const language of ["python", "javascript", "java", "html", "css"]) {
    const course = lessons.filter((l) => l.language === language);
    assert.ok(course.length >= 18);
    for(const level of ["Intermediate","Advanced"])assert.equal(course.filter(l=>l.level===level).length,4);
    for (const l of course) {
      for (const key of [
        "concept",
        "why",
        "example",
        "task",
        "solution",
        "pitfall",
        "challenge",
      ])
        assert.ok(l[key].trim().length > 0, `${l.id}: ${key}`);
      assert.equal(l.walk.length, 3);
      assert.ok(l.quiz.options[l.quiz.answer]);
    }
    if (["python", "javascript", "java"].includes(language)) {
      assert.ok(course[0].id.endsWith("hello"));
      assert.ok(course[1].id.endsWith("addition"));
    }
  }
});
test('Program console retains output before an error', async () => {
  const emitted=[];
  const rows=evaluateJavaScriptProgram('console.log("Started");throw new Error("Failed");','Started',text=>emitted.push(text));
  assert.equal(rows[0].actual,'Started');assert.equal(rows[0].passed,false);assert.equal(rows[0].error,'Failed');assert.deepEqual(emitted,['Started']);
  const pyRows=await evaluatePythonProgram('print("Started")\nraise ValueError("Failed")','Started',python);
  assert.equal(pyRows[0].actual,'Started');assert.equal(pyRows[0].passed,false);assert.match(pyRows[0].error,/Failed/);
});
