# Placement Twin · v13

A coding academy from beginner through advanced inside the existing placement-preparation workspace. The restored layout, resume/JD interview practice and v9 challenge features remain available. This archive contains the source, tests and production build.

## Run the app

Install Node.js 22.12+ or 24. Extract the ZIP, open a terminal inside `placement-twin`, and run:

```sh
npm ci
npm run dev
```

Open the URL printed in the terminal. No API key is required. Do not double-click index.html: the app needs an HTTP server.

```sh
npm run build
npm run preview
```

## New in v13

- Separate explanation and coding screens for all 96 academy lessons. Open **2. Coding workspace** or **Now try it yourself** to practise, then **Back to explanation** to return.
- The coding screen hides the dashboard sidebar, course browser and workspace marketing header. A full-width, vertically resizable editor starts at 58% of desktop viewport height, with a larger output console below.
- Lesson/language selection opens only when requested via **Choose language or lesson**. Reading uses a comfortable single column.
- Exercise instructions can be collapsed. Hints, solutions and reflection are grouped under an expandable panel. The back button remains available while scrolling.
- Drafts, progress and output survive switching between the two screens. Saved drafts also survive reloads. Java remains guided self-review; no Java compiler has been added.

## Included from v12

- Adapted the supplied design reference to Placement Twin: charcoal, crimson and warm chalk, photographic hero, bundled Oswald headings and Inter body text.
- Matched the landing page, sign-up/login forms, dashboard and learning workspace. Existing dashboard navigation and learning functionality remain.
- Added restrained button lift and light sweep, animated navigation underlines, photo colour/zoom transitions, pointer-responsive 3D tilt, dashboard tile highlights and scroll reveals.
- Added a responsive mobile navigation menu and a curriculum preview with Beginner, Intermediate and Advanced filters showing real lesson titles.
- Hover effects apply to precise pointing devices. Reduced-motion preferences disable decorative movement, including the 3D tilt. Keyboard focus indicators and modal keyboard controls remain available.
- Fonts and photos ship with the app; no Google Fonts connection is needed. Font licences are in `public/fonts`.

## Included from v11

- Replaced all nine gradient image placeholders with real stock photographs, bundled locally. Added photo sections to the landing page, dashboard and learning academy. See `docs/PHOTO_CREDITS.md` for sources.
- Added 40 authored lessons: four intermediate and four advanced lessons in each of the five paths. The 56 existing lessons remain.
- Programming progression now includes transformations, frequency maps, error handling, classes, recursion, binary search, memoization and a basket-processing capstone.
- HTML additions cover form groups, figures, native disclosures, document metadata, associated errors, skip links, responsive image markup and accessible enrollment forms.
- CSS additions cover custom properties, Flexbox alignment, specificity, fluid type, named Grid areas, visible focus, cascade layers and a responsive component capstone.
- New level selector, live printed-output panel, clear-output and stop controls. Code printed before an error remains visible. JavaScript/Python still have execution deadlines.
- Existing function-based challenges and deeper lessons now show actual return values for successful checks as well as failures. These are return values, not console-log capture.

## Start learning

Create a local profile, open **Coding Practice**, and choose **Learn from zero**. This is now the default coding screen.

1. Open **Choose language or lesson** and pick Python, JavaScript, HTML, CSS or Java.
2. Choose Beginner, Intermediate or Advanced using **Learning level**. Follow the lessons in order. Nothing is locked, so you can revisit any topic.
3. Read the explanation and why the idea is useful. Study the example and predict its result.
4. Run or preview the example when available. Follow the step-by-step walkthrough and read the common mistake.
5. Answer the quick check. Wrong answers explain the idea without a penalty.
6. Open **Coding workspace**, write your code, and use hints when needed. Python/JavaScript show printed output in a visible console directly under the editor, including output printed before an error. HTML/CSS provide previews and checks.
7. Compare with the explained solution, try the optional stretch task, and write a short reflection in your own words.
8. Use **Next lesson** to continue. Drafts, notes, last-opened lesson and completion save in this browser. Export learning progress from the learning-path panel for a JSON backup. Import is not implemented yet.

