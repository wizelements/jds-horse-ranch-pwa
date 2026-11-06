import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { readFile, access, mkdtemp, rm } from "node:fs/promises";
import { spawn, spawnSync } from "node:child_process";
import { createHmac, randomUUID } from "node:crypto";
import net from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createClient } from "@libsql/client";

// These checks use an isolated local database and a loopback Square fixture.
// They prove application behavior; they do not certify the real merchant account.
const root = new URL("..", import.meta.url), envPath = new URL("../.env.development.local", import.meta.url);
let env, db, app, fixture, base, testDirectory, cookie = "", appOutput = "";
const future = (day = 1) => { const d = new Date(Date.now() + (30 + day) * 86400000); d.setUTCHours(17,0,0,0); return d.toISOString(); };
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

async function request(path, options = {}) {
  const response = await fetch(base + path, { redirect: "manual", ...options, headers: { ...(cookie ? { Cookie: cookie } : {}), ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers } });
  const text = await response.text(); let data; try { data = JSON.parse(text); } catch { data = text; }
  return { status: response.status, headers: response.headers, data, text };
}
async function post(path, body, options = {}) { return request(path, { method: "POST", body: JSON.stringify(body), ...options }); }
async function square(path, body) {
  const response = await fetch("http://127.0.0.1:43189" + path, { ...(body ? { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } } : {}) });
  assert.equal(response.status, 200); return response.json();
}
async function row(id) { const result = await db.execute({ sql: "SELECT * FROM booking_inquiries WHERE id=?", args: [id] }); return result.rows[0]; }
async function call(overrides = {}) {
  const body = { intakeKey: randomUUID(), customerName: "Acceptance rider", phone: "+1404555" + String(Math.floor(Math.random() * 10000)).padStart(4,"0"), serviceRequested: "Guided trail ride", riderCount: 1, requestedDatetimeText: "Discussed by phone", ...overrides };
  const response = await post("/api/admin/inquiries", body); assert.equal(response.status, 201, response.text);
  return { id: response.data.inquiryId, body };
}
async function approve(id, day, overrides = {}) { return post(`/api/admin/inquiries/${id}`, { action: "jd_approved", approvedStartAt: future(day), durationMinutes: 60, amountCents: 8500, externalCalendarReviewed: true, ...overrides }); }
async function event(payment, overrides = {}) {
  const object = overrides.type?.startsWith("refund.") ? { refund: { id: payment.id } } : { payment: { id: payment.id } };
  const payload = { event_id: randomUUID(), type: "payment.updated", data: { object }, ...overrides };
  const raw = JSON.stringify(payload), signature = createHmac("sha256", env.SQUARE_WEBHOOK_SIGNATURE_KEY).update(env.SQUARE_WEBHOOK_NOTIFICATION_URL + raw).digest("base64");
  const result = await request("/api/square/webhook", { method: "POST", body: raw, headers: { "Content-Type": "application/json", "x-square-hmacsha256-signature": signature } });
  return { ...result, payload };
}
async function pay(id, options = {}) { const booking = await row(id); return square("/__fixture/payment", { orderId: booking.square_order_id, ...options }); }

