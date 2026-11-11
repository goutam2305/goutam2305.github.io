import { readFile, stat, writeFile } from 'node:fs/promises';
import { toolGuide } from '../src/guide.js';

const manifest = {};
for (const tool of toolGuide) {
  const src = `demos/${tool.id}.gif`;
  const poster = `demos/${tool.id}.webp`;
  const bytes = await readFile(`public/${src}`);
  if (!/^GIF8[79]a$/.test(bytes.subarray(0, 6).toString())) throw new Error(`Not a GIF: ${src}`);
  await stat(`public/${poster}`);
  manifest[tool.id] = {
    src, poster, width: bytes.readUInt16LE(6), height: bytes.readUInt16LE(8),
    description: tool.result,
  };
}
await writeFile('src/demoManifest.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(`Verified ${Object.keys(manifest).length} recorded GIFs and posters.`);
