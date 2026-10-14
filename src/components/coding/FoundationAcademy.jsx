import React, { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Check,
  Code2,
  Download,
  Play,
  RotateCcw,
  Search,
  Sparkles,
} from "lucide-react";
import { photos } from "../../assets/photoLibrary";
import lessons from "../../data/foundations.json";
import {
  runJavaScriptProgram,
  checkHTML,
  checkCSS,
  makePreview,
} from "../../lib/foundationRunner";
import "./FoundationAcademy.css";
const languages = [
  ["python", "Python", "Start with readable programs."],
  ["javascript", "JavaScript", "Learn the language of interactive pages."],
  ["html", "HTML", "Give a web page its structure."],
  ["css", "CSS", "Make a page readable and responsive."],
  ["java", "Java", "Learn typed programs step by step."],
];
function read(key) {
  try {
    const d = JSON.parse(localStorage.getItem(key));
    return d && typeof d === "object"
      ? { entries: {}, last: {}, ...d }
      : { entries: {}, last: {} };
  } catch {
    return { entries: {}, last: {} };
  }
}
function download(text, name) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function FoundationAcademy({ userData, onContinue }) {
  const key = "placementtwin_foundations_v10_" + (userData?.email || "guest");
  const [saved, setSaved] = useState(() => read(key));
  const [language, setLanguage] = useState(
    () => read(key).language || "python",
  );
  const [activeId, setActiveId] = useState(() => {
    const s = read(key),
      lang = s.language || "python";
    return s.last[lang] || lang + "-hello";
  });
  const [level, setLevel] = useState(() => {
    const data = read(key);
    return (
      lessons.find((l) => l.id === data.last[data.language || "python"])
        ?.level || "Beginner"
    );
  });
  const [consoleOutput, setConsoleOutput] = useState("");
  const [hasRun, setHasRun] = useState(false);
  const [stage, setStage] = useState("learn");
  const [catalogOpen, setCatalogOpen] = useState(false);
  const screenTop = useRef(null);
  const switchStage = (next) => {
    setStage(next);
    setCatalogOpen(false);
    requestAnimationFrame(() => {
      screenTop.current?.scrollIntoView({ block: "start", behavior: "instant" });
      screenTop.current?.focus({ preventScroll: true });
    });
  };
  const [query, setQuery] = useState("");
  const [quizFeedback, setQuizFeedback] = useState("");
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);
  const [hints, setHints] = useState(0);
  const [preview, setPreview] = useState(null);
  const [width, setWidth] = useState(360);
  const [undo, setUndo] = useState(null);
  const [saveError, setSaveError] = useState("");
  const [exampleRows, setExampleRows] = useState(null);
  const [solutionOpen, setSolutionOpen] = useState(false);
  const controller = useRef(null);
  const heading = useRef(null);
  const course = lessons.filter((l) => l.language === language);
  const active = course.find((l) => l.id === activeId) || course[0];
  const index = course.indexOf(active);
  const visibleCourse = course.filter(
    (l) => level === "all" || l.level === level,
  );
  const entry = saved.entries[active.id] || {};
  const code = entry.code ?? active.starter;
  const isWeb = ["html", "css"].includes(language),
    isJava = language === "java";
  const solved = course.filter((l) => saved.entries[l.id]?.complete).length;
  const label = languages.find((l) => l[0] === language)?.[1];
  const patch = (values) =>
    setSaved((old) => ({
      ...old,
      entries: {
        ...old.entries,
        [active.id]: { ...old.entries[active.id], ...values },
      },
    }));
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(saved));
      setSaveError("");
    } catch {
      setSaveError(
        "Browser storage is unavailable. Export your learning progress before closing this page.",
      );
    }
  }, [saved, key]);
  useEffect(() => () => controller.current?.abort(), []);
  const select = (lesson, focus = false) => {
    controller.current?.abort();
    setLanguage(lesson.language);
    setLevel(lesson.level);
    setConsoleOutput("");
    setHasRun(false);
    setActiveId(lesson.id);
    setStage("learn");
    setCatalogOpen(false);
    setQuizFeedback("");
    setRows(null);
    setExampleRows(null);
    setError("");
    setRunning(false);
    setHints(0);
    setPreview(null);
    setUndo(null);
    setSolutionOpen(false);
    setSaved((old) => ({
      ...old,
      language: lesson.language,
      last: { ...old.last, [lesson.language]: lesson.id },
    }));
    if (focus) setTimeout(() => heading.current?.focus(), 0);
  };
  const switchLanguage = (lang) => {
    const target =
      lessons.find((l) => l.id === saved.last[lang]) ||
      lessons.find((l) => l.language === lang);
    setQuery("");
    select(target);
  };
  const changeCode = (value) => {
    patch({ code: value, passed: false, reviewed: false });
    setRows(null);
    setError("");
    setPreview(null);
    setConsoleOutput("");
    setHasRun(false);
  };
  const checkQuiz = (i) => {
    const correct = i === active.quiz.answer;
    setQuizFeedback(
      (correct ? "Correct. " : "Not quite. ") + active.quiz.explanation,
    );
    if (correct)
      patch({
        quiz: true,
        complete: entry.complete || !!entry.passed || !!entry.reviewed,
      });
  };
  const execute = async (example = false) => {
    controller.current?.abort();
    const abort = new AbortController();
    controller.current = abort;
    setRunning(true);
    setError("");
    if (example) setExampleRows(null);
    else setRows(null);
    const source = example ? active.example : code;
    setConsoleOutput("");
    setHasRun(true);
    const onOutput = (text) => {
      if (!abort.signal.aborted) setConsoleOutput(text);
    };
    try {
      if (isWeb) {
        setPreview(
          makePreview(source, language, active.fixture, photos.dashboardEmpty),
        );
        if (example) return;
      }
      let result;
      if (language === "javascript")
        result = await runJavaScriptProgram(source, active.output, {
          signal: abort.signal,
          onOutput,
        });
      else if (language === "python")
        result = await (
          await import("../../lib/pythonRunner")
        ).runPythonProgram(source, active.output, {
          signal: abort.signal,
          onOutput,
        });
      else if (language === "html") result = checkHTML(source, active.checks);
      else if (language === "css")
        result = await checkCSS(source, active, { signal: abort.signal });
      if (abort.signal.aborted) return;
      if (!isWeb) {
        setConsoleOutput(result?.[0]?.actual || "");
        if (result?.[0]?.error) setError(result[0].error);
      }
      if (example) {
        setExampleRows(result);
        return;
      }
      setRows(result);
      if (result?.length && result.every((r) => r.passed))
        patch({
          passed: true,
          complete: entry.complete || !!entry.quiz,
          completedAt: new Date().toISOString(),
        });
    } catch (e) {
      if (!abort.signal.aborted) setError(String(e.message || e));
    } finally {
      if (!abort.signal.aborted) setRunning(false);
    }
  };
  const markReviewed = () =>
    patch({
      reviewed: true,
      complete: entry.complete || !!entry.quiz,
      completedAt: new Date().toISOString(),
    });
  const completedStep = entry.complete
    ? "Completed — revisit whenever you like"
    : isJava
      ? "Complete the quick check and your self-review."
      : "Complete the quick check and exercise checks.";
  return (
    <section className={`foundation-academy academy-screen-${stage}${catalogOpen ? " academy-catalog-open" : ""}`}>
      <div className="academy-screen-toolbar" ref={screenTop} tabIndex={-1}>
        <div><span className="eyebrow">{stage === "practice" ? "CODING WORKSPACE" : "LESSON EXPLANATION"}</span><p>{label} · {active.level} · Lesson {index + 1}</p></div>
        {stage === "practice" ? <button className="btn-soft" onClick={() => switchStage("learn")}><ArrowLeft size={16}/> Back to explanation</button> : <button className="btn-soft" aria-expanded={catalogOpen} aria-controls="academy-course-browser" onClick={() => setCatalogOpen(v => !v)}><BookOpen size={16}/>{catalogOpen ? "Close lesson browser" : "Choose language or lesson"}</button>}
      </div>
      <div id="academy-course-browser" hidden={!catalogOpen}>
      <div
        className="academy-languages"
        role="group"
        aria-label="Learning language"
      >
        {languages.map(([id, name, description]) => (
          <button
            key={id}
            aria-pressed={language === id}
            onClick={() => switchLanguage(id)}
          >
            <strong>{name}</strong>
            <span>{description}</span>
          </button>
        ))}
      </div>

        <aside className="academy-path neu-float">
          <div className="academy-path-heading">
            <BookOpen size={18} />
            <h3>{label} learning path</h3>
          </div>
          <p>
            {solved} of {course.length} lessons completed
          </p>
          <progress
            aria-label={`${label} course completion`}
            max={course.length}
            value={solved}
          />
          <p className="academy-small">
            Follow the order if you’re new. Nothing is locked.
          </p>
          <label className="academy-level">
            Learning level
            <select
              aria-label="Learning level"
              value={level}
              onChange={(e) => {
                const value = e.target.value;
                setQuery("");
                if (value === "all") setLevel("all");
                else {
                  const target =
                    course.find(
                      (l) =>
                        l.level === value && !saved.entries[l.id]?.complete,
                    ) || course.find((l) => l.level === value);
                  select(target);
                }
              }}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="all">All levels</option>
            </select>
          </label>
          <label className="academy-search">
            <Search size={15} />
            <input
              aria-label="Find a lesson"
              placeholder="Find a lesson…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label className="academy-mobile-select">
            Jump to lesson
            <select
              value={active.id}
              onChange={(e) =>
                select(course.find((l) => l.id === e.target.value))
              }
            >
              {visibleCourse.map((l) => (
                <option value={l.id} key={l.id}>
                  {course.indexOf(l) + 1}. {l.title}
                </option>
              ))}
            </select>
          </label>
          <div className="academy-path-list">
            {[...new Set(visibleCourse.map((l) => l.module))].map((module) => (
              <section key={module}>
                <h4>{module}</h4>
                {visibleCourse
                  .filter(
                    (l) =>
                      l.module === module &&
                      l.title.toLowerCase().includes(query.toLowerCase()),
                  )
                  .map((l) => (
                    <button
                      key={l.id}
                      aria-current={active.id === l.id ? "step" : undefined}
                      onClick={() => select(l)}
                    >
                      <span className="academy-number">
                        {saved.entries[l.id]?.complete ? (
                          <Check size={15} />
                        ) : (
                          String(course.indexOf(l) + 1).padStart(2, "0")
                        )}
                      </span>
                      <span>
                        {l.title}
                        <small>
                          {l.minutes} min ·{" "}
                          {saved.entries[l.id]?.complete
                            ? l.language === "java"
                              ? "Self-reviewed"
                              : "Completed"
                            : l.level}
                        </small>
                      </span>
                    </button>
                  ))}
              </section>
            ))}
            {!visibleCourse.some((l) =>
              l.title.toLowerCase().includes(query.toLowerCase()),
            ) && <p>No matching lessons.</p>}
          </div>
          <button
            className="btn-soft"
            onClick={() =>
              download(
                JSON.stringify({ version: 10, ...saved }, null, 2),
                "placement-twin-learning-progress.json",
              )
            }
          >
            <Download size={14} />
            Export learning progress
          </button>
        </aside>
      </div>
      {saveError && <p role="alert">{saveError}</p>}
      <div className="academy-layout">
        <article className="academy-lesson neu-float">
          <header>
            <span className="eyebrow">
              {label} / LESSON {index + 1} OF {course.length} / {active.minutes}{" "}
              MIN
            </span>
            <h2 ref={heading} tabIndex={-1}>
              {active.title}
            </h2>
            <p className="academy-small">
              {index === 0
                ? "Start here. No prior knowledge needed."
                : `Builds on: ${course[index - 1].title}`}
            </p>
            <p className="academy-completion">{completedStep}</p>
          </header>
          <nav className="academy-stages" aria-label="Lesson steps">
            <button
              aria-current={stage === "learn" ? "step" : undefined}
              onClick={() => switchStage("learn")}
            >
              <BookOpen size={16} />
              1. Explanation {entry.quiz && <Check size={14} />}
            </button>
            <button
              aria-current={stage === "practice" ? "step" : undefined}
              onClick={() => switchStage("practice")}
            >
              <Code2 size={16} />
              2. Coding workspace{" "}
              {((isJava && entry.reviewed) || entry.passed) && (
                <Check size={14} />
              )}
            </button>
          </nav>
          {stage === "learn" ? (
            <div className="academy-content">
              <h3>What are we learning?</h3>
              <p>{active.concept}</p>
              <aside className="academy-callout">
                <Sparkles size={19} />
                <div>
                  <strong>Why this is useful</strong>
                  <p>{active.why}</p>
                </div>
              </aside>
              <h3>See a small example</h3>
              <pre>
                <code>{active.example}</code>
              </pre>
              {!isJava && (
                <button
                  className="btn-soft"
                  disabled={running}
                  onClick={() => execute(true)}
                >
                  <Play size={14} />
                  {running
                    ? "Running…"
                    : isWeb
                      ? "Preview example"
                      : "Run example"}
                </button>
              )}
              {exampleRows && (
                <div className="academy-output">
                  <strong>Actual example output</strong>
                  <pre>{exampleRows[0]?.actual || "(No output)"}</pre>
                  <small>
                    This is the example. Your exercise below may use different
                    values.
                  </small>
                </div>
              )}
              <h3>Before you continue, predict the result</h3>
              <p>
                Read the example from top to bottom. What will it display, or
                how will the page look? Say your answer before revealing or
                previewing it.
              </p>
              {!isWeb && (
                <details>
                  <summary>What should this example display?</summary>
                  <pre>{active.exampleOutput}</pre>
                  <p>
                    Follow the walkthrough below to connect the code to this
                    output.
                  </p>
                </details>
              )}
              <h3>Walk through it, one step at a time</h3>
              <ol className="academy-walk">
                {active.walk.map((line, i) => (
                  <li key={line}>
                    <span>{i + 1}</span>
                    <p>{line}</p>
                  </li>
                ))}
              </ol>
              <details className="academy-glossary">
                <summary>New words, simply explained</summary>
                <dl>
                  {active.terms.map(([term, meaning]) => (
                    <div key={term}>
                      <dt>{term}</dt>
                      <dd>{meaning}</dd>
                    </div>
                  ))}
                </dl>
              </details>
              {isJava && (
                <aside className="academy-callout">
                  <div>
                    <strong>About the Java wrapper</strong>
                    <p>
                      Save the file as Main.java. public class Main defines its
                      class; public static void main(String[] args) is where
                      Java starts. Braces group the instructions. End ordinary
                      statements with a semicolon. You can keep this wrapper
                      unchanged for now.
                    </p>
                    <p>
                      This frontend teaches Java through examples and
                      self-review. It does not compile or execute Java. With a
                      local JDK installed, run <code>javac Main.java</code>,
                      then <code>java Main</code>.
                    </p>
                  </div>
                </aside>
              )}
              <aside className="academy-mistake">
                <strong>A mistake to watch for</strong>
                <p>{active.pitfall}</p>
              </aside>
              <section className="academy-quiz">
                <span className="eyebrow">A QUICK CHECK · NO PENALTIES</span>
                <h3>{active.quiz.q}</h3>
                {active.quiz.options.map((option, i) => (
                  <button key={option} onClick={() => checkQuiz(i)}>
                    <span>{String.fromCharCode(65 + i)}</span>
                    {option}
                  </button>
                ))}
                {quizFeedback && <p role="status">{quizFeedback}</p>}
                {entry.quiz && (
                  <p className="text-moss">✓ Understanding check completed</p>
                )}
              </section>
              <button
                className="btn-brass"
                onClick={() => switchStage("practice")}
              >
                Now try it yourself <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="academy-content academy-practice-content">
              <details className="academy-task-brief" open><summary>Exercise brief & target output</summary>
              <h3>Your challenge</h3>
              <p>{active.task}</p>
              {!isWeb && (
                <div className="academy-output">
                  <strong>
                    {isJava
                      ? "Expected output when compiled and run"
                      : "Target output"}
                  </strong>
                  <pre>{active.output}</pre>
                </div>
              )}
              {language === "css" && (
                <details>
                  <summary>The HTML you are styling</summary>
                  <pre>
                    <code>{active.fixture}</code>
                  </pre>
                </details>
              )}
              </details>
              <div className="academy-editor-bar">
                <label htmlFor="foundation-code">Your {label} code</label>
                <button
                  className="btn-soft"
                  onClick={() => {
                    setUndo(code);
                    changeCode(active.starter);
                  }}
                >
                  <RotateCcw size={13} />
                  Reset
                </button>
                {undo !== null && (
                  <button
                    className="btn-soft"
                    onClick={() => {
                      changeCode(undo);
                      setUndo(null);
                    }}
                  >
                    Undo reset
                  </button>
                )}
              </div>
              <textarea
                id="foundation-code"
                aria-label="Lesson code editor"
                className="academy-code"
                spellCheck="false"
                value={code}
                onChange={(e) => changeCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Tab") {
                    e.preventDefault();
                    const a = e.currentTarget.selectionStart,
                      b = e.currentTarget.selectionEnd;
                    changeCode(code.slice(0, a) + "    " + code.slice(b));
                    const el = e.currentTarget;
                    requestAnimationFrame(() => {
                      el.selectionStart = el.selectionEnd = a + 4;
                    });
                  }
                  if (
                    (e.ctrlKey || e.metaKey) &&
                    e.key === "Enter" &&
                    !isJava
                  ) {
                    e.preventDefault();
                    execute();
                  }
                }}
              />
              <p className="academy-small">
                Draft saved in this browser.{" "}
                {isJava
                  ? "Download Main.java to run with your local JDK."
                  : "Tab inserts spaces · Ctrl/Cmd + Enter runs checks."}
              </p>
              <div className="academy-actions">
                {!isJava && (
                  <button
                    className="btn-brass"
                    disabled={running}
                    onClick={() => execute()}
                  >
                    <Play size={15} />
                    {running
                      ? "Checking…"
                      : isWeb
                        ? "Preview & check"
                        : "Run my code"}
                  </button>
                )}
                <button
                  className="btn-soft"
                  disabled={hints >= active.hints.length}
                  onClick={() => setHints((n) => n + 1)}
                >
                  Give me a hint ({hints}/{active.hints.length})
                </button>
                <button
                  className="btn-soft"
                  onClick={() =>
                    download(
                      code,
                      isJava
                        ? "Main.java"
                        : `lesson.${{ python: "py", javascript: "js", html: "html", css: "css" }[language]}`,
                    )
                  }
                >
                  <Download size={14} />
                  Save code
                </button>
              </div>
              {!isWeb && !isJava && (
                <section
                  className="academy-console"
                  aria-label="Program output"
                >
                  <div>
                    <strong>Console · actual output</strong>
                    <span>
                      {running ? "Running" : hasRun ? "Finished" : "Ready"}
                    </span>
                    <button
                      className="btn-soft"
                      disabled={running}
                      onClick={() => {
                        setConsoleOutput("");
                        setHasRun(false);
                      }}
                    >
                      Clear output
                    </button>
                    {running && (
                      <button
                        className="btn-soft"
                        onClick={() => {
                          controller.current?.abort();
                          setRunning(false);
                          setError("Stopped by you.");
                        }}
                      >
                        Stop
                      </button>
                    )}
                  </div>
                  <pre aria-live="polite">
                    {consoleOutput ||
                      (running
                        ? "Waiting for output…"
                        : hasRun
                          ? "(Program produced no output)"
                          : "Run your code to see its output here.")}
                  </pre>
                  {error && <p role="alert">{error}</p>}
                </section>
              )}
              {isJava && (
                <div className="academy-console">
                  <strong>Java output · compiler not connected</strong>
                  <p>
                    Use Save code, then run Main.java with a local JDK. The
                    target above is expected output, not an executed result.
                  </p>
                </div>
              )}
              {rows && (
                <div className="academy-results" role="status">
                  <h3>
                    {rows.every((r) => r.passed)
                      ? "Exercise checks passed"
                      : "Let’s adjust one thing"}
                  </h3>
                  {rows.map((r, i) => (
                    <div
                      key={i}
                      className={r.passed ? "academy-pass" : "academy-fail"}
                    >
                      <strong>
                        {r.passed ? "✓" : "○"} {r.label}
                      </strong>
                      <div>
                        <span>Expected</span>
                        <pre>{r.expected}</pre>
                        <span>{isWeb ? "Found" : "Your output"}</span>
                        <pre>{r.actual || "(No output)"}</pre>
                      </div>
                    </div>
                  ))}
                  <p className="academy-small">
                    {isWeb
                      ? "Checks cover the listed structure or styles. They are not a full accessibility audit."
                      : "Output checks compare this example only. Use the requested technique and try the stretch task to deepen your understanding."}
                  </p>
                  {rows.every((r) => r.passed) && !entry.quiz && (
                    <button
                      className="btn-soft"
                      onClick={() => switchStage("learn")}
                    >
                      Finish the quick check to complete this lesson
                    </button>
                  )}
                </div>
              )}
              <details className="academy-practice-support" open={hints > 0 ? true : undefined}><summary>Hints, worked solution & reflection</summary>
              {active.hints.slice(0, hints).map((hint, i) => (
                <p className="academy-hint" key={hint}>
                  <strong>Hint {i + 1}:</strong> {hint}
                </p>
              ))}
              <details
                open={solutionOpen}
                onToggle={(e) => setSolutionOpen(e.currentTarget.open)}
              >
                <summary>Explain the worked solution</summary>
                <p>
                  Read it in order. Compare each step with your attempt; focus
                  on why it works rather than memorizing it.
                </p>
                <pre>
                  <code>{active.solution}</code>
                </pre>
                <ol>
                  {active.walk.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
                <p>{active.pitfall}</p>
              </details>
              {isJava && (
                <section className="academy-java-review">
                  <h3>Java self-review</h3>
                  <p>
                    No compiler is connected. Completion here records your
                    review, not a successful Java test.
                  </p>
                  <ol>
                    <li>
                      Check the class and main method, braces, quotes and
                      semicolons.
                    </li>
                    <li>
                      Trace each instruction and compare your expected output
                      with the target.
                    </li>
                    <li>
                      Compare with the worked solution; explain the role of each
                      line.
                    </li>
                  </ol>
                  <button
                    className="btn-brass"
                    disabled={!code.trim() || code === active.starter}
                    onClick={markReviewed}
                  >
                    {entry.reviewed
                      ? "✓ Self-review recorded"
                      : "I have written and reviewed my solution"}
                  </button>
                </section>
              )}
              <aside className="academy-callout">
                <div>
                  <strong>Make it yours · optional stretch</strong>
                  <p>{active.challenge}</p>
                  <small>
                    Stretch tasks are for exploration; the exercise checks still
                    use the original target.
                  </small>
                </div>
              </aside>
              <label className="academy-reflection">
                Explain it in your own words
                <textarea
                  placeholder="What did you learn? What would you try next?"
                  value={entry.note || ""}
                  onChange={(e) => patch({ note: e.target.value })}
                />
              </label>
              </details>
            </div>
          )}
          {error && (isWeb || isJava || stage === "learn") && (
            <p role="alert" className="academy-error">
              {error}
            </p>
          )}
          {preview && (
            <section className="academy-preview">
              <div>
                <h3>Your page preview</h3>
                <label>
                  Preview width
                  <select
                    aria-label="Preview width"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                  >
                    <option value={360}>Narrow · 360px</option>
                    <option value={800}>Wide · 800px</option>
                  </select>
                </label>
              </div>
              <p className="academy-small">
                Scripts, external resources and link navigation are disabled.
                The bundled study photograph is allowed. A wide preview scrolls
                within this panel on smaller screens.
              </p>
              <div className="academy-frame-scroll">
                <iframe
                  title="Lesson page preview"
                  sandbox=""
                  srcDoc={preview}
                  style={{ width }}
                />
              </div>
            </section>
          )}
          <footer className="academy-footer">
            <button
              className="btn-soft"
              disabled={index === 0}
              onClick={() => select(course[index - 1], true)}
            >
              <ArrowLeft size={14} />
              Previous
            </button>
            <span>
              {entry.complete
                ? "✓ " + (isJava ? "Self-reviewed" : "Completed")
                : `${index + 1} / ${course.length}`}
            </span>
            {index < course.length - 1 ? (
              <button
                className="btn-brass"
                onClick={() => select(course[index + 1], true)}
              >
                Next lesson <ArrowRight size={14} />
              </button>
            ) : (
              <button className="btn-brass" onClick={onContinue}>
                Explore more practice <ArrowRight size={14} />
              </button>
            )}
          </footer>
        </article>
      </div>
    </section>
  );
}
