import "server-only";
import { randomUUID } from "crypto";
import type { Transaction } from "@libsql/client";
import { getTurso } from "@/lib/turso";
import { getInquiry, getInquiryBySquareOrderId, recordBookingEvent, updateInquiry, type BookingInquiry } from "@/lib/bookingStore";
import { checkExternalAvailability } from "@/lib/calendars";
import { RanchError } from "@/lib/errors";
import { createSquarePaymentLink, createSquareRefund, deleteSquarePaymentLink, retrieveOrderPayments,
  retrieveSquarePayment, retrieveSquareRefund, squareConfiguration, type SquarePayment, type SquareRefund } from "@/lib/square";

const nowIso = () => new Date().toISOString();
const clean = (v: unknown, max = 1200) => String(v || "").trim().slice(0, max);
const uuid = (v: unknown) => /^[a-f0-9-]{36}$/i.test(String(v));
async function event(tx: Pick<Transaction, "execute">, id: string, type: string, actor: string, metadata: unknown = {}) {
  await tx.execute({ sql: "INSERT INTO booking_events (id,inquiry_id,event_type,actor,metadata,created_at) VALUES (?,?,?,?,?,?)", args: [randomUUID(), id, type, actor, JSON.stringify(metadata), nowIso()] });
}

export async function withBookingLock<T>(id: string, operation: () => Promise<T>): Promise<T> {
  const token = randomUUID(), now = nowIso();
  const result = await getTurso().execute({
    sql: "UPDATE booking_inquiries SET operation_token=?, operation_expires_at=? WHERE id=? AND (operation_token IS NULL OR operation_expires_at < ?)",
    args: [token, new Date(Date.now() + 120000).toISOString(), id, now],
  });
  if (!result.rowsAffected) throw new RanchError("This reservation is busy or no longer exists. Refresh before trying again.", 409);
  try { return await operation(); }
  finally { await getTurso().execute({ sql: "UPDATE booking_inquiries SET operation_token=NULL,operation_expires_at=NULL WHERE id=? AND operation_token=?", args: [id, token] }); }
}

function appointment(body: Record<string, unknown>) {
  const raw = String(body.approvedStartAt || ""), start = new Date(raw);
  const duration = Number(body.durationMinutes || 60);
  if (!/(Z|[+-]\d\d:\d\d)$/.test(raw) || !Number.isFinite(start.getTime()) || start.getTime() <= Date.now() || start.getTime() > Date.now() + 366 * 86400000) throw new RanchError("Choose a future appointment within the next year.");
  if (!Number.isInteger(duration) || duration < 15 || duration > 480) throw new RanchError("Choose a duration between 15 and 480 minutes.");
  return { start: start.toISOString(), end: new Date(start.getTime() + duration * 60000).toISOString() };
}
async function assertSlotFree(tx: Transaction, id: string, start: string, end: string) {
  // A single group at a time is the conservative default until JD certifies capacity.
  const buffer = Math.min(120, Math.max(0, Number(process.env.RANCH_BOOKING_BUFFER_MINUTES || 15)));
  const from = new Date(Date.parse(start) - buffer * 60000).toISOString();
  const to = new Date(Date.parse(end) + buffer * 60000).toISOString();
  const rides = await tx.execute({
    sql: `SELECT id FROM booking_inquiries WHERE id != ?
      AND (status='BOOKED' OR (status='AWAITING_PAYMENT' AND (hold_expires_at IS NULL OR hold_expires_at > ?)))
      AND julianday(approved_start_at) < julianday(?)
      AND julianday(COALESCE(approved_end_at,datetime(approved_start_at,'+60 minutes'))) > julianday(?) LIMIT 1`,
    args: [id, nowIso(), to, from],
  });
  const blocks = await tx.execute({ sql: "SELECT id FROM calendar_blocks WHERE julianday(starts_at) < julianday(?) AND julianday(ends_at) > julianday(?) LIMIT 1", args: [to, from] });
  if (rides.rows.length || blocks.rows.length) throw new RanchError("This time overlaps a ride, payment hold, or blocked calendar time. Choose another time.", 409);
}

