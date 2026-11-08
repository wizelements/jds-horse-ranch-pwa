import test from "node:test";
import assert from "node:assert/strict";
import { sourceForPublicCall } from "../lib/contactSource.ts";

test("each public experience has a stable anonymous call source", () => {
  assert.equal(sourceForPublicCall("/horseback-riding-lessons-fairburn-ga", undefined), "lessons_page");
  assert.equal(sourceForPublicCall("/guided-horseback-trail-rides-fairburn-ga/", "hero"), "trail_page");
  assert.equal(sourceForPublicCall("/horseback-riding-special-events-fairburn-ga", "cta"), "events_page");
  assert.equal(sourceForPublicCall("/visit-jds-horse-ranch-fairburn-ga", "directions"), "visit_page");
});

test("home call taps retain only allowed section identifiers", () => {
  assert.equal(sourceForPublicCall("/", "experiences"), "experiences");
  assert.equal(sourceForPublicCall("/", "footer"), "footer");
  assert.equal(sourceForPublicCall("/", "Customer Name"), "navigation");
  assert.equal(sourceForPublicCall("/", "a".repeat(49)), "navigation");
});

test("unknown/private paths and URL payloads never appear in metric sources", () => {
  assert.equal(sourceForPublicCall("/admin/dashboard", "experiences"), "navigation");
  assert.equal(sourceForPublicCall("/booking/customer-secret", "experiences"), "navigation");
  assert.equal(sourceForPublicCall("/guided-horseback-trail-rides-fairburn-ga?phone=123", undefined), "navigation");
  assert.equal(sourceForPublicCall("/another-person/123", undefined), "navigation");
});
