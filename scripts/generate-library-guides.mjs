import { mkdir, writeFile } from 'node:fs/promises';
import { libraryGuides } from '../src/libraryGuides.js';

await mkdir('public/docs', { recursive: true });
for (const guide of Object.values(libraryGuides)) {
  const parts = [
    `# ${guide.title} - User guide`,
    'GOUTAM Lab | 3ds Max 2026 | Free beta preview',
    guide.introduction,
    'Download the free MZP from the tool page on the GOUTAM Lab website and accept the software terms. Drag the MZP into Max to open Install / Repair. Free personal and commercial use; modifying the software requires prior GOUTAM Lab consent.',
    ...guide.sections.map((section) => `## ${section.name}\n\n${section.summary}\n\n${section.steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}\n\n### Settings\n\n| Setting | What it does |\n| --- | --- |\n${section.settings.map(([name, description]) => `| ${name} | ${description} |`).join('\n')}\n\n${section.notes.join('\n\n')}`),
    ...(guide.comingSoon.length ? ['## Coming soon', ...guide.comingSoon.map((name) => `${name}: not available in this beta.`)] : []),
  ];
  await writeFile(`public/${guide.document}`, parts.join('\n\n') + '\n');
}
console.log('Generated independent stitch and reference user guides.');