async function attachPaymentLink(inquiry: BookingInquiry) {
  if (!inquiry.approved_amount_cents || !inquiry.approval_key) throw new RanchError("Appointment approval is incomplete.", 409);
  const link = await createSquarePaymentLink(inquiry, inquiry.approved_amount_cents);
  const result = await getTurso().execute({
    sql: "UPDATE booking_inquiries SET square_payment_link_id=?,square_order_id=?,square_payment_url=?,updated_at=? WHERE id=? AND status='AWAITING_PAYMENT' AND approval_key=?",
    args: [link.id, link.order_id, link.url, nowIso(), inquiry.id, inquiry.approval_key],
  });
  if (!result.rowsAffected) throw new RanchError("The reservation changed while payment was being created. Review it before sharing checkout.", 409);
  await recordBookingEvent({ inquiryId: inquiry.id, eventType: "payment_link_ready_manual_delivery", actor: "jd_admin", metadata: { order_id: link.order_id } });
  const receipts = await getTurso().execute({ sql: "SELECT payment_id FROM payment_receipts WHERE order_id=? AND disposition='pending'", args: [link.order_id] });
  for (const row of receipts.rows) await verifyPayment(String(row.payment_id));
  return { success: true, status: (await getInquiry(inquiry.id)).status, paymentUrl: link.url,
    warning: "Payment link ready. Contact the customer and share it directly. No automatic message was sent." };
}

export async function approveReservation(id: string, body: Record<string, unknown>) {
  squareConfiguration();
  const slot = appointment(body), amount = Number(body.amountCents);
  if (!Number.isSafeInteger(amount) || amount < 100 || amount > 1000000) throw new RanchError("Enter an approved total between $1 and $10,000.");
  const external = await checkExternalAvailability(slot.start, slot.end, body.externalCalendarReviewed === true);
  const tx = await getTurso().transaction("write");
  try {
    const result = await tx.execute({ sql: "SELECT status FROM booking_inquiries WHERE id=?", args: [id] });
    if (result.rows[0]?.status !== "PENDING_JD") throw new RanchError("Only pending requests can be approved.", 409);
    await assertSlotFree(tx, id, slot.start, slot.end);
    const expires = new Date(Math.min(Date.now() + 24 * 3600000, Date.parse(slot.start))).toISOString();
    await tx.execute({ sql: `UPDATE booking_inquiries SET status='AWAITING_PAYMENT',approved_start_at=?,approved_end_at=?,
      approved_amount_cents=?,approval_note=?,approval_key=?,hold_expires_at=?,updated_at=? WHERE id=?`,
      args: [slot.start, slot.end, amount, clean(body.note), randomUUID(), expires, nowIso(), id] });
    await event(tx, id, "appointment_held", "jd_admin", { ...slot, amount_cents: amount, external_availability: external, hold_expires_at: expires });
    await tx.commit();
  } catch (error) { await tx.rollback(); throw error; } finally { tx.close(); }
  try { return await attachPaymentLink(await getInquiry(id)); }
  catch (error) {
    await recordBookingEvent({ inquiryId: id, eventType: "payment_creation_requires_retry", actor: "system" });
    if (error instanceof RanchError) return { success: true, status: "AWAITING_PAYMENT", warning: error.message + " The slot is held. Use Retry payment link before sharing checkout." };
    throw error;
  }
}

export async function retryPaymentLink(inquiry: BookingInquiry) {
  if (inquiry.status !== "AWAITING_PAYMENT" || !inquiry.hold_expires_at || Date.parse(inquiry.hold_expires_at) <= Date.now()) throw new RanchError("This payment hold is no longer active.", 409);
  return attachPaymentLink(inquiry);
}

