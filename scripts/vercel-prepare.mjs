if (!process.env.VERCEL) {
  console.log("Deployment preflight: skipped outside Vercel");
  process.exit(0);
}

const environment = process.env.VERCEL_ENV || "preview";
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
  "CRON_SECRET",
];

const missing = requiredProduction.filter((name) => !present(name));

if (environment === "production" && missing.length) {
  throw new Error(
    `Production deployment is missing required configuration: ${missing.join(", ")}`
  );
}

if (missing.length) {
  console.warn(
    `Preview deployment: production integrations are intentionally not required. Missing: ${missing.join(", ")}`
  );
}

console.log(`Deployment preflight PASS for ${environment}`);
console.log(
  "Database migrations are not run during Vercel builds; run npm run db:migrate as an explicit deployment step."
);
