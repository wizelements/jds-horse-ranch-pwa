import { RanchError } from "@/lib/errors";

export function servicePatch(body: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const key of ["name", "description", "price_detail", "age_requirement"]) {
    if (body[key] !== undefined) { if (typeof body[key] !== "string" || String(body[key]).length > (key === "description" ? 2000 : 500)) throw new RanchError("Check the experience text."); out[key] = String(body[key]).trim(); }
  }
  if (out.name === "") throw new RanchError("The experience needs a name.");
  for (const key of ["price_min", "price_max", "duration_minutes", "display_order"]) {
    if (body[key] === undefined) continue;
    const n = Number(body[key]);
    if (!Number.isFinite(n) || n < 0 || n > 10000 || ((key === "duration_minutes" || key === "display_order") && !Number.isInteger(n))) throw new RanchError("Check the experience price, duration, and display order.");
    if (key === "duration_minutes" && (n < 15 || n > 480)) throw new RanchError("Use a duration between 15 and 480 minutes.");
    out[key] = n;
  }
  if (out.price_min !== undefined && out.price_max !== undefined && Number(out.price_max) < Number(out.price_min)) throw new RanchError("The maximum price must be at least the starting price.");
  if (body.active !== undefined) { if (typeof body.active !== "boolean") throw new RanchError("Invalid visibility setting."); out.active = body.active; }
  if (!Object.keys(out).length) throw new RanchError("No experience changes were supplied.");
  return out;
}
export function publicContentPatch(body: Record<string, unknown>, kind: "photo" | "review") {
  const out: Record<string, unknown> = {};
  const keys = kind === "photo" ? ["title", "description"] : ["customer_name", "text"];
  for (const key of keys) if (body[key] !== undefined) {
    if (typeof body[key] !== "string" || String(body[key]).length > 4000) throw new RanchError("Check the content text.");
    out[key] = String(body[key]).trim();
    if ((key === "customer_name" || key === "text") && !out[key]) throw new RanchError("The review needs a name and text.");
  }
  if (body.active !== undefined) { if (typeof body.active !== "boolean") throw new RanchError("Invalid visibility."); out.active = body.active; }
  if (body.display_order !== undefined) { const n = Number(body.display_order); if (!Number.isInteger(n) || n < 0 || n > 10000) throw new RanchError("Invalid display order."); out.display_order = n; }
  if (kind === "review" && body.rating !== undefined) { const n = Number(body.rating); if (!Number.isInteger(n) || n < 1 || n > 5) throw new RanchError("Rating must be between 1 and 5."); out.rating = n; }
  if (!Object.keys(out).length) throw new RanchError("No changes supplied.");
  return out;
}
