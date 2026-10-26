# Architecture and decisions

## Application

React and Vite keep the dashboard simple to run and deploy. No router or global state dependency is needed for five workspace views. App.jsx owns the workspace state and actions; page components own their filters and presentation. src/lib/data.js defines deterministic fixtures and shared formatting. matching.js is a framework-independent module shared by the browser and Node API. storage.js handles the versioned browser snapshot and graceful storage failure.

The static deployment is the complete assignment demo. It exposes only fictional data and uses simulated sign-in. The browser bundle is not an authentication boundary. Statuses, notes, shortlists and mock emails stay in localStorage; the current tab's sign-in stays in sessionStorage. There is no cross-device or multi-user sync, and no real email delivery. An introduction is deduplicated per customer/candidate pair, and on-hold customers cannot receive one.

## Optional backend

server/index.js serves the Vite build and a small Express API:

| Endpoint                       | Purpose                                                      |
| ------------------------------ | ------------------------------------------------------------ |
| GET /api/health                | Capability discovery; no key values are returned             |
| POST /api/login                | Validate sample credentials and create an eight-hour session |
| POST /api/logout               | Revoke the session                                           |
| GET /api/customers             | Return the matchmaker's assigned customers                   |
| GET /api/customers/:id/matches | Apply the shared ranking module on the server                |
| POST /api/intro                | Recheck eligibility and request an OpenAI email draft        |

The server uses random HttpOnly, SameSite=Strict cookies, an origin check on writes, a login-attempt limit, request-size limits, and a per-session draft allowance. Sessions and AI draft caching are in memory; restarting the server clears them. These controls protect the optional drafting endpoint but do not turn the public fixture-based app into a production customer system. Workspace edits remain browser-local in both deployment modes.

The OpenAI key is read only by Node. The request contains first names, candidate age/city/career, shared interests, and factual matching reasons. It excludes notes, email, phone, income, caste, and religion. Responses use store: false, a token cap, and an 18-second timeout. API failure leaves the existing editable local draft intact. No call is made without a key. The provider request has not been exercised with a real key in this workspace.

Implementation follows the official [text-generation guide](https://developers.openai.com/api/docs/guides/text) and [Responses API reference](https://developers.openai.com/api/reference/resources/responses/methods/create). The model is configurable with OPENAI_MODEL; the default is gpt-4.1-mini.

## Ranking cost and extension points

For each ranking operation, one vocabulary is fitted over the customer and pool. Text vectors are cached for the operation. Eligibility and scoring are linear in the number of candidates, followed by sorting: approximately O(P x L + P log P), where L is bio length. A larger product could precompute corpus vectors, index eligibility attributes, retrieve a bounded candidate set, and rerank it. Reciprocal checks remain mandatory after retrieval.

The harmonic mean combines directional scores: 2 x forward x reverse / (forward + reverse). Direction matters because value coverage is relative to each person's own values and relocation considers who would move. Female-customer weights are values 24, children 20, location 18, lifestyle 12, career 10, language 4, text 12. Male-customer weights are 24, 20, 16, 12, 10, 6, 12 respectively. Each set sums to 100. High potential starts at 80 and Worth exploring at 65; those are product labels, not calibrated predictions.

Income/height/age constraints for male customers are included because the assessment requests them. A real product should replace these defaults with explicit, individual preferences rather than assume them from gender. Broader gender and orientation support belongs in the data model before serving real clients.

## Verification

No test suite or test files are included, as requested. The production build was checked, and the main browser flow was exercised: login, customer list, profile view, score explanation, shortlist, note creation, mock introduction, journey advancement, and persistence after reload. A mobile preview was reviewed. API checks covered unauthenticated access, login, matching, the no-key response, cross-origin rejection, logout, and session invalidation.
