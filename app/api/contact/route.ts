import { NextRequest, NextResponse } from "next/server";
import { getTurso, logContact } from "@/lib/turso";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SOURCE_PATTERN = /^[a-z0-9_-]{1,48}$/;
const maxBodyBytes = 512;
function reply(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" },
  });
}

export async function POST(req: NextRequest) {
  // This endpoint counts consented clicks, never customers or completed calls.
  // Public-only production allows this *one* isolated, write-only endpoint.
  const sameOrigin = new URL(req.url).origin;
  const origin = req.headers.get("origin");
  const site = req.headers.get("sec-fetch-site");
  if ((origin && origin !== sameOrigin) || site === "cross-site" || (!origin && site !== "same-origin")) {
    return reply({ error: "Invalid origin" }, 403);
  }
  if (!req.headers.get("content-type")?.startsWith("application/json")) {
    return reply({ error: "JSON required" }, 415);
  }
  const length = Number(req.headers.get("content-length") || "0");
  if (!Number.isFinite(length) || length > maxBodyBytes) return reply({ error: "Request too large" }, 413);

  let body: { type?: unknown; source?: unknown };
  try {
    const raw = await req.text();
    if (Buffer.byteLength(raw, "utf8") > maxBodyBytes) return reply({ error: "Request too large" }, 413);
    body = JSON.parse(raw);
  } catch {
    return reply({ error: "Invalid JSON" }, 400);
  }
  if (!body || body.type !== "call" || typeof body.source !== "string" || !SOURCE_PATTERN.test(body.source)) {
    return reply({ error: "Invalid anonymous event" }, 400);
  }
  if (body.source === "qa-smoke") {
    // QA events are explicitly identified as synthetic and excluded from reports.
    // A successful write still certifies real Turso connectivity end-to-end.
  }

  try {
    // Bound write volume per displayed website section without saving IPs or
    // creating per-visitor identifiers. Reject bulk automated event floods.
    const since = new Date(Date.now() - 5 * 60000).toISOString();
    const count = await getTurso().execute({
      sql: "SELECT COUNT(*) AS n FROM contacts WHERE type = 'call' AND source = ? AND created_at >= ?",
      args: [body.source, since],
    });
    if (Number(count.rows[0]?.n || 0) >= 60) return reply({ error: "Rate limited" }, 429);
    await logContact({ type: "call", source: body.source });
    return reply({ recorded: true }, 201);
  } catch (cause) {
    // Classify production failures without logging tokens, URLs, SQL, IPs or raw errors.
    // This makes database availability and schema problems visible in Vercel logs.
    const raw = cause instanceof Error ? cause.message : "";
    const kind = !process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN
      ? "configuration_missing"
      : /no such table|no such column/i.test(raw) ? "schema_missing"
      : /unauthori[sz]ed|forbidden|invalid.*token|auth_error|\b401\b|\b403\b/i.test(raw) ? "database_authentication"
      : /connection|timeout|network|fetch failed|econn|enotfound/i.test(raw) ? "database_transport"
      : "database_operation_failed";
    const code = cause && typeof cause === "object" && "code" in cause
      ? String(cause.code).replace(/[^A-Z0-9_-]/gi, "").slice(0, 48) : "none";
    console.error("Anonymous call-tap metrics unavailable", { kind, code, name: cause instanceof Error ? cause.name.slice(0, 32) : "unknown" });
    return reply({ error: "Metrics temporarily unavailable" }, 503);
  }
}

export async function GET() { return reply({ error: "Use POST" }, 405); }
export async function OPTIONS() { return reply({ error: "Use POST" }, 405); }
