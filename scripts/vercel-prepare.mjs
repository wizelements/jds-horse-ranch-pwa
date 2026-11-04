if (!process.env.VERCEL) {
  console.log("Deployment preflight: skipped outside Vercel");
  process.exit(0);
}

const environment = process.env.VERCEL_ENV || "preview";
if (process.env.RANCH_TEST_FIXTURES === "true" || process.env.RANCH_ALLOW_LOCAL_DB === "true") throw new Error("Local acceptance fixtures cannot be enabled on Vercel.");
const present = (name) => Boolean(process.env[name]?.trim());

const requiredProduction = [
  "NEXT_PUBLIC_SITE_URL",
  "TURSO_DATABASE_URL",
  "TURSO_AUTH_TOKEN",
  "ADMIN_PASSWORD_HASH_V2",
  "ADMIN_PASSWORD_SALT_V2",
  "SESSION_TOKEN_SECRET_V2",
  "SQUARE_ACCESS_TOKEN",
  "SQUARE_LOCATION_ID",
  "SQUARE_WEBHOOK_SIGNATURE_KEY",
  "SQUARE_WEBHOOK_NOTIFICATION_URL",
];

const missing = requiredProduction.filter((name) => !present(name));
const publicOnly = environment === "production" && process.env.RANCH_PUBLIC_ONLY_MODE === "true";
if (publicOnly && process.env.NEXT_PUBLIC_SITE_URL !== "https://jdshorseranch.codewithsolo.com") {
  throw new Error("Public-only release requires the verified JDS custom-domain origin.");
}

if (environment === "production" && !publicOnly && missing.length) {
  throw new Error(
    `Production deployment is missing required configuration: ${missing.join(", ")}`
  );
}

if (missing.length) {
  console.warn(
    publicOnly
      ? "Public-only deployment: private operations disabled until production credentials are certified. Missing: " + missing.join(", ")
      : "Preview deployment: production integrations are intentionally not required. Missing: " + missing.join(", ")
  );
}

console.log(`Deployment preflight PASS for ${environment}`);
console.log(
  "Database migrations are not run during Vercel builds; run npm run db:migrate as an explicit deployment step."
);
