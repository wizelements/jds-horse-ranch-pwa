if (!process.env.VERCEL) {
  console.log("Integration prepare: skipped outside Vercel");
  process.exit(0);
}

const present = (name) => Boolean(process.env[name]?.trim());
const tursoConfigured =
  present("TURSO_DATABASE_URL") && present("TURSO_AUTH_TOKEN");
const whatsappConfigured =
  present("WHATSAPP_VERIFY_TOKEN") &&
  present("WHATSAPP_APP_SECRET") &&
  present("WHATSAPP_ACCESS_TOKEN") &&
  present("WHATSAPP_PHONE_NUMBER_ID");
const squareConfigured =
  present("SQUARE_ACCESS_TOKEN") &&
  present("SQUARE_LOCATION_ID") &&
  present("SQUARE_WEBHOOK_SIGNATURE_KEY");

console.log(`Integration prepare: environment=${process.env.VERCEL_ENV || "unknown"}`);
console.log(`Integration prepare: TURSO_CONFIGURED=${tursoConfigured}`);
console.log(`Integration prepare: WHATSAPP_CONFIGURED=${whatsappConfigured}`);
console.log(`Integration prepare: SQUARE_CONFIGURED=${squareConfigured}`);

if (!tursoConfigured) {
  throw new Error(
    "Turso Preview variables are missing. Configure TURSO_DATABASE_URL and TURSO_AUTH_TOKEN for this Vercel environment."
  );
}

console.log("Integration prepare: TURSO_VARIABLES_PRESENT=true");
