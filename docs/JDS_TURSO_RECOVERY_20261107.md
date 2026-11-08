# JDS Horse Ranch — Turso connection recovery and acceptance gates

## Established facts (Nov 7, 2026)
- The user selected Turso as the canonical database for JDS. The intended database name from September setup notes is `jds-horse-ranch`; prior account sign-in was reported on GratitudePC but exact database creation/organization or hostname were not independently certified.
- Vercel production deployment is READY on `https://jdshorseranch.codewithsolo.com`, with `RANCH_PUBLIC_ONLY_MODE=true`. Private admin, payment and booking operations must remain closed.
- Production Vercel configuration has `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` key names. Their live values cannot be read from currently authorized Vercel connector/CLI, and correctness is not confirmed by presence.
- First Turso query for the consented `/api/contact` metric fails before INSERT: `LibsqlError SERVER_ERROR`, provider HTTP 400, stage `count_check`.
- A defensive credential-normalization release tested common outer quotes and whitespace; Vercel logs confirm neither configured value was wrapped and the URL scheme is supported. This did not resolve HTTP 400.
- Public pages and Google sitemap remain healthy. Do not downgrade to unrelated or unverified databases.

## Read-only first, no destructive operations

1. Authenticate the **actual Turso account that owns JDS**, not a guessed organization. Use an authorized Turso CLI session or Turso dashboard; never print access tokens in chat or logs.
2. Run `turso db list`. Confirm whether `jds-horse-ranch` exists in the correct organization before creating anything. A database with that name is an expectation, not a proven existing instance.
3. If it exists, `turso db show jds-horse-ranch --url` and `turso db shell jds-horse-ranch "SELECT 1"` (provider-specific CLI command syntax may vary by version).
4. Compare the **non-secret** actual DB hostname, region, engine and libsql URL to the destination configured in JDS's Vercel project. Do not display auth tokens. A Turso DB created with the newer non-libSQL engine is not automatically compatible with the current `@libsql/client` integration.
5. With exact authorized application URL/token injected in a trusted owner environment, run **`npm run db:health`**. The script executes only `SELECT 1` and read-only `sqlite_master` checks; it prints a sanitized JSON PASS/FAIL result and stage.
6. If `SELECT 1` fails with provider HTTP 400, inspect the account's database endpoint, engine type, database existence and auth-token scope. Don't attribute this to a missing contacts table because the query fails before any table-specific error. Only change endpoint or issue an app-scoped token after verifying what is wrong.
7. When `SELECT 1` passes, identify missing tables; take a database backup before reviewing and applying `npm run db:migrate`. **Never run migrations blindly or on an unknown database**.
8. Reconfigure only JDS's production/preview environments with the verified credentials (encrypted in Vercel), then redeploy. Don't touch Gratog, old `jdshorseranch.com`, or other businesses.
9. Submit **one synthetic** `source=qa-smoke` POST to `/api/contact` with same-origin headers. HTTP 201 alone is insufficient: require an independent authorized readback of the synthetic row and exclude it from business reporting. Confirm consent opt-out sends no event.
10. Keep `RANCH_PUBLIC_ONLY_MODE=true` until secure JD owner login, Square sandbox, signed webhooks, appointment/calendar lifecycle and refunds independently pass. Turso health alone does not certify live payments.

## Independent receipts
- `npm run db:health`: returns `PASS` only after SQL connectivity and required schema reads succeed; otherwise fails with a categorized, redacted diagnostic.
- `npm run db:verify`: verifies local schema migrations against an isolated test database, **not** the remote Turso account.
- GitHub CI: security audit, lint, typecheck, build, acceptance suite and the read-only diagnostic fixture tests.
- Vercel: deployment READY, publicly crawlable marketing pages and sitemap, private routes HTTP 503/noindex.

## Risks
- Live Turso values are presently inaccessible to the attached connectors. Do not infer remote health from configuration-name presence.
- Never create a second `jds-horse-ranch` database or reset existing data until ownership and old records are reconciled.
- Avoid logging raw provider response bodies, URL, JWT, SQL or rider information.
