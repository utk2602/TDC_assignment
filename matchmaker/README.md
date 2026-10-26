# The Date Crew — Matchmaker

A small internal workspace for the people behind the introductions.

- 12 assigned customers, with search, city and journey filters.
- Full biodata, including Indian family and lifestyle context.
- 240 fictional pool profiles, split evenly by gender.
- Reciprocal eligibility checks and explainable compatibility ranking.
- Shortlists, persistent call notes, journey tracking and a mock email outbox.
- An optional Node/OpenAI service for personalised introduction drafts.

## Run locally

Use Node 22 or newer.

```sh
cd matchmaker
npm ci
npm run dev
```

Open the URL Vite prints, usually http://127.0.0.1:5173.

Sample login: **priya** / **Tdc@2026**. The static demo simulates sign-in and stores changes in this browser. Use the sample credentials only; all profile information is fictional and verification badges are simulated.

## Optional Node and OpenAI mode

```sh
npm run build
npm start
```

Open http://localhost:3001. Node serves the dashboard and protects the drafting API with a session cookie. For Vite hot reload, run npm start in another terminal; Vite proxies /api to port 3001.

To enable OpenAI drafting, copy .env.example to .env, supply your own OPENAI_API_KEY, and restart Node. OPENAI_MODEL defaults to gpt-4.1-mini. The key stays on the server. Once configured, the introduction composer offers **Polish with AI**. Without a key, the full matching experience still works with TF-IDF similarity and editable local introduction drafts.

## Deployment

The Sites deployment serves the Vite static build. It includes the similarity recommender and all browser-local workflows; it does not run the optional Express service.

For the full Node service on Render or Railway, set the root directory to matchmaker, build with npm ci && npm run build, and start with npm start. Set NODE_ENV=production and optionally OPENAI_API_KEY and OPENAI_MODEL. The server respects the host's PORT value. For Netlify or Vercel static hosting, build with npm run build and publish dist.

This is an assignment demo, not a place to enter real client data. A real rollout needs individual accounts, protected database-backed APIs, a consent and verification process, and real delivery infrastructure.

## Read the approach

- [Three-paragraph matching write-up](docs/matching-approach.md)
- [Dating and matrimonial product research](docs/research.md)
- [Architecture and trade-offs](docs/architecture.md)

No test files are included, as requested. Validation consists of the production build and direct browser/API checks.
