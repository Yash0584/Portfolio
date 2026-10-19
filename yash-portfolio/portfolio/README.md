# Yash Khadagta — Portfolio

Responsive personal portfolio built with semantic HTML, CSS, vanilla JavaScript, and a dependency-free Node.js backend. No `npm install` is required.

## Features

- Responsive layout with mobile navigation and project-category filters
- Content loaded from `data/portfolio.json`
- Certifications and achievements separated to avoid duplicate entries
- Résumé download and GitHub/LinkedIn links
- Contact form backed by `POST /api/contact`
- Input validation, honeypot, request-size limit, and basic per-IP rate limiting
- Optional protected inbox endpoint (`GET /api/messages`)
- Health check at `GET /api/health`

## Run locally

Requirements: Node.js 18 or later.

```bash
cd portfolio
npm start
```

Open http://localhost:3000. The project intentionally has no runtime dependencies.

## Update portfolio content

Edit `data/portfolio.json`. Keep the following distinctions:

- **Certifications**: formal credentials and completed courses.
- **Achievements**: awards, hackathon results, finalist status, and presentations.

For each project, set `title`, `category`, `desc`, `tags`, `url`, and optionally `linkLabel` and `featured`. Use only links that are live and publicly accessible. If you have a demo and a source repository, consider adding a separate `demoUrl` field and a second link in the frontend.

The existing profile image is `public/images/profile.jpg`; the résumé is `public/Yash_Khadagta_Resume.pdf`. Replace these files to update them while preserving their paths.

## Contact inbox

Messages are written to `data/messages.json`. For local testing, this is enough. On cloud hosts with an ephemeral filesystem, messages may disappear after restarts or redeploys; configure a persistent disk or replace the storage layer with a managed database before relying on the inbox for production contact messages.

To enable the protected inbox endpoint, set a long random `ADMIN_TOKEN` environment variable:

```bash
# Linux/macOS
ADMIN_TOKEN='replace-with-a-long-random-secret' npm start

# PowerShell
$env:ADMIN_TOKEN='replace-with-a-long-random-secret'; npm start
```

Then request `GET /api/messages` with `Authorization: Bearer <ADMIN_TOKEN>`. Do not expose the token in frontend JavaScript or commit it to Git. This endpoint returns personal contact details, so keep the token private.

## Deploy

Deploy the `portfolio` directory to a Node.js host such as Render, Railway, Fly.io, or a VPS. Set the start command to `npm start` and ensure the host uses Node 18+. If you need messages to survive redeploys, attach a persistent disk and configure the message storage path accordingly. Set a strong `ADMIN_TOKEN` in the host's environment settings if inbox access is needed.

## Recommended next improvements

1. Add measurable evaluation results to the Loan Advisory Chatbot (retrieval quality, groundedness, latency, and failure cases) if you have measured them.
2. Add a short demo video or screenshots for the Loan Advisory Chatbot and Phish-Proof, plus a clear architecture diagram.
3. For EcoSphere AI, document your exact individual contribution and the current product status; don't imply features are complete if they're only planned.
4. For SeatFlow, add automated tests that demonstrate two users competing for the same seat, hold expiration, and payment-failure rollback.
5. Add project-specific README files with setup steps, architecture, sample outputs, limitations, and screenshots.
6. Before production use, move contact messages to a persistent database or email provider and add a real email notification workflow. The current form stores messages but does not send email notifications.
