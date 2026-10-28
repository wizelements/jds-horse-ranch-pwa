// Run with: vercel env run -e production -- node scripts/production-readiness.mjs
// Safe by design: never emits environment variable values or authentication tokens.
const required = [
  "NEXT_PUBLIC_SITE_URL",
  "TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN",
  "ADMIN_PASSWORD_HASH_V2", "ADMIN_PASSWORD_SALT_V2", "SESSION_TOKEN_SECRET_V2",
"SQUARE_ACCESS_TOKEN", "SQUARE_LOCATION_ID",
  "SQUARE_WEBHOOK_SIGNATURE_KEY", "SQUARE_WEBHOOK_NOTIFICATION_URL",
];

const has = (key) => Boolean(process.env[key]?.trim());
const missing = required.filter((name) => !has(name));
const invalid = [];
const check = (key, predicate, reason) => {
  if (has(key) && !predicate(process.env[key].trim())) invalid.push(`${key}: ${reason}`);
};
check("NEXT_PUBLIC_SITE_URL", (value) => {
  try { const url=new URL(value); return url.protocol==="https:" && !url.username && !url.password && url.pathname==="/" && !url.search && !url.hash; }
  catch { return false; }
}, "must be a HTTPS site origin, without paths or credentials");
check("TURSO_DATABASE_URL", (value) => /^libsql:\/\/[a-z0-9.-]+(?:\/)?$/i.test(value),
  "must be a valid libsql:// database host");
check("ADMIN_PASSWORD_HASH_V2", (value) => /^[a-f\d]{128}$/i.test(value),
  "must be a 64-byte scrypt password hash (hex)");
check("ADMIN_PASSWORD_SALT_V2", (value) => value.length >= 16,
  "must be a strong password salt");
check("SESSION_TOKEN_SECRET_V2", (value) => value.length >= 32,
  "must be at least 32 characters");
check("SQUARE_WEBHOOK_NOTIFICATION_URL", (value) => {
  try { const url=new URL(value); return url.protocol==="https:" &&
    url.pathname==="/api/square/webhook" && !url.search && !url.hash; }
  catch { return false; }
}, "must be an HTTPS public Square webhook URL ending /api/square/webhook");
  "SQUARE_ACCESS_TOKEN","SQUARE_WEBHOOK_SIGNATURE_KEY"]) {
  check(key, (value)=>value.length>=16, "appears too short");
}
console.log("JD's Horse Ranch — production configuration audit (values withheld)");
console.log(`Required configuration fields: ${required.length}`);
console.log(`Present: ${required.length - missing.length}`);
console.log(`Missing: ${missing.length}`);
if (missing.length) console.log("Missing keys:\n"+missing.map(name=>"  - "+name).join("\n"));
if (invalid.length) console.log("Invalid formats:\n"+invalid.map(line=>"  - "+line).join("\n"));
if (missing.length || invalid.length) {
  console.error("NOT READY: Correct production configuration before attempting release.");
  process.exitCode=1;
} else {
  console.log("CONFIGURATION PRESENT: Values have acceptable formats.");
  console.log("NOT YET CERTIFIED: Still test Turso connectivity, signed Square webhooks, paid checkout, refunds, and manual customer notification before release.");
}
