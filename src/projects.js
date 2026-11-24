import releases from './releaseManifest.json' with { type: 'json' };
const asset = (name) => `${import.meta.env?.BASE_URL ?? './'}assets/${name}`;

export const projects = [
  {
    id: 'easyviewer',
    name: 'EasyViewer',
    status: 'available',
    tier: 'paid',
    badge: 'Fab · Paid',
    description: 'Orbit viewer, clickable hotspots and in-game item inspection for Unreal Engine. Blueprint only.',
    image: asset('easyviewer.jpg'),
    imageAlt: 'A low-poly character on a lit pedestal with hotspot rings on the head and chest.',
    platforms: ['Unreal Engine 5.1 – 5.9'],
    plannedPlatforms: [],
    downloadUrl: null,
    storeUrl: 'https://www.fab.com/search?q=EasyViewer',
    storeLabel: 'Get it on Fab',
    gallery: [
      { src: asset('easyviewer/00_overview.jpg'), title: 'EasyViewer 3.0', text: 'Orbit viewer, hotspots, item inspection and turntable. Blueprint only, UE 5.1 – 5.9, mouse, touch and gamepad.', alt: 'EasyViewer screenshot: easyviewer 3.0.' },
      { src: asset('easyviewer/03_hotspot_chest.jpg'), title: 'Focus on a detail', text: 'Click a hotspot and the camera flies to it, then orbit, pan and zoom stay around that spot.', alt: 'EasyViewer screenshot: focus on a detail.' },
      { src: asset('easyviewer/05_turntable.jpg'), title: 'Turntable mode', text: 'Drag on the object to spin it, drag anywhere else to orbit the camera. Works with touch.', alt: 'EasyViewer screenshot: turntable mode.' },
      { src: asset('easyviewer/07_inspect_item.jpg'), title: 'Item inspection', text: 'Pick up an item from gameplay, turn it in your hands and put it back exactly where it was.', alt: 'EasyViewer screenshot: item inspection.' },
    ],
    documentationUrl: '#/docs/easyviewer',
    introduction: 'Turn any object into an interactive showcase. Drop one Blueprint into your level, pick the object and press Play: the camera frames it and your players orbit, pan and zoom with mouse, touch or gamepad.',
    features: [
      ['Orbit viewer', 'Orbit, pan and zoom with smoothing, inertia and automatic framing. The camera never goes below the ground.'],
      ['Hotspots', 'Rings grow and show their name on hover. Click one and the camera flies to that detail and stays around it.'],
      ['Item inspection', 'Call Inspect Item from gameplay: the item flies into the player’s hands, turns freely and goes back exactly where it was.'],
      ['Turntable mode', 'Drag on the object to spin it, drag anywhere else to orbit the camera. Works with touch on mobile.'],
    ],
    support: 'Blueprint only, no code modules. Tested on every Unreal Engine version from 5.1 to 5.9 on Windows, and on Android. Builds for Windows, macOS, Linux, Android and iOS. Paid product, sold and licensed only through Fab.',
  },
  {
    id: 'ez-topology',
    name: 'E-Z Topology',
    status: 'beta',
    tier: 'free',
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
    tier: 'free',
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
    tier: 'free',
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

export const tiers = [
  { id: 'paid', eyebrow: 'Paid · on Fab', title: 'Projects', note: 'Complete, supported projects. Bought and downloaded through Fab.' },
  { id: 'free', eyebrow: 'Free · download here', title: 'Free tools', note: 'Small tools shared for free. Download them right here.' },
];

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

export function getStoreUrl(project) {
  try {
    const url = new URL(project.storeUrl ?? '');
    return url.protocol === 'https:' && url.hostname === 'www.fab.com' ? url.href : null;
  } catch {
    return null;
  }
}

export function filterProjects(items, filter) {
  if (filter === 'available') return items.filter((project) => getDownloadUrl(project) || getStoreUrl(project));
  if (filter === 'development') return items.filter((project) => project.status === 'development');
  return items;
}

export function parseRoute(hash = '') {
  if (hash === '' || hash === '#' || hash === '#/' || hash === '#/tools') return { page: 'tools' };
  if (hash === '#/about') return { page: 'about' };
  if (hash === '#/terms') return { page: 'terms' };
  const documentation = /^#\/docs\/ez-topology(?:\?section=([a-z-]+))?$/.exec(hash);
  if (documentation) return { page: 'documentation', section: documentation[1] ?? null };
  const productDocumentation = /^#\/docs\/(ez-stitchnseam|ez-reference|easyviewer)(?:\?section=([a-z-]+))?$/.exec(hash);
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
