# The Date Crew — Matchmaker

A working matchmaking dashboard MVP with 12 assigned customers, 240 fictional pool profiles, explainable recommendations, shortlists, private notes, journey tracking and mock introductions.

**Demo:** https://tdc-matchmaker-utk2602.zippyboot.chatgpt.site

**Repository:** https://github.com/utk2602/TDC_assignment

**Sample login:** priya / Tdc@2026

```sh
cd matchmaker
npm ci
npm run dev
```

- [Setup and deployment](matchmaker/README.md)
- [Matching algorithm: AI, design and assumptions](matchmaker/docs/matching-approach.md)
- [Product research and sources](matchmaker/docs/research.md)
- [Architecture and trade-offs](matchmaker/docs/architecture.md)
- [Submission email draft](matchmaker/docs/submission.md)

The hosted demo uses a TF-IDF similarity recommender and browser-local storage. Optional OpenAI email drafting runs through the included Node API when a server key is configured. Sign-in and verification in the static demo are simulated. No real email is sent.

Built in focused commits. No test files are included, as requested; the build and main browser/API flows were checked directly.
