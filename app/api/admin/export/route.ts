import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";
import { getTurso } from "@/lib/turso";

function cell(value: unknown) {
  let text = String(value ?? "");
  if (/^[\s]*[=+@-]/.test(text)) text = "'" + text;
  return `"${text.replace(/"/g, '""')}"`;
}
export async function GET(req: NextRequest) {
  if (!(await verifyAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const type = req.nextUrl.searchParams.get("type");
  const columns = type === "reservations" ? ["id","customer_name","customer_phone","email","service_requested","rider_count","rider_details","experience","qualification_notes","status","approved_start_at","approved_end_at","approved_amount_cents","paid_at","refunded_amount_cents","created_at"] : type === "contacts" ? ["id","type","source","created_at"] : null;
  if (!columns) return NextResponse.json({ error: "Unknown export type" }, { status: 400 });
  try {
    const table = type === "reservations" ? "booking_inquiries" : "contacts";
    const result = await getTurso().execute(`SELECT ${columns.join(",")} FROM ${table} ORDER BY created_at DESC LIMIT 20001`);
    if (result.rows.length > 20000) return NextResponse.json({ error: "This export exceeds 20,000 rows. Arrange a full database backup for the complete history." }, { status: 413 });
    const csv = "\uFEFF" + [columns.map(cell).join(","), ...result.rows.map(row => columns.map(key => cell(row[key])).join(","))].join("\r\n");
    return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename=ranch-${type}-${new Date().toISOString().slice(0,10)}.csv`, "Cache-Control": "private, no-store" } });
  } catch { return NextResponse.json({ error: "Records could not be exported. No records were changed." }, { status: 503 }); }
}