export async function applyVerifiedPayment(payment: SquarePayment) {
  const config = squareConfiguration();
  if (payment.location_id !== config.locationId || !payment.id || !payment.order_id) throw new RanchError("The payment does not belong to this ranch location.", 403);
  const money = payment.total_money || payment.amount_money;
  const amount = Number(money?.amount || 0), currency = String(money?.currency || "");
  const tx = await getTurso().transaction("write");
  try {
    const previous = await tx.execute({ sql: "SELECT disposition FROM payment_receipts WHERE payment_id=?", args: [payment.id] });
    await tx.execute({ sql: `INSERT INTO payment_receipts (payment_id,order_id,status,amount_cents,currency,disposition,received_at)
      VALUES (?,?,?,?,?,'pending',?) ON CONFLICT(payment_id) DO UPDATE SET status=excluded.status,amount_cents=excluded.amount_cents,currency=excluded.currency`,
      args: [payment.id, payment.order_id, payment.status, amount, currency, nowIso()] });
    const rows = await tx.execute({ sql: "SELECT * FROM booking_inquiries WHERE square_order_id=?", args: [payment.order_id] });
    if (!rows.rows.length) { await tx.commit(); return "pending"; }
    const row = rows.rows[0], id = String(row.id);
    if (payment.status !== "COMPLETED") {
      if (!previous.rows.length) await event(tx, id, "payment_not_completed", "square", { payment_id: payment.id, status: payment.status });
      await tx.commit(); return "not_completed";
    }
    if (row.square_payment_id === payment.id) { await tx.commit(); return "confirmed"; }
    const expired = row.hold_expires_at && Date.parse(String(row.hold_expires_at)) <= Date.now();
    const valid = row.status === "AWAITING_PAYMENT" && !expired && amount === Number(row.approved_amount_cents) && currency === "USD";
    if (!valid) {
      if (expired && row.status === "AWAITING_PAYMENT") await tx.execute({ sql: "UPDATE booking_inquiries SET status='EXPIRED',updated_at=? WHERE id=?", args: [nowIso(), id] });
      if (previous.rows[0]?.disposition !== "review_required") await event(tx, id, "payment_review_required", "square", { payment_id: payment.id, amount_cents: amount, currency, status: row.status, expired: Boolean(expired) });
      await tx.execute({ sql: "UPDATE payment_receipts SET disposition='review_required' WHERE payment_id=?", args: [payment.id] });
      await tx.commit(); return "review_required";
    }
    await tx.execute({ sql: "UPDATE booking_inquiries SET status='BOOKED',square_payment_id=?,paid_at=?,booked_at=?,updated_at=? WHERE id=? AND status='AWAITING_PAYMENT'", args: [payment.id, nowIso(), nowIso(), nowIso(), id] });
    await tx.execute({ sql: "UPDATE payment_receipts SET disposition='confirmed' WHERE payment_id=?", args: [payment.id] });
    await event(tx, id, "payment_verified_booking_confirmed", "square", { payment_id: payment.id, amount_cents: amount, customer_notice: "manual_required" });
    await tx.execute({ sql: "INSERT INTO notification_outbox (id,kind,created_at) VALUES (?,'payment_verified',?) ON CONFLICT(id) DO NOTHING", args: [`payment-${payment.id}`, nowIso()] });
    await tx.commit(); return "confirmed";
  } catch (error) { await tx.rollback(); throw error; } finally { tx.close(); }
}

