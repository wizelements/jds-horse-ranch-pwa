import test from "node:test";
import assert from "node:assert/strict";
import { dollarsToCents, ranchLocalToIso } from "../lib/ranch.ts";

test("a ranch appointment uses Eastern time in both seasons", () => {
  assert.equal(ranchLocalToIso("2026-12-10T10:30"), "2026-12-10T15:30:00.000Z");
  assert.equal(ranchLocalToIso("2027-07-10T10:30"), "2027-07-10T14:30:00.000Z");
});
test("DST gaps, ambiguous times, and invalid dates cannot move a booking silently", () => {
  for (const value of ["2027-03-14T02:30", "2026-11-01T01:30", "2026-02-30T12:00", "garbage", "2026-11-01T25:00"]) assert.throws(() => ranchLocalToIso(value));
});
test("prices become exact cents and reject rounding, exponents, and out-of-range totals", () => {
  assert.equal(dollarsToCents("85.01"), 8501);
  assert.equal(dollarsToCents("160"), 16000);
  assert.equal(dollarsToCents("0.01", 1), 1);
  for (const value of ["0", "85.001", "1e3", "NaN", "-85", "10000.01", "", "0.99"]) assert.throws(() => dollarsToCents(value));
});
