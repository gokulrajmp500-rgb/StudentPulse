# StudentPulse

StudentPulse is a responsive academic-support dashboard prototype for recording student information, monitoring academic indicators, and coordinating follow-up work. It is built with React 19, TypeScript, Vite 8, Node.js 22+, and SQLite.

The web app includes a 3D animated logo, dashboard analytics, student and attendance workflows, configurable early-warning alerts, follow-up tasks, and an optional Google Gemini-powered support coach.

> **Prototype notice:** StudentPulse is not a production student-information system. It has no institutional SIS/LMS integration, password reset, database migration tooling, or class-scoped teacher authorization. Use fictional data only until the security, privacy, authorization, storage, and operational requirements described below have been addressed.

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Features

- Student records with search, filters, pagination, archive, and validated CSV import/export.
- Attendance, assignments, assessments, and marks with bulk import validation.
- Evidence-based early-warning alerts, configurable thresholds, and follow-up tasks.
- Dashboard summaries, class-filtered analytics, reports, and a persistent academic calendar.
- Optional Gemini support coach, called by the server rather than directly from browser code.
- Responsive, installable web app with reduced-motion support.

## Technology and project layout

- **Frontend:** React, TypeScript, Vite, and Three.js.
- **API and storage:** Node.js HTTP API and SQLite.
- **AI coach:** Google Gemini API, configured and called on the server.
- `src/` contains the web app; `server/` contains the API, database, and tests; `api/` contains the serverless API entry point.

The repository is scoped to the React web app. The unused Flutter starter template in this working folder is not part of the published project.

## Run locally