export async function verifyPayment(paymentId: string) {
  const payment = await retrieveSquarePayment(paymentId);
  const disposition = await applyVerifiedPayment(payment);
  for (const refundId of payment.refund_ids || []) await applyVerifiedRefund(await retrieveSquareRefund(refundId));
  return disposition;
}
export async function syncReservationPayment(inquiry: BookingInquiry) {
  if (!inquiry.square_order_id) throw new RanchError("Create the payment link first.", 409);
  const payments = inquiry.square_payment_id ? [inquiry.square_payment_id] : await retrieveOrderPayments(inquiry.square_order_id);
  for (const id of payments) await verifyPayment(id);
  await recordBookingEvent({ inquiryId: inquiry.id, eventType: "payment_checked_by_admin", actor: "jd_admin" });
  return { success: true, status: (await getInquiry(inquiry.id)).status, warning: payments.length ? "Square payment status checked. Contact the customer if an update is needed." : "Square has no completed payment for this order yet." };
}

export async function rescheduleReservation(inquiry: BookingInquiry, body: Record<string, unknown>) {
  if (!["BOOKED", "AWAITING_PAYMENT"].includes(inquiry.status)) throw new RanchError("Only approved appointments can be rescheduled.", 409);
  if (inquiry.status === "AWAITING_PAYMENT" && inquiry.hold_expires_at && Date.parse(inquiry.hold_expires_at) <= Date.now()) throw new RanchError("This payment hold has expired.", 409);
  const slot = appointment(body);
  const external = await checkExternalAvailability(slot.start, slot.end, body.externalCalendarReviewed === true);
  const tx = await getTurso().transaction("write");
  try {
    await assertSlotFree(tx, inquiry.id, slot.start, slot.end);
    const result = await tx.execute({ sql: "UPDATE booking_inquiries SET approved_start_at=?,approved_end_at=?,approval_note=?,reschedule_requested_at=NULL,reschedule_request_text=NULL,updated_at=? WHERE id=? AND status IN ('BOOKED','AWAITING_PAYMENT')", args: [slot.start, slot.end, clean(body.note), nowIso(), inquiry.id] });
    if (!result.rowsAffected) throw new RanchError("The appointment changed. Refresh and review it.", 409);
    await event(tx, inquiry.id, "appointment_rescheduled_manual_notice_required", "jd_admin", { previous_start: inquiry.approved_start_at, ...slot, external_availability: external });
    await tx.commit();
  } catch (error) { await tx.rollback(); throw error; } finally { tx.close(); }
  return { success: true, warning: "Appointment updated. Call the customer to confirm the new time." };
}

export async function cancelReservation(inquiry: BookingInquiry, reason: string) {
  if (!["COLLECTING_INFORMATION", "PENDING_JD", "AWAITING_PAYMENT", "BOOKED"].includes(inquiry.status)) throw new RanchError("This reservation is already closed.", 409);
  if (inquiry.status === "AWAITING_PAYMENT" && !inquiry.square_payment_link_id && inquiry.approval_key) {
    await attachPaymentLink(inquiry); // Resolve any uncertain provider result with the same idempotency key.
    inquiry = await getInquiry(inquiry.id);
  }
  if (inquiry.square_payment_link_id) await deleteSquarePaymentLink(inquiry.square_payment_link_id);
  // A webhook can complete during the Square request. Status changes use a transaction.
  const tx = await getTurso().transaction("write");
  try {
    const row = await tx.execute({ sql: "SELECT status,paid_at FROM booking_inquiries WHERE id=?", args: [inquiry.id] });
    if (!["COLLECTING_INFORMATION", "PENDING_JD", "AWAITING_PAYMENT", "BOOKED"].includes(String(row.rows[0]?.status))) throw new RanchError("The reservation changed. Refresh it.", 409);
    await tx.execute({ sql: "UPDATE booking_inquiries SET status='CANCELLED',updated_at=? WHERE id=?", args: [nowIso(), inquiry.id] });
    await event(tx, inquiry.id, "cancelled_by_admin", "jd_admin", { reason, paid: Boolean(row.rows[0].paid_at), refund: "not_issued" });
    await tx.commit();
  } catch (error) { await tx.rollback(); throw error; } finally { tx.close(); }
  return { success: true, status: "CANCELLED", warning: "Appointment cancelled. No refund or customer message was sent. Contact the customer directly." };
}

