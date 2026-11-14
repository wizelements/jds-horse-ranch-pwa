import assert from "node:assert/strict";
import test from "node:test";
import { isUsableSessionSecret } from "../lib/sessionSecret.mjs";

test("rejects missing, short, and hardcoded session secrets", () => {
  assert.equal(isUsableSessionSecret(undefined), false);
  assert.equal(isUsableSessionSecret(null), false);
  assert.equal(isUsableSessionSecret(""), false);
  assert.equal(isUsableSessionSecret("   "), false);
  assert.equal(isUsableSessionSecret("short-secret"), false);
  assert.equal(isUsableSessionSecret("dev-secret-change-in-prod"), false);
  assert.equal(
    isUsableSessionSecret("temporary-dev-secret-key-change-in-production"),
    false
  );
});

test("accepts a long operator-supplied secret", () => {
  assert.equal(
    isUsableSessionSecret("local-test-secret-not-used-in-any-deployment-01"),
    true
  );
});
