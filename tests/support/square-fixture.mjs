import http from "node:http";
import { randomUUID } from "node:crypto";

const links = new Map(), orders = new Map(), payments = new Map(), refunds = new Map(), refundKeys = new Map();
let failNextCreate = false, failNextRefund = false;
const json = (res, code, body) => { res.writeHead(code, { "Content-Type": "application/json" }); res.end(JSON.stringify(body)); };
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://127.0.0.1");
    const chunks = []; for await (const chunk of req) chunks.push(chunk);
    const data = chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {};
    if (url.pathname === "/__fixture/config") { failNextCreate = Boolean(data.failNextCreate); failNextRefund = Boolean(data.failNextRefund); return json(res, 200, { configured: true }); }
    if (url.pathname === "/__fixture/state") return json(res, 200, { links: [...links.values()], orders: [...orders.values()], payments: [...payments.values()], refunds: [...refunds.values()] });
    if (url.pathname === "/__fixture/payment") {
      const order = orders.get(data.orderId); if (!order) return json(res, 404, { error: "Order not found" });
      const id = data.id || randomUUID();
      const payment = { id, order_id: order.id, location_id: data.locationId || "fixture-ranch-location", status: data.status || "COMPLETED", total_money: { amount: data.amount ?? order.amount, currency: data.currency || "USD" }, amount_money: { amount: data.amount ?? order.amount, currency: data.currency || "USD" }, refund_ids: [], created_at: new Date().toISOString() };
      payments.set(id, payment); order.paymentIds = [...new Set([...(order.paymentIds || []), id])]; return json(res, 200, payment);
    }
    if (url.pathname === "/__fixture/refund") {
      const refund = refunds.get(data.id); if (!refund) return json(res, 404, { error: "Refund not found" });
      refund.status = data.status; return json(res, 200, refund);
    }
    if (req.headers.authorization !== "Bearer local-square-fixture") return json(res, 401, { error: "Fixture authorization required" });
    if (req.method === "POST" && url.pathname === "/v2/online-checkout/payment-links") {
      let link = links.get(data.idempotency_key);
      if (!link) { const id = randomUUID(), orderId = randomUUID(); link = { id, order_id: orderId, url: `http://127.0.0.1:43189/checkout/${id}`, idempotencyKey: data.idempotency_key }; links.set(data.idempotency_key, link); orders.set(orderId, { id: orderId, amount: data.quick_pay.price_money.amount, paymentIds: [] }); }
      if (failNextCreate) { failNextCreate = false; return json(res, 503, { error: "Simulated uncertain response after creation" }); }
      return json(res, 200, { payment_link: link });
    }
    const paymentMatch = /^\/v2\/payments\/(.+)$/.exec(url.pathname);
    if (paymentMatch) return payments.has(paymentMatch[1]) ? json(res, 200, { payment: payments.get(paymentMatch[1]) }) : json(res, 404, {});
    const orderMatch = /^\/v2\/orders\/(.+)$/.exec(url.pathname);
    if (orderMatch) { const order = orders.get(orderMatch[1]); return order ? json(res, 200, { order: { id: order.id, tenders: order.paymentIds.map(id => ({ payment_id: id })) } }) : json(res, 404, {}); }
    const linkMatch = /^\/v2\/online-checkout\/payment-links\/(.+)$/.exec(url.pathname);
    if (linkMatch && req.method === "DELETE") { for (const link of links.values()) if (link.id === linkMatch[1]) link.deleted = true; return json(res, 200, { related_resources: {} }); }
    if (url.pathname === "/v2/refunds" && req.method === "POST") {
      let id = refundKeys.get(data.idempotency_key);
      if (!id) { id = randomUUID(); refundKeys.set(data.idempotency_key, id); const refund = { id, payment_id: data.payment_id, status: "PENDING", amount_money: data.amount_money }; refunds.set(id, refund); const payment = payments.get(data.payment_id); if (payment) payment.refund_ids.push(id); }
      if (failNextRefund) { failNextRefund = false; return json(res, 503, { error: "Simulated uncertain refund response" }); }
      return json(res, 200, { refund: refunds.get(id) });
    }
    const refundMatch = /^\/v2\/refunds\/(.+)$/.exec(url.pathname);
    if (refundMatch) return refunds.has(refundMatch[1]) ? json(res, 200, { refund: refunds.get(refundMatch[1]) }) : json(res, 404, {});
    return json(res, 404, { error: "Unknown fixture operation" });
  } catch { return json(res, 500, { error: "Fixture could not process request" }); }
});
server.listen(43189, "127.0.0.1", () => process.stdout.write("Local Square fixture ready on 127.0.0.1:43189. No real payments are possible.\n"));
