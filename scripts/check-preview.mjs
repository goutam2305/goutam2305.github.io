import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const preview = process.argv[2] ?? 'http://127.0.0.1:4173/';
const response = await fetch(preview);
assert.equal(response.status, 200);
const html = await response.text();
assert.ok(html.includes('Tools — GOUTAM Lab'));
for (const filename of ['ez-topology.webp']) {
  const asset = await fetch(new URL(`assets/${filename}`, preview));
  assert.equal(asset.status, 200, filename);
  assert.ok(asset.headers.get('content-type').startsWith('image/'), filename);
  const bytes = (await asset.arrayBuffer()).byteLength;
  assert.ok(bytes > 1000, filename);
  console.log(`OK ${filename}: ${bytes} bytes`);
}
for (const filename of ['docs/E-Z-Topology-Guide.md', 'docs/E-Z-Topology-Guide.pdf']) {
  const attachment = await fetch(new URL(filename, preview));
  assert.equal(attachment.status, 200, filename);
  assert.ok((await attachment.arrayBuffer()).byteLength > 1000, filename);
}

const publicFiles = await readdir('dist/client', { recursive: true, withFileTypes: true });
let count = 0;
for (const entry of publicFiles) {
  if (!entry.isFile()) continue;
  const filename = path.join(entry.parentPath, entry.name);
  assert.ok(!/\.(?:py|pyc|ms|mcr|exe|zip|pem|key)$/i.test(filename), `Unexpected public file: ${filename}`);
  if (/\.(?:html|js|css|txt|json)$/i.test(filename)) {
    const contents = await readFile(filename, 'utf8');
    assert.ok(!/GMatheswaran|Ashley|C:\\Users\\|C:\/Users\//i.test(contents), `Private workspace text in ${filename}`);
  }
  count++;
}
console.log(`OK local HTTP and public-file audit: ${count} deployable files, no tool packages or private workspace paths.`);
