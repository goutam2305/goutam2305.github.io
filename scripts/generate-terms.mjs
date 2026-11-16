import { mkdirSync, writeFileSync } from 'node:fs';
import { termsText } from '../src/terms.js';
mkdirSync(new URL('../public/docs/', import.meta.url), { recursive: true });
writeFileSync(new URL('../public/docs/GOUTAM-Lab-Software-Terms.txt', import.meta.url), termsText, 'utf8');
console.log('Generated GOUTAM Lab software terms.');
