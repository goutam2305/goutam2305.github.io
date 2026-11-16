import releases from './releaseManifest.json' with { type: 'json' };
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
  {
    id: 'ez-stitchnseam',
    name: 'E-Z StitchNSeam',
    status: 'beta',
    badge: 'Free beta',
    description: 'Editable 3D stitches along your splines. One stitch set, one selectable object.',
    image: asset('ez-stitchnseam.svg'),
    imageAlt: 'Illustration of curved stitch patterns along an upholstered surface.',
    platforms: ['3ds Max'],
    plannedPlatforms: [],
    downloadUrl: null,
    documentationUrl: '#/docs/ez-stitchnseam',
    introduction: 'Draw the path. Shape the thread. Create live 3D stitches along one or several splines, then refine the pattern and dimensions from a single object.',
    features: [
      ['Eight stitch patterns', 'Straight, Cross, Double, Zigzag, Herringbone, Blanket, Arched and Bridge, with Round or Flat thread.'],
      ['Live control', 'Edit source splines, adjust dimensions and placement, or apply settings to selected source rows.'],
      ['One object per set', 'Keep dense stitch sets manageable with Fast output, then convert deliberately to Editable Poly.'],
    ],
    support: 'Prepared and tested for 3ds Max 2026 on Windows. Automatic thread materials need supported V-Ray classes; geometry does not. Seam and hole generation are coming soon.',
  },
  {
    id: 'ez-reference',
    name: 'E-Z Reference',
    status: 'beta',
    badge: 'Free beta',
    description: 'Drop an image, set its real size and create a reference plane in your scene.',
    image: asset('ez-reference.svg'),
    imageAlt: 'Illustration of calibrated front and side reference-image planes.',
    platforms: ['3ds Max'],
    plannedPlatforms: [],
    downloadUrl: null,
    documentationUrl: '#/docs/ez-reference',
    introduction: 'Keep your reference where you model. Drop an image, choose a view and enter a known measurement. E-Z Reference creates a calibrated image plane with its proportions intact.',
    features: [
      ['Drop & preview', 'Load PNG, JPEG, TIFF or BMP images in a modeless Max window.'],
      ['Six views, true proportions', 'Choose Front, Back, Left, Right, Top or Bottom and calibrate by width or height.'],
      ['Keep references organised', 'Select, lock and restore planes, with image copies stored beside an ordinary saved scene.'],
    ],
    support: 'Prepared for 3ds Max 2026 on Windows. Save a local .max scene first. Linked/network image workflows are not included in this beta.',
  },
].map(project => {
  const release = releases[project.id];
  return { ...project, release, downloadUrl: release ? `${import.meta.env?.BASE_URL ?? './'}downloads/${release.fileName}` : null };
});

export const filters = [
  { id: 'all', label: 'All tools' },
  { id: 'available', label: 'Available' },
  { id: 'development', label: 'In development' },
];

export function getDownloadUrl(project) {
  if (!project.downloadUrl) return null;
  if (/^(?:\.\/|\/)downloads\/[A-Za-z0-9][A-Za-z0-9._-]*\.mzp$/.test(project.downloadUrl)) return project.downloadUrl;
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
  if (hash === '#/terms') return { page: 'terms' };
  const documentation = /^#\/docs\/ez-topology(?:\?section=([a-z-]+))?$/.exec(hash);
  if (documentation) return { page: 'documentation', section: documentation[1] ?? null };
  const productDocumentation = /^#\/docs\/(ez-stitchnseam|ez-reference)(?:\?section=([a-z-]+))?$/.exec(hash);
  if (productDocumentation) return {
    page: 'product-documentation',
    project: projects.find((item) => item.id === productDocumentation[1]),
    section: productDocumentation[2] ?? null,
  };
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
