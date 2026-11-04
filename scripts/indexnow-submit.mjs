#!/usr/bin/env node
// IndexNow is for participating search engines, not Google Search.
// Submit only new or materially changed URLs after confirming live deployment.
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const ORIGIN = "https://jdshorseranch.codewithsolo.com";
const HOST = new URL(ORIGIN).host;
const ENDPOINT = "https://api.indexnow.org/indexnow";
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const all = args.includes("--all");
const changed = args.filter((a) => a.startsWith("--changed=")).map((a) => a.slice("--changed=".length));

if ((all && changed.length) || (!all && !changed.length)) {
  console.error("Usage: npm run indexnow:submit -- --all [--dry-run] OR --changed=/path [--changed=/another] [--dry-run]");
  process.exit(2);
}
const files = (await readdir(resolve("public"))).filter((f) => /^[a-f0-9]{32}\.txt$/.test(f));
if (files.length !== 1) throw new Error("Expected exactly one valid IndexNow key file in public.");
const key = (await readFile(resolve("public", files[0]), "utf8")).trim();
if (key !== files[0].slice(0, -4)) throw new Error("IndexNow key does not match published filename.");

const siteUrls = async () => {
  const response = await fetch(ORIGIN + "/sitemap.xml", { signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error("Public sitemap not ready: HTTP " + response.status);
  const xml = await response.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  if (urls.length < 1 || urls.length > 10000) throw new Error("Sitemap is unexpectedly empty or oversized");
  for (const url of urls) {
    const parsed = new URL(url);
    if (parsed.origin !== ORIGIN || parsed.search || parsed.hash) throw new Error("Unexpected sitemap URL origin or query");
    if (/^\/(api|admin|booking|ranch-login)(\/|$)/.test(parsed.pathname)) throw new Error("Private URL found in sitemap");
  }
  return urls;
};

const allUrls = await siteUrls();
const selected = all ? allUrls : changed.map((path) => new URL(path, ORIGIN).href);
if (!selected.length || new Set(selected).size !== selected.length) throw new Error("No URLs or duplicate URLs in submission");
for (const url of selected) {
  if (!allUrls.includes(url)) throw new Error("URL not in current public sitemap: " + url);
}
const keyLocation = ORIGIN + "/" + files[0];
const verify = await fetch(keyLocation, { signal: AbortSignal.timeout(10000) });
if (!verify.ok || (await verify.text()).trim() !== key) throw new Error("IndexNow host ownership file not yet live");

const payload = { host: HOST, key, keyLocation, urlList: selected };
console.log("Verified current public sitemap, key ownership, exact host and selected routes:", selected.length);
if (dryRun) {
  console.log("DRY RUN; no submission sent. Pages:", selected.map((u) => new URL(u).pathname).join(", "));
  process.exit(0);
}
const response = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(payload),
  signal: AbortSignal.timeout(12000),
});
if (![200, 202].includes(response.status)) {
  const message = (await response.text()).slice(0, 400).replace(key, "[redacted]");
  throw new Error("IndexNow submission failed HTTP " + response.status + ": " + message);
}
console.log("IndexNow URLs received: HTTP " + response.status + "; received is NOT an indexing or ranking guarantee");
