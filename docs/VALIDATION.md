# v13 validation

- Lint and production build pass.
- Chromium checks confirm separate reading/coding screens, editor width over 1200px at a 1440px viewport, editor height at least 420px, hidden workspace sidebar, real Python output, retained code and output when returning to explanation, language switching, HTML preview and saved drafts after reload.
- Mobile checks at 390px confirm no page overflow in the editor or when an 800px HTML preview is selected. Desktop and mobile screens were visually inspected.
- Course content and execution logic are unchanged. Prior automated suite results below are retained from v12, not represented as newly rerun.

## Previous v12 validation


- Production build and lint pass. All 130 existing automated tests pass.
- Chromium production checks cover desktop (1440px) and mobile (390px), sign-up, sign-in, dashboard navigation, all three curriculum-preview filters, actual Python example output, hover styling and reduced-motion settings.
- Checked the rendered landing page, curriculum, account forms and dashboard. Fixed mobile photo-panel overflow. No JavaScript page errors occurred in the production smoke flow.
- Bundled Inter and Oswald font files load locally. Existing photos remain bundled.
- Existing course execution and interview logic are unchanged in this visual update. The detailed v11 results below describe the previous release's broader lesson validation; they were not all rerun for v12.
- Vite reports a non-blocking large-workspace-chunk warning. Validation uses Chromium, not a cross-browser certification.

## Previous v11 validation


- 130 automated tests pass, including new intermediate/advanced JavaScript and Python example and solution outputs, wrong-output rejection, preservation of output before an error, existing coding challenges and interview-history behavior.
- Lint passes without findings; production build passes. Vite still reports a non-blocking large-workspace-chunk warning.
- 76 executable/checkable lesson solutions pass in Chromium: 20 Python, 20 JavaScript, 18 HTML and 18 CSS. Two additional checks confirm incorrect HTML/CSS are rejected.
- CSS checks cover narrow/wide viewport behavior, computed styles, grid layout and focused controls. Frames wait for their intended viewport width before assessing viewport-relative values.
- All five paths expose four intermediate and four advanced lessons through the new level selector.
- Browser checks cover saved drafts and progress, actual Python output, JavaScript timeout, output printed before a thrown error, HTML/CSS previews, Java self-review, and access to the existing challenges.
- Real photographs were downloaded, decoded and visually inspected. The teaching image loads inside the HTML preview. Photo sources are recorded in PHOTO_CREDITS.md.
- Responsive checks use a 390px viewport. Wide page previews scroll within their panel without expanding the page.
- Final production-build smoke checks repeat the main learning flow, photo rendering and output-console behavior.

Java remains source study and self-review, not compiler-verified execution. No backend is included. The browser checks use Chromium, not a cross-browser certification. Output comparisons do not prove an algorithm is correct for every input; HTML/CSS property checks do not constitute a full accessibility audit.