before(async () => {
  if (process.env.VERCEL) throw new Error("Acceptance fixtures must never run in a Vercel environment.");
  try { await access(envPath); } catch { const prep = spawnSync(process.execPath,["tests/support/prepare-acceptance.mjs"],{cwd:root,encoding:"utf8"}); assert.equal(prep.status,0,prep.stderr); }
  env = Object.fromEntries((await readFile(envPath,"utf8")).trim().split("\n").map(line => { const index=line.indexOf("="); return [line.slice(0,index),JSON.parse(line.slice(index+1))]; }));
  assert.equal(env.RANCH_TEST_FIXTURES,"true"); assert.ok(env.TURSO_DATABASE_URL.startsWith("file:")); assert.equal(env.SQUARE_TEST_API_URL,"http://127.0.0.1:43189");
  testDirectory = await mkdtemp(join(tmpdir(),"jds-acceptance-run-"));
  env.TURSO_DATABASE_URL = `file:${join(testDirectory,"ranch.db")}`;
  const migration = spawnSync(process.execPath,["scripts/turso-migrate.mjs"],{cwd:root,env:{...process.env,...env},encoding:"utf8"});
  assert.equal(migration.status,0,migration.stderr);
  db = createClient({ url: env.TURSO_DATABASE_URL });
  try { await square("/__fixture/state"); } catch {
    fixture = spawn(process.execPath,["tests/support/square-fixture.mjs"],{cwd:root,stdio:"ignore"});
    for(let i=0;i<50;i++){try{await square("/__fixture/state");break;}catch{await pause(100);}}
  }
  const port = await new Promise(resolve => { const server=net.createServer();server.listen(0,"127.0.0.1",()=>{const port=server.address().port;server.close(()=>resolve(port));}); });
  base = `http://127.0.0.1:${port}`;
  const childEnv = { ...process.env, ...env, NODE_ENV:"production", VERCEL:"", FIREBASE_API_KEY:"", FIREBASE_APP_ID:"", FIREBASE_PROJECT_ID:"", FIREBASE_SERVICE_ACCOUNT_EMAIL:"", FIREBASE_PRIVATE_KEY:"", GOOGLE_CALENDAR_CLIENT_ID:"", GOOGLE_CALENDAR_CLIENT_SECRET:"", GOOGLE_CALENDAR_REDIRECT_URI:"" };
  app=spawn(process.execPath,["node_modules/next/dist/bin/next","start","--hostname","127.0.0.1","--port",String(port)],{cwd:root,env:childEnv,stdio:["ignore","pipe","pipe"]});
  app.stdout.on("data",chunk=>{appOutput=(appOutput+chunk).slice(-12000);});app.stderr.on("data",chunk=>{appOutput=(appOutput+chunk).slice(-12000);});
  for(let i=0;i<150;i++){try{const result=await request("/api/health/integrations");if(result.status===200)return;}catch{}if(app.exitCode!==null)break;await pause(100);}
  throw new Error("Isolated Next.js server did not become healthy. " + appOutput.replace(/file:[^\s]+/g,"[local database]"));
}, { timeout:30000 });
after(async () => { app?.kill(); fixture?.kill(); db?.close(); if(testDirectory) await rm(testDirectory,{recursive:true,force:true}); });

