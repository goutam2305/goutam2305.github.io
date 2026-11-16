export const termsVersion = '2026-11-16';
export const termsSections = [
  ['Free personal and commercial use', 'You may download, install, use, copy and share the unmodified GOUTAM Lab tools free of charge for personal and commercial work.'],
  ['Permission to modify the software', 'Modifying the software itself requires prior consent from GOUTAM Lab. This includes changing its packaged scripts, libraries or installer.'],
  ['Your projects and outputs', 'You may freely change tool settings and edit, use and share your own project files and generated outputs. The restriction on modifying the software does not restrict your creative work.'],
  ['Ownership', 'GOUTAM Lab retains ownership of its software. The tools are free to use; permission to modify the software is not granted by this license. Separate notices included with third-party components continue to apply to those components.'],
  ['Beta software', 'These tools are beta software and are provided as is, without warranties to the extent permitted by applicable law. Test on copies and keep backups. Nothing in these terms removes rights that cannot lawfully be excluded.'],
];
export const termsText = `GOUTAM Lab Software Terms\nVersion ${termsVersion}\n\n${termsSections.map(([title, body]) => `${title}\n${body}`).join('\n\n')}\n`;