Install [Node.js 22 or later](https://nodejs.org/) and enable Corepack, then install the locked dependencies and run the API tests:

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm test
```

Start the development app and its same-origin SQLite API:

```sh
corepack pnpm dev
```

Open the Vite URL shown in the terminal. The default port is `8443`; if it is already in use, Vite automatically tries the next available port and prints the URL to open. The default local development account is:

- Email: `teacher@studentpulse.local`
- Password: `StudentPulseDemo2026!`

This fictional demo account is for local development only. Its password is stored as a salted scrypt hash. Override the initial account before the first database is created with `STUDENTPULSE_DEMO_EMAIL` and `STUDENTPULSE_DEMO_PASSWORD`.

Run a production build and serve the app and API from one origin:

```sh
corepack pnpm build
corepack pnpm start
```

The server defaults to port `4173`. Set `PORT` and `HOST` to change its listener. SQLite data is stored in `data/studentpulse.sqlite` by default and is excluded from source control. Set `STUDENTPULSE_DB_PATH` to move it or use `:memory:` for isolated tests. Back up the database file before upgrades or reset operations.

When production starts with an empty database, it requires `STUDENTPULSE_ADMIN_EMAIL` and `STUDENTPULSE_ADMIN_PASSWORD` to be configured in the deployment environment. The production password must be at least 16 characters; the server will not create the published demo account in production. Keep these values private and provision a unique password. Existing databases are not modified by this initial-account check, but production startup rejects a database that still contains the published local demo account; rename or remove that account before deployment.

The included Vercel function uses a temporary `/tmp` SQLite path. Serverless temporary storage is not durable, so that configuration is suitable only for evaluation with disposable data. Use a persistent database and verify backups, retention, and deployment security before any real use.

## Generative AI support coach

The coach uses the Google Gemini API from the server. To create and use a Gemini key locally:

1. Sign in to [Google AI Studio](https://aistudio.google.com/app/apikey) and create a Gemini API key.
2. In VS Code, open **Terminal → New Terminal** and choose PowerShell.
3. From the project folder, copy the example environment file and open the private file:

   ```powershell
   Copy-Item .env.example .env
   notepad .env
   ```

4. In Notepad, replace the blank value after `GEMINI_API_KEY=` with your API key, save the file, and close Notepad. Do not add quotes.
5. Stop any already-running StudentPulse dev server with **Ctrl+C**, then run:

   ```powershell
   corepack pnpm dev
   ```

6. Open the exact URL printed by Vite, sign in, and send a message in **Ask StudentPulse AI**. The server reads `.env` when it starts.

The default model is `gemini-2.5-flash`; optionally set `GEMINI_MODEL` in the same PowerShell terminal before starting the app to select another model supported by your Gemini API key. This environment variable applies only to that terminal session. If the chat reports HTTP 403, check that the key and model are correct and available to your Google AI Studio project. HTTP 429 can mean that the project's API quota or rate limit has been reached.

The `.env` file is excluded from Git. Never commit it, paste the API key into chat, or put the key in frontend code. If `.env.example` is unavailable, create a file named `.env` in the project folder containing `GEMINI_API_KEY=your_key`. If the chat says Gemini is not configured, make sure the file is named exactly `.env` (not `.env.txt`), is in the same folder as `package.json`, and restart the dev server. Use the exact URL Vite prints; if the port was busy, it may be `8444` or another port. Network errors say to check server internet access and `generativelanguage.googleapis.com`; HTTP errors include Gemini's response and specific key, model, or quota guidance.

Never add the API key to client-side code, paste it into chat, or commit it to the repository. The coach requires an authenticated administrator session. It sends the current prompt and up to eight recent conversation messages to Google Gemini. If exactly one student is identified, the server adds only that student's name, ID, class, attendance, assignment and assessment aggregates, and review thresholds. Ambiguous student references are clarified without calling Gemini. Health and related sensitive-topic questions are handled locally; matching sensitive-topic messages in conversation history are excluded from provider requests. The prompt and any included academic context are disclosed to Google for processing. Do not enter sensitive personal or health information, and review Google's current data handling terms before using real student information. The coach is advisory, can make mistakes, and must not be used to diagnose students or make automated decisions.

The service applies an in-memory limit of ten provider requests per user per minute per server process. It is not a deployment-wide quota. If the key is missing or the provider is unavailable, the coach shows an explicit error and allows the request to be retried.

## Install and offline access

The production web app is installable on supported phones, tablets, and computers. Deploy it to an HTTPS host, open its URL once while connected, then use the browser's **Install app** or **Add to Home Screen** option. The app shell and downloaded code are cached for reopening without a connection. Sign-in, student records, and changes still require the server; the app does not store academic records for offline use. A shareable public URL requires deploying this server and its database to an internet-accessible host.

## Working workflows

- Hashed-password sign-in, HTTP-only same-site sessions, server-side administrator checks, and audit entries for important changes. Teacher accounts cannot read academic records until class-scoped authorization is implemented.
- Student create, edit, archive, search, department/priority filters, sorting, and pagination.
- CSV student import with row-level validation, duplicate-ID detection, preview, and all-or-nothing import; downloadable template and authorized CSV export.
- Bulk attendance by class/date with present, absent, and late states. Attendance rates use configured college working days; students without register entries are shown as unrecorded rather than 0%.
- Bulk attendance CSV import with class membership, configured working date, duplicate, and status validation before transactional save.
- Assignment creation and per-student submission status; blank/unconfirmed work is not marked submitted.
- Assessment and marks entry with maximum-score validation; blank marks remain unrecorded. Bulk marks CSV validates student/class membership, duplicate entries, and scores before transactional import.
- Rule-based alerts with evidence, configurable thresholds, status filters, acknowledgement, under-review, and reason-required dismissal.
- Follow-up task creation, notes, due dates, and completion.
- Database-derived dashboard summary, class-filtered analytics, CSV report download, and notifications derived from alerts, assignments, and follow-ups with persisted read state.
- Calendar dates, weekdays, and holidays persist in SQLite and recalculate attendance rates.

## Prototype limits

The default records are fictional demo data. Attendance, marks, assignments, users, and tasks persist in SQLite, but there is no institutional SIS/LMS connection, password reset, or migration tooling yet. Only the initial administrator is seeded; account creation and class-scoped teacher authorization need institution policy and workflows before real student data is used.

The generative support coach uses authorized academic aggregates and an external AI service as described above. The prompt and selected academic context are sent to Google for processing. Shared 3D accents and page/card motion honor the operating system's reduced-motion preference. CSV export is implemented; Excel/PDF generation, email/SMS reminders, and real email notifications require integrations and credentials. HTTPS termination, durable storage, backups, a retention policy, monitoring, deployment-wide rate limiting, and a security review are required before deployment with real student information.

## License

StudentPulse is distributed under the [MIT License](LICENSE).
