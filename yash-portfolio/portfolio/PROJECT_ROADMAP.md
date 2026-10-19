# Portfolio project roadmap

This portfolio already contains a reasonable breadth of work. The next goal should be to make two or three projects demonstrably deeper, not to add more small tutorial notebooks.

## Priority 1 — RAG Evaluation & Reliability Workbench

**Why:** It extends the loan-advisory project and shows engineering maturity beyond connecting an LLM to a vector database.

Build a repeatable evaluation harness for a curated set of questions grounded in official banking documents.

- Create a versioned dataset of questions, expected evidence passages, and answerability labels.
- Compare chunk sizes, embedding models, dense retrieval, and hybrid retrieval.
- Measure Recall@k / MRR for retrieval, citation correctness, answer faithfulness, latency, and cost where measurable.
- Add unanswerable questions and verify that the system abstains instead of inventing policy.
- Produce a report and a small dashboard comparing experiment runs.
- Add automated tests and a reproducible setup script.

**Portfolio proof:** architecture diagram, evaluation dataset sample, benchmark table, error analysis, demo, and limitations. Publish only results you have actually measured.

## Priority 2 — SeatFlow concurrency hardening

**Why:** It demonstrates backend and database skills that complement the AI-heavy projects.

- Add automated tests where two users attempt to hold/book the same seat simultaneously.
- Use database transactions and appropriate locking/constraints to prevent double booking.
- Implement hold expiry and recovery after payment failure or timeout.
- Add API tests, input validation, structured logging, and a clear error model.
- Document local setup, schema, API endpoints, and a deployment architecture.

**Portfolio proof:** short screen recording of a race-condition test, API documentation, test results, and a simple deployment.

## Priority 3 — EcoSphere AI: measurable product feature

**Why:** A live site is useful, but recruiters need to understand what you personally implemented and which part uses AI.

- Identify one complete workflow and make it work end-to-end before expanding scope.
- If AI is used, define the input/output, data source, validation, and fallback behavior clearly.
- Add a transparent calculation or evidence trail for any carbon-credit or emissions-related result; don't present estimates as certified values.
- Add tests, an architecture diagram, and a short demo.

**Portfolio proof:** clearly label completed features versus planned features and describe your individual contribution.

## What not to prioritize next

- Another basic salary/disease prediction notebook with no meaningful evaluation or deployment.
- A project that lists many frameworks but has no README, tests, demo, or explanation of trade-offs.
- Unsupported performance claims such as “high accuracy” without a reproducible evaluation.

## Suggested project-page checklist

For every featured project, aim to provide:

1. The problem and intended user.
2. Your individual contribution.
3. Architecture and data flow.
4. Key engineering or modeling decisions and alternatives considered.
5. Evaluation results or automated test evidence.
6. Limitations, known failure cases, and future improvements.
7. A working demo or short video where practical.