## Five paths, 96 lessons

| Path | Lessons | Progression | Feedback |
| --- | ---: | --- | --- |
| Python | 20 | Hello world → addition → variables → arithmetic → strings → comparisons → branches → loops → lists → functions → debugging → shopping-total project | Actual output in bundled Skulpt interpreter |
| JavaScript | 20 | Same beginner-first progression, using JavaScript syntax and arrays | Actual output in isolated browser workers |
| Java | 20 | Same progression, with types, main, methods and Java syntax explained | Knowledge checks, expected output, guided self-review and Main.java download |
| HTML | 18 | First heading → paragraphs → links → lists → images → semantic regions → labeled forms → buttons → tables → learning-page project | Sandboxed page preview and DOM structure checks |
| CSS | 18 | First rule → classes → typography → box model → sizing → Flexbox → Grid → responsive rules → cascade → learning-card project | Sandboxed preview and computed-style checks, including two widths for the responsive lesson |

Every new lesson has an explanation, useful context, example, three-step walkthrough, common mistake, knowledge check with reasoning, practical task, hints, worked solution, stretch activity and saved reflection. Programming examples also have an expected-output reveal.

The existing **JavaScript deep dives** retain 18 lessons with function-based tests, from data handling through algorithms and asynchronous patterns. **Coding challenges** retain 30 problems implemented in both Python and JavaScript, with random selection, three difficulty levels, bookmarks, test history and saved drafts. Random challenges avoid repeats until the selected pool is exhausted, then announce a shuffled review cycle. Sequential beginner lessons intentionally follow a teaching order.

## Java: important distinction

Java lessons do not compile or run inside this frontend. The app explicitly labels Java completion as self-review; it does not report a passing Java test. Download your code as `Main.java`. With a local JDK installed, run:

```sh
javac Main.java
java Main
```

A proper isolated Java execution service belongs to the later backend phase. No simulated compiler or Java-to-JavaScript translation is used here.

## Other app features

- Resume PDF/DOCX extraction and pasted text, with editable extracted details.
- Resume, JD and combined-source interview prompts; learner-selected difficulty; saved question history and review of typed answers.
- Local portfolio editing and QR generation for a real portfolio URL you provide.
- Existing coding challenge bookmarks, optional timer, reset/undo, keyboard shortcuts, progress and JSON export.

## Honest limits

This remains frontend-only. Accounts are local convenience, not production authentication. Progress is browser-local, not synced across devices; clearing browser storage removes it.

Python runs a learning-oriented subset through Skulpt, not full CPython. Arbitrary pip packages, files, network access and interactive input are not provided. JavaScript/Python workers enforce time limits; they are not a hardened public multi-tenant grading service.

Beginner output checks compare the supplied example, not the learner's algorithm or use of every requested technique. HTML/CSS checks cover the listed structures/styles, not a complete accessibility audit. Stretch tasks are exploratory and are not separately graded. HTML/CSS previews block scripts, resources outside the app origin and link navigation. The image lessons render a bundled real desk photograph for the teaching filename study.jpg. Other external image resources are blocked.

Interview generation uses finite curated templates matched to recognized skills, not a connected generative AI service. Resume and interview feedback are heuristics, not verified proficiency or employer ATS results. Portfolio editing does not automatically publish a website.

Photos and interpreter assets are bundled. Fonts use Google Fonts with system fallbacks. Optional speech recognition depends on browser support and may use the browser vendor's service. Media features require HTTPS outside localhost.

## Development

```sh
npm test
npm run lint
npm run build
```

Curriculum: `src/data/foundations.json`, authored through `scripts/build-foundations.py` then `scripts/extend-academy.py`. Run both scripts in that order when rebuilding content. New learning interface: `src/components/coding/FoundationAcademy.jsx`. New program/HTML/CSS checks: `src/lib/foundationRunner.js`. Python runtime integration: `src/lib/pythonRunner.js`.

See `docs/VALIDATION.md` for verification and `docs/BACKEND_HANDOFF.md` for the next phase. Source changes in this release focus on learning; no backend has been added.
