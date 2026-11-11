const asset = (name) => `${import.meta.env?.BASE_URL ?? './'}assets/${name}`;

export const projects = [
  {
    id: 'ez-topology',
    name: 'E-Z Topology',
    status: 'beta',
    badge: 'Free beta',
    description: 'Retopology tools for 3ds Max. Draw, extend and refine clean quad meshes.',
    image: asset('ez-topology.webp'),
    imageAlt: 'A cream lounge chair transitioning into a clean green quad mesh.',
    platforms: ['3ds Max'],
    plannedPlatforms: ['Maya'],
    downloadUrl: null,
    documentationUrl: '#/docs/ez-topology',
    introduction: 'Take control of your topology. Build a clean, editable mesh over an existing model, from your first quad to connected strips and surface patches.',
    features: [
      ['Draw & extend', 'Place quads, move vertices and extend the borders you choose.'],
      ['Curves & patches', 'Guide the flow with surface curves, strips, contours and connected patches.'],
      ['Select & refine', 'Select edges, adjust loops and relax your cage while it stays on the source surface.'],
    ],
    support: 'Currently being built and tested in 3ds Max 2026. Maya support is planned for a future version.',
  },
];

export const filters = [
  { id: 'all', label: 'All tools' },
  { id: 'available', label: 'Available' },
  { id: 'development', label: 'In development' },
];

export function getDownloadUrl(project) {
  if (!project.downloadUrl) return null;
  try {
    const url = new URL(project.downloadUrl);
    return url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

export function filterProjects(items, filter) {
  if (filter === 'available') return items.filter((project) => getDownloadUrl(project));
  if (filter === 'development') return items.filter((project) => project.status === 'development');
  return items;
}

export function parseRoute(hash = '') {
  if (hash === '' || hash === '#' || hash === '#/' || hash === '#/tools') return { page: 'tools' };
  if (hash === '#/about') return { page: 'about' };
  const documentation = /^#\/docs\/ez-topology(?:\?section=([a-z-]+))?$/.exec(hash);
  if (documentation) return { page: 'documentation', section: documentation[1] ?? null };
  const match = /^#\/tools\/([a-z0-9-]+)$/.exec(hash);
  const project = match && projects.find((item) => item.id === match[1]);
  return project ? { page: 'project', project } : { page: 'not-found' };
}

export function getInitialTheme(storage, systemDark = false) {
  try {
    const saved = storage?.getItem('goutam-lab-theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch { /* Storage is optional, including in restricted browsers. */ }
  return systemDark ? 'dark' : 'light';
}