export async function applyVerifiedRefund(refund: SquareRefund) {
  const tx = await getTurso().transaction("write");
  try {
    const row = await tx.execute({ sql: "SELECT * FROM booking_inquiries WHERE square_payment_id=?", args: [refund.payment_id] });
    if (!row.rows.length) { await tx.commit(); return; }
    const inquiry = row.rows[0], amount = Number(refund.amount_money?.amount || 0);
    if (!Number.isSafeInteger(amount) || amount <= 0 || refund.amount_money.currency !== "USD" || amount > Number(inquiry.approved_amount_cents)) throw new RanchError("Square refund details do not match this reservation.", 409);
    const previous = await tx.execute({ sql: "SELECT status FROM square_refunds WHERE id=?", args: [refund.id] });
    await tx.execute({ sql: `INSERT INTO square_refunds (id,inquiry_id,payment_id,amount_cents,status,created_at) VALUES (?,?,?,?,?,?)
      ON CONFLICT(id) DO UPDATE SET status=excluded.status`, args: [refund.id, String(inquiry.id), refund.payment_id, amount, refund.status, nowIso()] });
    const sum = await tx.execute({ sql: "SELECT COALESCE(SUM(amount_cents),0) AS total FROM square_refunds WHERE inquiry_id=? AND status='COMPLETED'", args: [String(inquiry.id)] });
    const total = Number(sum.rows[0].total);
    await tx.execute({ sql: `UPDATE booking_inquiries SET refunded_amount_cents=?, status=CASE WHEN ? >= approved_amount_cents AND status='BOOKED' THEN 'CANCELLED' ELSE status END,updated_at=? WHERE id=?`, args: [total, total, nowIso(), String(inquiry.id)] });
    if (previous.rows[0]?.status !== refund.status) await event(tx, String(inquiry.id), "refund_status_verified", "square", { refund_id: refund.id, amount_cents: amount, status: refund.status });
    await tx.commit();
  } catch (error) { await tx.rollback(); throw error; } finally { tx.close(); }
}

export async function refundReservation(inquiry: BookingInquiry, body: Record<string, unknown>) {
  if (!inquiry.square_payment_id || !inquiry.paid_at) throw new RanchError("Only a verified Square payment can be refunded.", 409);
  const amount = Number(body.amountCents), key = String(body.requestKey || ""), reason = clean(body.reason, 192);
  if (!Number.isSafeInteger(amount) || amount <= 0 || !uuid(key) || !reason) throw new RanchError("Enter the refund amount and reason.");
  const existing = await getTurso().execute({ sql: "SELECT * FROM square_refunds WHERE request_key=?", args: [key] });
  if (existing.rows.length && existing.rows[0].inquiry_id !== inquiry.id) throw new RanchError("Invalid refund reference.", 409);
  if (existing.rows.length && Number(existing.rows[0].amount_cents) !== amount) throw new RanchError("A retry must use the original refund amount.", 409);
  const reserved = await getTurso().execute({ sql: "SELECT COALESCE(SUM(amount_cents),0) AS total FROM square_refunds WHERE inquiry_id=? AND status IN ('COMPLETED','PENDING','REQUESTED') AND (request_key IS NULL OR request_key != ?)", args: [inquiry.id, key] });
  if (amount + Number(reserved.rows[0].total) > Number(inquiry.approved_amount_cents)) throw new RanchError("The refund exceeds the remaining paid balance.", 409);
  await getTurso().execute({ sql: "INSERT INTO square_refunds (id,inquiry_id,payment_id,amount_cents,status,created_at,request_key) VALUES (?,?,?,?,'REQUESTED',?,?) ON CONFLICT(request_key) DO NOTHING", args: [`request-${key}`, inquiry.id, inquiry.square_payment_id, amount, nowIso(), key] });
  const refund = await createSquareRefund(inquiry.square_payment_id, amount, key, reason);
  // A refund webhook may arrive before this request returns. Merge its row with
  // the request record instead of failing the provider-id unique constraint.
  await getTurso().batch([
    { sql: "DELETE FROM square_refunds WHERE request_key=? AND id != ?", args: [key, refund.id] },
    { sql: "INSERT INTO square_refunds (id,inquiry_id,payment_id,amount_cents,status,created_at,request_key) VALUES (?,?,?,?,'REQUESTED',?,?) ON CONFLICT(id) DO UPDATE SET request_key=excluded.request_key", args: [refund.id, inquiry.id, inquiry.square_payment_id, amount, nowIso(), key] },
  ], "write");
  await applyVerifiedRefund(refund);
  return { success: true, warning: "Refund submitted to Square. The verified refund status is shown in this reservation. Contact the customer directly." };
}

