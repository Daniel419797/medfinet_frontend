import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const manifestPath = path.join(projectRoot, "dist", ".vite", "manifest.json");
const workerPath = path.join(projectRoot, "dist", "nfc-service-worker.js");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

function sourceKey(suffix) {
  const key = Object.keys(manifest).find((candidate) => candidate.endsWith(suffix));
  if (!key) throw new Error(`Vite manifest is missing ${suffix}`);
  return key;
}

const mainKey = Object.keys(manifest).find((key) => manifest[key].isEntry);
if (!mainKey) throw new Error("Vite manifest is missing its application entry");
const nfcKey = sourceKey("src/NfcApp.tsx");
const assets = new Set();

function addFile(file) {
  if (file) assets.add(`/${file.replace(/^\//, "")}`);
}

function collect(key, seen = new Set()) {
  if (seen.has(key)) return;
  seen.add(key);
  const entry = manifest[key];
  if (!entry) return;
  addFile(entry.file);
  for (const file of entry.css || []) addFile(file);
  for (const file of entry.assets || []) addFile(file);
  for (const dependency of entry.imports || []) collect(dependency, seen);
}

collect(mainKey);
collect(nfcKey);

const precache = [...assets].sort();
let worker = await readFile(workerPath, "utf8");
const buildHash = createHash("sha256")
  .update(precache.join("\n"))
  .update(worker);
for (const shellFile of [
  "index.html",
  "manifest.webmanifest",
  "medfinet-nfc-icon.svg",
  "medfinet-nfc-icon-192.png",
  "medfinet-nfc-icon-512.png",
  "medfinet-apple-touch-icon.png",
]) {
  buildHash.update(await readFile(path.join(projectRoot, "dist", shellFile)));
}
const buildId = buildHash.digest("hex").slice(0, 12);

if (!worker.includes("/*__MEDFINET_PRECACHE__*/[]")) {
  throw new Error("Service-worker precache marker was not found");
}

worker = worker
  .replace("__MEDFINET_BUILD_ID__", buildId)
  .replace("/*__MEDFINET_PRECACHE__*/[]", JSON.stringify(precache));
await writeFile(workerPath, worker);

console.log(`Prepared Medfinet PWA ${buildId} with ${precache.length} build assets.`);
