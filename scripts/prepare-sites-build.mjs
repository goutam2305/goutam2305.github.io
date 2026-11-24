#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { catalog } from "../src/projects.js";
import { libraryGuides } from "../src/libraryGuides.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const index = path.join(dist, "client", "index.html");
const worker = path.join(root, "worker", "index.js");
const hosting = path.join(root, ".openai", "hosting.json");

for (const file of [index, worker, hosting]) {
  if (!existsSync(file)) throw new Error("Missing Sites build input: " + file);
}

// Installers and guides of hidden tools stay in public/ but are never published.
for (const project of catalog.filter((item) => item.hidden)) {
  const guide = libraryGuides[project.id]?.document;
  for (const file of [project.release && `downloads/${project.release.fileName}`, guide].filter(Boolean)) {
    rmSync(path.join(dist, "client", file), { force: true });
    console.log("Not published (hidden tool): " + file);
  }
}

mkdirSync(path.join(dist, "server"), { recursive: true });
mkdirSync(path.join(dist, ".openai"), { recursive: true });
copyFileSync(worker, path.join(dist, "server", "index.js"));
copyFileSync(hosting, path.join(dist, ".openai", "hosting.json"));

console.log("Prepared Sites build: dist/server/index.js and dist/.openai/hosting.json");
