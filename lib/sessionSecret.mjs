const INSECURE_SESSION_SECRETS = new Set([
  "dev-secret-change-in-prod",
  "temporary-dev-secret-key-change-in-production",
]);

/**
 * Admin sessions stay disabled unless the operator set a non-default secret.
 * The known development fallbacks are rejected so a missing env var cannot
 * silently keep a public signing key.
 */
export function isUsableSessionSecret(value) {
  const secret = (value ?? "").trim();
  if (secret.length < 32) return false;
  return !INSECURE_SESSION_SECRETS.has(secret);
}