test("private pages and APIs reject unauthenticated access and cross-site writes", async () => {
  assert.equal((await request("/admin/dashboard")).status,307);
  assert.equal((await request("/api/admin/services")).status,401);
  const result=await post("/api/admin/login",{password:"anything"},{headers:{Origin:"https://unrelated.invalid"}});assert.equal(result.status,403);
  assert.match((await request("/ranch-login")).headers.get("cache-control"),/no-store/);
});
test("owner sign-in sets a secure session and rejects forged and expired tokens", async () => {
  assert.equal((await post("/api/admin/login",{password:"wrong"})).status,401);
  const login=await post("/api/admin/login",{password:"ranch-acceptance-only"});assert.equal(login.status,200,login.text);
  const header=login.headers.get("set-cookie");assert.match(header,/HttpOnly/i);assert.match(header,/Secure/i);assert.match(header,/SameSite=lax/i);cookie=header.split(";")[0];
  assert.equal((await request("/api/admin/services")).status,200);
  assert.equal((await request("/api/admin/services",{headers:{Cookie:cookie+".extra"}})).status,401);
  const payload=Buffer.from(JSON.stringify({v:2,admin:true,exp:1})).toString("base64url");
  const signature=createHmac("sha256",env.SESSION_TOKEN_SECRET_V2).update(payload).digest("base64url");
  assert.equal((await request("/api/admin/services",{headers:{Cookie:`admin_session=${payload}.${signature}`}})).status,401);
});
test("a saved phone call is idempotent and the same family can make another request", async () => {
  const first=await call({customerName:"Returning family",phone:"+14045550100"});
  const repeat=await post("/api/admin/inquiries",first.body);assert.equal(repeat.status,201);assert.equal(repeat.data.inquiryId,first.id);
  const events=await db.execute({sql:"SELECT COUNT(*) AS n FROM booking_events WHERE inquiry_id=? AND event_type='phone_conversation_recorded'",args:[first.id]});assert.equal(Number(events.rows[0].n),1);
  const second=await call({customerName:"Returning family",phone:"+14045550100",requestedDatetimeText:"A separate future visit"});assert.notEqual(second.id,first.id);
  assert.equal((await post("/api/admin/inquiries",{...first.body,intakeKey:randomUUID(),phone:"invalid"})).status,400);
});
test("approval holds an Eastern-time slot and requires review of unconnected calendars", async () => {
  const record=await call();assert.equal((await approve(record.id,1,{externalCalendarReviewed:false})).status,409);
  const result=await approve(record.id,1);assert.equal(result.status,200,result.text);
  const saved=await row(record.id);assert.equal(saved.status,"AWAITING_PAYMENT");assert.equal(saved.approved_start_at,future(1));assert.ok(saved.square_order_id);assert.ok(saved.hold_expires_at);
  await request("/booking/payment-complete?inquiry="+record.id);assert.equal((await row(record.id)).status,"AWAITING_PAYMENT");
});
test("concurrent approvals cannot reserve overlapping rides", async () => {
  const a=await call(),b=await call();const results=await Promise.all([approve(a.id,2),approve(b.id,2)]);
  assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);
  const c=await call();assert.equal((await approve(c.id,2,{approvedStartAt:new Date(Date.parse(future(2))+3600000).toISOString()})).status,409);
  assert.equal((await approve(c.id,2,{approvedStartAt:new Date(Date.parse(future(2))+75*60000).toISOString()})).status,200);
});
test("uncertain Square responses reuse the same checkout instead of duplicating it", async () => {
  const record=await call();await square("/__fixture/config",{failNextCreate:true});
  const approved=await approve(record.id,3);assert.equal(approved.status,200);assert.match(approved.data.warning,/retry/i);
  const before=await row(record.id);assert.equal(before.status,"AWAITING_PAYMENT");assert.equal(before.square_order_id,null);
  const retried=await post(`/api/admin/inquiries/${record.id}`,{action:"retry_payment_link"});assert.equal(retried.status,200,retried.text);
  const state=await square("/__fixture/state");assert.equal(state.links.filter(link=>link.idempotencyKey===before.approval_key).length,1);
});
test("unsigned webhooks, non-completed payments, and forged amounts do not confirm rides", async () => {
  assert.equal((await post("/api/square/webhook",{type:"payment.updated"})).status,403);
  const record=await call();assert.equal((await approve(record.id,4)).status,200);
  const pending=await pay(record.id,{status:"APPROVED"});assert.equal((await event(pending)).status,200);assert.equal((await row(record.id)).status,"AWAITING_PAYMENT");
  const wrong=await pay(record.id,{amount:100});const receipt=await event(wrong,{data:{object:{payment:{id:wrong.id,total_money:{amount:8500,currency:"USD"},status:"COMPLETED"}}}});assert.equal(receipt.status,200);assert.equal((await row(record.id)).status,"AWAITING_PAYMENT");
  const review=await db.execute({sql:"SELECT disposition FROM payment_receipts WHERE payment_id=?",args:[wrong.id]});assert.equal(review.rows[0].disposition,"review_required");
});
test("verified payment, duplicate events, and owner payment refresh remain idempotent", async () => {
  const record=await call();assert.equal((await approve(record.id,5)).status,200);
  const payment=await pay(record.id);const first=await event(payment);assert.equal(first.status,200,first.text);
  assert.equal((await row(record.id)).status,"BOOKED");assert.equal((await event(payment,first.payload)).status,200);
  assert.equal((await post(`/api/admin/inquiries/${record.id}`,{action:"sync_payment"})).status,200);
  const audit=await db.execute({sql:"SELECT COUNT(*) AS n FROM booking_events WHERE inquiry_id=? AND event_type='payment_verified_booking_confirmed'",args:[record.id]});assert.equal(Number(audit.rows[0].n),1);
  const notifications=await db.execute({sql:"SELECT COUNT(*) AS n FROM notification_outbox WHERE id=?",args:[`payment-${payment.id}`]});assert.equal(Number(notifications.rows[0].n),1);
  assert.equal((await post(`/api/admin/inquiries/${record.id}`,{action:"complete"})).status,409);
});
test("late and cancelled payments require owner review and cannot revive a reservation", async () => {
  const expired=await call();await approve(expired.id,6);await db.execute({sql:"UPDATE booking_inquiries SET hold_expires_at=? WHERE id=?",args:[new Date(Date.now()-1000).toISOString(),expired.id]});
  const late=await pay(expired.id);assert.equal((await event(late)).status,200);assert.equal((await row(expired.id)).status,"EXPIRED");
  const cancelled=await call();await approve(cancelled.id,7);assert.equal((await post(`/api/admin/inquiries/${cancelled.id}`,{action:"cancel"})).status,200);
  const payment=await pay(cancelled.id);await event(payment);assert.equal((await row(cancelled.id)).status,"CANCELLED");
  const detail=await request(`/admin/inquiries/${cancelled.id}`);assert.match(detail.text,/Payment needs review/);
});
test("calendar blocks and rescheduling protect the existing confirmed appointment", async () => {
  const record=await call();await approve(record.id,8);await event(await pay(record.id));
  const start=future(9),end=new Date(Date.parse(start)+3600000).toISOString();
  assert.equal((await post("/api/admin/calendars",{action:"add_block",label:"Acceptance busy time",start,end})).status,200);
  const rejected=await post(`/api/admin/inquiries/${record.id}`,{action:"reschedule",approvedStartAt:start,durationMinutes:60,externalCalendarReviewed:true});assert.equal(rejected.status,409);assert.equal((await row(record.id)).approved_start_at,future(8));
  const changed=await post(`/api/admin/inquiries/${record.id}`,{action:"reschedule",approvedStartAt:future(10),durationMinutes:90,externalCalendarReviewed:true});assert.equal(changed.status,200);assert.equal((await row(record.id)).approved_start_at,future(10));
});
test("owner can recover a verified late payment only after checking a new free appointment", async () => {
  const record=await call();await approve(record.id,16);await db.execute({sql:"UPDATE booking_inquiries SET hold_expires_at=? WHERE id=?",args:[new Date(Date.now()-1000).toISOString(),record.id]});
  const payment=await pay(record.id);await event(payment);assert.equal((await row(record.id)).status,"EXPIRED");
  const blocked=await post(`/api/admin/inquiries/${record.id}`,{action:"recover_late_payment",paymentId:payment.id,approvedStartAt:future(9),durationMinutes:60,externalCalendarReviewed:true});assert.equal(blocked.status,409);
  const result=await post(`/api/admin/inquiries/${record.id}`,{action:"recover_late_payment",paymentId:payment.id,approvedStartAt:future(17),durationMinutes:60,externalCalendarReviewed:true});assert.equal(result.status,200,result.text);assert.equal((await row(record.id)).status,"BOOKED");
  assert.equal((await post(`/api/admin/inquiries/${record.id}`,{action:"record_customer_confirmation"})).status,200);assert.ok((await row(record.id)).confirmation_sent_at);
});
test("pending refunds cannot exceed the paid balance and duplicate retries do not refund twice", async () => {
  const record=await call();await approve(record.id,11);const payment=await pay(record.id);await event(payment);
  const requestKey=randomUUID(),body={action:"refund",amountCents:1000,reason:"Acceptance test",requestKey};
  assert.equal((await post(`/api/admin/inquiries/${record.id}`,body)).status,200);
  assert.equal((await post(`/api/admin/inquiries/${record.id}`,body)).status,200);
  assert.equal((await post(`/api/admin/inquiries/${record.id}`,{...body,requestKey:randomUUID(),amountCents:8000})).status,409);
  let state=await square("/__fixture/state"),refund=state.refunds.find(r=>r.payment_id===payment.id);assert.equal(state.refunds.filter(r=>r.payment_id===payment.id).length,1);
  await square("/__fixture/refund",{id:refund.id,status:"COMPLETED"});assert.equal((await event(refund,{type:"refund.updated"})).status,200);assert.equal(Number((await row(record.id)).refunded_amount_cents),1000);
  const full={action:"refund",amountCents:7500,reason:"Complete acceptance refund",requestKey:randomUUID()};assert.equal((await post(`/api/admin/inquiries/${record.id}`,full)).status,200);
  state=await square("/__fixture/state");const second=state.refunds.find(r=>r.payment_id===payment.id&&r.id!==refund.id);await square("/__fixture/refund",{id:second.id,status:"COMPLETED"});await event(second,{type:"refund.updated"});
  const saved=await row(record.id);assert.equal(Number(saved.refunded_amount_cents),8500);assert.equal(saved.status,"CANCELLED");
});
test("calendar import refuses unsupported recurrence and imports an explicit busy interval", async () => {
  const stamp=s=>s.replace(/[-:]/g,"").replace(/\.\d{3}/,"");
  const calendar=`BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nDTSTART:${stamp(future(12))}\r\nDTEND:${stamp(new Date(Date.parse(future(12))+3600000).toISOString())}\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n`;
  assert.equal((await post("/api/admin/calendars",{action:"import_calendar",calendar:calendar.replace("END:VEVENT","RRULE:FREQ=DAILY\r\nEND:VEVENT")})).status,400);
  assert.equal((await post("/api/admin/calendars",{action:"import_calendar",label:"Fixture import",calendar})).status,200);
  const record=await call();assert.equal((await approve(record.id,12)).status,409);
});
test("private calendar subscriptions rotate and contain no rider names or phone numbers", async () => {
  const feed=await post("/api/admin/calendars",{action:"create_feed"});assert.equal(feed.status,200);
  const path=new URL(feed.data.feedUrl).pathname+new URL(feed.data.feedUrl).search;const response=await request(path,{headers:{Cookie:""}});assert.equal(response.status,200);assert.match(response.text,/BEGIN:VCALENDAR/);assert.doesNotMatch(response.text,/Acceptance rider|1404555|customer_phone/);
  await post("/api/admin/calendars",{action:"create_feed"});assert.equal((await request(path)).status,401);
  assert.equal((await request("/api/calendar/feed")).status,401);
});
test("owner content changes reach the public page and invalid price writes fail", async () => {
  const initial=await request("/api/admin/services");assert.equal(initial.status,200);const service=initial.data.services[0];
  assert.equal((await request(`/api/admin/services/${service.id}`,{method:"PATCH",body:JSON.stringify({price_min:-1})})).status,400);
  const changed=await request(`/api/admin/services/${service.id}`,{method:"PATCH",body:JSON.stringify({price_min:91.25,price_max:91.25,price_detail:"Acceptance content verification"})});assert.equal(changed.status,200,changed.text);
  const page=await request("/");assert.equal(page.status,200);assert.match(page.text,/91\.25/);assert.match(page.text,/Acceptance content verification/);assert.doesNotMatch(page.text,/wp-content\/uploads/);
  assert.equal((await request(`/api/admin/services/${service.id}`,{method:"PATCH",headers:{Origin:"https://other.invalid"},body:JSON.stringify({name:"Injected"})})).status,403);
  await request(`/api/admin/services/${service.id}`,{method:"PATCH",body:JSON.stringify(service)});
});
test("records, calendar pages, and exports work and CSV formulas remain inert", async () => {
  await call({customerName:"=HYPERLINK(\"https://example.invalid\")"});
  for(const path of ["/admin/dashboard","/admin/inquiries","/admin/customers","/admin/schedule","/admin/settings"]) {const response=await request(path);assert.equal(response.status,200,path);assert.match(response.headers.get("cache-control"),/no-store/);}
  const csv=await request("/api/admin/export?type=reservations");assert.equal(csv.status,200);assert.match(csv.text,/'=HYPERLINK/);assert.match(csv.headers.get("content-disposition"),/attachment/);
  assert.equal((await request("/api/admin/export?type=unknown")).status,400);
});
test("owner can correct rider details and a migration preserves edited content", async () => {
  const record=await call();const updated=await post(`/api/admin/inquiries/${record.id}`,{action:"update_details",customerName:"Corrected fixture contact",phone:"4045550188",email:"fixture@example.invalid",riderCount:2,riderDetails:"Two adult riders",experience:"Beginners"});assert.equal(updated.status,200);
  const saved=await row(record.id);assert.equal(saved.customer_phone,"+14045550188");assert.equal(Number(saved.rider_count),2);
  assert.equal((await post(`/api/admin/inquiries/${record.id}`,{action:"update_details",customerName:"",phone:"bad",riderCount:0})).status,400);
  await db.execute("UPDATE services SET price_min=99,price_max=99 WHERE id='service-riding-lessons'");
  await db.execute("DELETE FROM gallery_photos WHERE id='ranch-photo-9'");
  const result=spawnSync(process.execPath,["scripts/turso-migrate.mjs"],{cwd:root,env:{...process.env,...env},encoding:"utf8"});assert.equal(result.status,0,result.stderr);
  const data=await db.execute("SELECT price_min FROM services WHERE id='service-riding-lessons'");assert.equal(Number(data.rows[0].price_min),99);
  const photo=await db.execute("SELECT id FROM gallery_photos WHERE id='ranch-photo-9'");assert.equal(photo.rows.length,0);
});
test("PWA manifests and icons exist, previews stay out of search, and private routes are excluded from offline caching", async () => {
  for(const path of ["/manifest.json","/ranch-manifest.json"]) {const response=await request(path);assert.equal(response.status,200);for(const icon of response.data.icons)assert.equal((await request(icon.src)).status,200);}
  const robots=await request("/robots.txt");assert.match(robots.text,/Disallow: \//);
  const sitemap=await request("/sitemap.xml");assert.match(sitemap.text,/https:\/\/jdshorseranch\.codewithsolo\.com\//);assert.doesNotMatch(sitemap.text,/#|\/admin/);
  const sw=await request("/sw.js");assert.match(sw.text,/admin\|api\|ranch-login/);assert.doesNotMatch(sw.text,/cache\.addAll\(\[.*admin/);
});
test("missing live notification and Google app settings fail closed", async () => {
  const notifications=await request("/api/admin/notifications");assert.equal(notifications.status,200);assert.equal(notifications.data.configured,false);
  assert.equal((await post("/api/admin/notifications",{action:"test"})).status,503);
  assert.equal((await request("/api/admin/calendars/google/start")).status,503);
  assert.equal((await request("/api/cron/maintenance")).status,401);
});
test("sign-out clears access and repeated bad passwords are throttled", async () => {
  assert.equal((await post("/api/admin/logout",{})).status,200);cookie="";
  assert.equal((await request("/api/admin/services")).status,401);
  let status=0;for(let i=0;i<10;i++)status=(await post("/api/admin/login",{password:"wrong",unused:i})).status;assert.equal(status,429);
});


test("search pages use the new canonical domain, structured facts, and an exact public sitemap", async () => {
  const expected = [
    "/horseback-riding-lessons-fairburn-ga",
    "/guided-horseback-trail-rides-fairburn-ga",
    "/horseback-riding-special-events-fairburn-ga",
    "/visit-jds-horse-ranch-fairburn-ga",
  ];
  const sitemap = await request("/sitemap.xml");
  assert.equal(sitemap.status, 200);
  for (const path of expected) {
    assert.ok(sitemap.text.includes("https://jdshorseranch.codewithsolo.com" + path), path + " missing from sitemap");
    const page = await request(path);
    assert.equal(page.status, 200, path);
    assert.ok(page.text.includes('href="https://jdshorseranch.codewithsolo.com' + path + '"'), path + " missing canonical");
    assert.ok(page.text.includes("application/ld+json"), path + " missing structured data");
    assert.ok(page.text.includes("tel:+14049812361"), path + " missing click-to-call");
  }
  const machineSummary = await request("/llms.txt");
  assert.equal(machineSummary.status, 200);
  assert.match(machineSummary.text, /By appointment|appointment only/i);
  assert.ok(!sitemap.text.includes("/admin/") && !sitemap.text.includes("/api/"));
});

test("public homepage answers Atlanta search intent and makes the phone booking path clear", async () => {
  const page = await request("/");
  assert.equal(page.status, 200);
  assert.match(page.text, /Horseback Riding Near Atlanta/);
  assert.match(page.text, /Far from ordinary/);
  assert.match(page.text, /What to expect on the call/);
  assert.match(page.text, /Where can I go horseback riding near Atlanta/);
  assert.match(page.text, /How much does horseback riding cost at JD/);
  assert.match(page.text, /by appointment only/i);
  assert.match(page.text, /tel:\+14049812361/);
  assert.doesNotMatch(page.text, /guaranteed spots|limited spots today/i);
});
