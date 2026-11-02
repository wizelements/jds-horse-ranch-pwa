// Middleware uses Web Crypto so private rendering is blocked before any customer
// data is loaded. API handlers independently check the session again.
export async function validEdgeSession(token: string | undefined) {
  const secret = process.env.SESSION_TOKEN_SECRET_V2 || "";
  if (secret.length < 32 || !/^[a-f0-9]{128}$/i.test(process.env.ADMIN_PASSWORD_HASH_V2 || "") || (process.env.ADMIN_PASSWORD_SALT_V2 || "").length < 16 || !token || token.length > 1024) return false;
  const parts = token.split(".");
  if (parts.length !== 2 || parts.some(part => !/^[a-zA-Z0-9_-]+$/.test(part))) return false;
  try {
    const decode = (part: string) => Uint8Array.from(atob(part.replace(/-/g,"+").replace(/_/g,"/")), char => char.charCodeAt(0));
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    if (!(await crypto.subtle.verify("HMAC", key, decode(parts[1]), new TextEncoder().encode(parts[0])))) return false;
    const data = JSON.parse(new TextDecoder().decode(decode(parts[0]))), now = Math.floor(Date.now()/1000);
    return data.v === 2 && data.admin === true && typeof data.exp === "number" && Number.isFinite(data.exp) && data.exp > now && data.exp <= now + 86400;
  } catch { return false; }
}