export async function recoverLatePayment(inquiry: BookingInquiry, body: Record<string, unknown>) {
  if (inquiry.status !== "EXPIRED") throw new RanchError("Only an expired reservation can use late-payment recovery.", 409);
  const payment = await retrieveSquarePayment(String(body.paymentId || "")), config = squareConfiguration();
  const money = payment.total_money || payment.amount_money;
  if (payment.order_id !== inquiry.square_order_id || payment.location_id !== config.locationId || payment.status !== "COMPLETED" || money?.currency !== "USD" || Number(money.amount) !== inquiry.approved_amount_cents) throw new RanchError("This payment does not match the approved reservation.", 409);
  for (const refundId of payment.refund_ids || []) {
    const refund = await retrieveSquareRefund(refundId);
    if (["COMPLETED","PENDING"].includes(refund.status)) throw new RanchError("This payment has a refund in progress. Resolve it in Square before recovering a booking.", 409);
  }
  if (Number(payment.refunded_money?.amount || 0) > 0) throw new RanchError("A refunded payment cannot confirm this reservation.", 409);
  const slot = appointment(body), external = await checkExternalAvailability(slot.start, slot.end, body.externalCalendarReviewed === true);
  const tx = await getTurso().transaction("write");
  try {
    await assertSlotFree(tx, inquiry.id, slot.start, slot.end);
    const result = await tx.execute({ sql: "UPDATE booking_inquiries SET status='BOOKED',square_payment_id=?,approved_start_at=?,approved_end_at=?,paid_at=?,booked_at=?,updated_at=? WHERE id=? AND status='EXPIRED'", args: [payment.id, slot.start, slot.end, nowIso(), nowIso(), nowIso(), inquiry.id] });
    if (!result.rowsAffected) throw new RanchError("The reservation changed. Refresh it before recovery.", 409);
    await tx.execute({ sql: "UPDATE payment_receipts SET disposition='confirmed' WHERE payment_id=?", args: [payment.id] });
    await event(tx, inquiry.id, "late_payment_recovered_by_owner", "jd_admin", { payment_id: payment.id, ...slot, external_availability: external, notice: "manual_required" });
    await tx.commit();
  } catch (error) { await tx.rollback(); throw error; } finally { tx.close(); }
  return { success: true, warning: "Payment verified and the new time confirmed. Call the customer to confirm the recovered appointment." };
}

