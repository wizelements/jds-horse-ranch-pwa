if (!process.env.VERCEL) {
  console.log("Integration prepare: skipped outside Vercel");
  process.exit(0);
}

const present = (name) => Boolean(process.env[name]?.trim());

const whatsappConfigured =
  present("WHATSAPP_VERIFY_TOKEN") &&
  present("WHATSAPP_APP_SECRET") &&
  present("WHATSAPP_ACCESS_TOKEN") &&
  present("WHATSAPP_PHONE_NUMBER_ID");

if (!whatsappConfigured) {
  throw new Error(
    "WhatsApp Preview variables are incomplete. Configure WHATSAPP_VERIFY_TOKEN, WHATSAPP_APP_SECRET, WHATSAPP_ACCESS_TOKEN, and WHATSAPP_PHONE_NUMBER_ID."
  );
}

console.log("Integration prepare: WHATSAPP_CONFIGURED=true");
