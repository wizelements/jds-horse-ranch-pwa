/**
 * Turso credentials are opaque secrets. Some provider dashboards copy a value
 * surrounded by shell-style quotes; those quotes are not part of a JWT or URL.
 * Strip at most ONE matching pair, and trim incidental outer whitespace.
 * Never print, hash or embed these values in client-side code or logs.
 */
export function normalizeTursoCredential(raw: string | undefined): string {
  const value = (raw ?? "").trim();
  if (value.length >= 2) {
    const quote = value[0];
    if ((quote === "'" || quote === '"') && value[value.length - 1] === quote) {
      return value.slice(1, -1).trim();
    }
  }
  return value;
}

/** Safe diagnostic flags: deliberately exclude lengths, hostnames and secrets. */
export function tursoCredentialFlags(env: {
  TURSO_DATABASE_URL?: string;
  TURSO_AUTH_TOKEN?: string;
}) {
  const rawUrl = (env.TURSO_DATABASE_URL ?? "").trim();
  const rawToken = (env.TURSO_AUTH_TOKEN ?? "").trim();
  const wrapped = (value: string) => value.length >= 2 &&
    (value[0] === "'" || value[0] === '"') &&
    value[value.length - 1] === value[0];
  const cleanUrl = normalizeTursoCredential(rawUrl);
  return {
    urlOuterQuotes: wrapped(rawUrl),
    tokenOuterQuotes: wrapped(rawToken),
    urlSchemeSupported: /^(libsql|https|http|wss|ws|file):/i.test(cleanUrl),
  };
}
