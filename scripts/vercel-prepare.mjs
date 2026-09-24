import { createClient } from "@libsql/client";

if (!process.env.VERCEL) {
  console.log("Integration prepare: skipped outside Vercel");
  process.exit(0);
}

const present = (name) => Boolean(process.env[name]?.trim());
const tursoConfigured =
  present("TURSO_DATABASE_URL") && present("TURSO_AUTH_TOKEN");

if (!tursoConfigured) {
  throw new Error(
    "Turso is required for Vercel deployments. Configure TURSO_DATABASE_URL and TURSO_AUTH_TOKEN for this environment."
  );
}

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

try {
  await db.execute("SELECT 1");
  console.log("Integration prepare: TURSO_REACHABLE=true");
} finally {
  db.close();
}