export async function handleReservationAction(id: string, body: Record<string, unknown>) {
  return withBookingLock(id, async () => {
    const inquiry = await getInquiry(id), action = String(body.action || "");
    if (action === "jd_approved") return approveReservation(id, body);
    if (action === "retry_payment_link") return retryPaymentLink(inquiry);
    if (action === "sync_payment") return syncReservationPayment(inquiry);
    if (action === "reschedule" || action === "approve_change") return rescheduleReservation(inquiry, body);
    if (action === "cancel") return cancelReservation(inquiry, clean(body.reason));
    if (action === "refund") return refundReservation(inquiry, body);
    if (action === "recover_late_payment") return recoverLatePayment(inquiry, body);
    if (action === "update_details") {
      const name = clean(body.customerName, 120), raw = clean(body.phone,40), digits=raw.replace(/\D/g,"");
      const phone = digits.length === 10 ? `+1${digits}` : digits.length === 11 && digits.startsWith("1") ? `+${digits}` : raw.startsWith("+") && digits.length >= 10 && digits.length <= 15 ? `+${digits}` : "";
      const email = clean(body.email,200), riders = Number(body.riderCount);
      if (!name || !phone || !Number.isInteger(riders) || riders < 1 || riders > 12 || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) throw new RanchError("Check the contact name, phone, email, and number of riders.");
      await updateInquiry(id,{customer_name:name,customer_phone:phone,email:email||null,rider_count:riders,rider_details:clean(body.riderDetails,2000),experience:clean(body.experience,800)});
      await recordBookingEvent({inquiryId:id,eventType:"contact_and_rider_details_corrected",actor:"jd_admin"});
      return {success:true};
    }
    if (action === "record_customer_confirmation") {
      if (inquiry.status !== "BOOKED") throw new RanchError("Confirm the booking payment before recording customer confirmation.", 409);
      await updateInquiry(id, { confirmation_sent_at: nowIso() });
      await recordBookingEvent({ inquiryId: id, eventType: "customer_confirmation_recorded_by_owner", actor: "jd_admin", metadata: { channel: "manual_phone_conversation" } });
      return { success: true, warning: "Your customer confirmation was recorded. No message was sent by the website." };
    }
    if (action === "decline") {
      if (!["PENDING_JD", "COLLECTING_INFORMATION"].includes(inquiry.status)) throw new RanchError("Only pending requests can be declined.", 409);
      await updateInquiry(id, { status: "DECLINED", approval_note: clean(body.reason) });
      await recordBookingEvent({ inquiryId: id, eventType: "jd_declined_manual_notice_required", actor: "jd_admin" });
      return { success: true, warning: "Request declined. Call the customer to let them know." };
    }
    if (action === "complete") {
      if (inquiry.status !== "BOOKED" || !inquiry.approved_start_at || Date.parse(inquiry.approved_start_at) > Date.now()) throw new RanchError("Only a confirmed ride whose start time has passed can be completed.", 409);
      await updateInquiry(id, { status: "COMPLETED", completed_at: nowIso() });
      await recordBookingEvent({ inquiryId: id, eventType: "ride_completed", actor: "jd_admin" });
      return { success: true };
    }
    if (action === "update_notes") {
      await updateInquiry(id, { qualification_notes: clean(body.notes, 4000) });
      await recordBookingEvent({ inquiryId: id, eventType: "owner_notes_updated", actor: "jd_admin" });
      return { success: true };
    }
    throw new RanchError("Unsupported reservation action.");
  });
}

export async function expirePaymentHolds() {
  const rows = await getTurso().execute({ sql: "SELECT id FROM booking_inquiries WHERE status='AWAITING_PAYMENT' AND hold_expires_at < ? LIMIT 100", args: [nowIso()] });
  let expired = 0;
  for (const row of rows.rows) {
    try { await withBookingLock(String(row.id), async () => {
      const inquiry = await getInquiry(String(row.id));
      if (inquiry.square_order_id) {
        for (const id of await retrieveOrderPayments(inquiry.square_order_id)) await verifyPayment(id);
      }
      const refreshed = await getInquiry(inquiry.id);
      if (refreshed.status === "AWAITING_PAYMENT") {
        if (refreshed.square_payment_link_id) await deleteSquarePaymentLink(refreshed.square_payment_link_id);
        await updateInquiry(inquiry.id, { status: "EXPIRED" });
        await recordBookingEvent({ inquiryId: inquiry.id, eventType: "payment_hold_expired", actor: "system" });
        expired++;
      }
    }); } catch { /* Keep uncertain provider operations for owner review/retry. */ }
  }
  return expired;
}
