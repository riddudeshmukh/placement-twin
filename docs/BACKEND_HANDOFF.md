# Next phase: backend (not implemented)

The frontend is self-contained. Preserve its contracts while replacing browser-local persistence incrementally.

## Existing boundaries

- Local account/profile handling and resume parsing feed the main workspace. Extracted skills are mentions, not verified proficiency.
- Interview setup uses source text, selected level and session length. `src/lib/interviewQuestionBank.js` creates grounded prompts and tracks displayed question IDs. Save answers, feedback and source/difficulty alongside sessions.
- Coding practice uses problem IDs, language, level, code drafts, bookmarks, seen-question pools, solved items and recent attempts. State currently lives under `placementtwin_practice_v9_<email>` in localStorage.
- Guided lessons have their own per-account completion, knowledge-check and draft state. Preserve existing lesson IDs for migration.
- Browser workers execute coding tests; Python runs a bundled educational interpreter.

## Proposed work

1. Add real authentication and server-owned account IDs. Do not trust browser profile records as authentication or import stored browser passwords.
2. Add authenticated profile, resume, interview-session and practice-progress APIs with ownership checks. Offer an explicit migration/import of local progress.
3. Store resume/JD sources securely with deletion controls. If adding model-generated questions, retain evidence/source labels, structured validation, duplicate detection and honest fallback behavior.
4. Add an isolated execution service before expanding language support. Enforce CPU, memory, network, filesystem and output limits; never execute learner code in the application server process.
5. Persist question history and progress server-side for cross-device continuity. Add integration tests for authorization and concurrent updates.

This document proposes boundaries; no endpoints, database, hosted grading or generative AI integrations are included in v9.

## v10 beginner academy

`placementtwin_foundations_v10_<email>` stores language, last lesson per language, and entries keyed by stable lesson ID. Entries contain code drafts, quiz completion, exercise result/self-review, completion date and reflection notes. Keep Java self-review distinct from verified execution when migrating. Old challenge and deep-dive storage keys remain intact.

Beginner programs run as complete scripts with captured output. HTML checks inspect DOM structure; CSS checks read computed styles in isolated frames at specified widths. The new Java course deliberately has no run endpoint. Add isolated Java compilation/execution in the next phase; retain honest execution status and do not convert prior self-review into a verified pass.

## v11 continuity

The academy retains the v10 localStorage key and existing lesson IDs; it adds 40 stable IDs containing `-i-` or `-a-`. Preserve these IDs when migrating progress. Console output is transient and is not saved as a practice result. The worker bridge now forwards bounded output messages before the final result, and the UI distinguishes stdout/returned values from Java's expected output. The server execution service should preserve that distinction and stream bounded stdout/stderr while enforcing resource limits.
