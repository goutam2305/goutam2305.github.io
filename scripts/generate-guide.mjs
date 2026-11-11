import { mkdir, writeFile } from 'node:fs/promises';
import { feedback, gettingStarted, guideDate, guideVersion, limitations, sharedSettings, shortcuts, toolGuide, troubleshooting } from '../src/guide.js';

const table = (rows) => '| Control | What it does |\n| --- | --- |\n' + rows.map(([name, text]) => `| ${name.replaceAll('|', '\\|')} | ${text.replaceAll('|', '\\|')} |`).join('\n');
const numbered = (items) => items.map((item, index) => `${index + 1}. ${item}`).join('\n');
const text = [
  '# E-Z Topology — User guide',
  `Beta ${guideVersion} · ${guideDate} · 3ds Max 2026`,
  'Maya support is planned, not included in this beta. Current beta commands may still be labeled Retopology.',
  '## Getting started',
  ...gettingStarted.map(([title, body], index) => `### ${index + 1}. ${title}\n\n${body}`),
  'Strips and paired rails create geometry automatically. A green patch is a preview: Enter confirms it.',
  '## Viewport feedback', table(feedback),
  ...toolGuide.map((tool) => `## ${tool.name}\n\n${tool.summary}\n\n${tool.toolbar ? `This workflow uses ${tool.toolbar}.\n\n` : ''}[View the recorded example](https://goutam2305.github.io/#/docs/ez-topology?section=${tool.id})\n\n${tool.result}\n\n### How to use it\n\n${numbered(tool.steps)}\n\n### Settings and controls\n\n${table(tool.settings)}\n\n### Keep in mind\n\n${tool.notes.join('\n\n')}`),
  '## Shared settings', 'Right-click the active tool or click Settings. Open Surface / Display for shared controls.', table(sharedSettings),
  'Numeric edits apply on Enter or focus loss. Esc discards an unconfirmed numeric edit and closes the popup.',
  '## Shortcut reference', table(shortcuts),
  '## Troubleshooting', ...troubleshooting.map(([title, body]) => `### ${title}\n\n${body}`),
  '## Current limits', limitations.map((item) => `- ${item}`).join('\n'),
  'Examples are recorded in a separate 3ds Max scene using scripted input to the actual beta tools. They demonstrate individual operations, not a complete production model.',
].join('\n\n') + '\n';
await mkdir('public/docs', { recursive: true });
await writeFile('public/docs/E-Z-Topology-Guide.md', text);
console.log(`Generated user guide: ${toolGuide.length} workflows, ${sharedSettings.length} shared settings, ${shortcuts.length} shortcuts.`);
