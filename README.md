# GOUTAM Lab

An independent portfolio for practical 3D tools. The first project is **E-Z Topology**, a free retopology tool being built for **3ds Max**. Maya support is planned.

Website: https://goutam2305.github.io/ · Documentation: https://goutam2305.github.io/#/docs/ez-topology

## Local preview

Node.js 24 or newer is recommended. No administrator installation is required if Node is already available.

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 4173 --strictPort
```

Open http://127.0.0.1:4173 in your normal browser. The server binds only to your local machine. No VPN, proxy or browser security settings need to change.

## Checks and production build

```sh
npm test
npm run test:ui
npm run test:browser
npm run build
npm run test:sites
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

The deployable static website is **dist/client**, not the entire development folder. The starter also retains an unused Sites worker for hosting portability; GitHub Pages publishes only dist/client.

Browser checks use an isolated standard Chrome through Playwright against localhost. Chrome must already be installed. No custom proxy or browser-security bypass is configured.

## GitHub Pages setup

The website repository is **goutam2305/goutam2305.github.io**. The live site publishes from **main** through GitHub Actions; **feat/goutam-lab-portfolio** retains the development history. The Pages environment allows the exact main branch.

For future updates:

1. Validate the website change locally, then publish the reviewed commit on main.
2. Run **Publish GOUTAM Lab** under Actions, or push a change to main.
3. The workflow builds, tests and deploys only **dist/client**. Its deployment result reports the live URL.
4. Check the deployed site in a normal browser. Future main-branch pushes update it automatically.

Do not upload an unrelated workspace or a tool's development repository. This project intentionally contains no tool code or installers. Repository setup and live publication are separate; a Pages configuration alone does not mean the site is already live.

## Editing projects

Edit **src/projects.js**. Project order in that array is the gallery order. Each project includes a stable id, name, thumbnail, platform lists and public availability. Put website images in **public/assets/**.

- A planned platform belongs in plannedPlatforms, not platforms.
- Until an actual approved public build exists, leave downloadUrl as null.
- After the package, release notes and license are ready, set downloadUrl to its HTTPS release asset URL. The Available filter then includes it automatically.
- UI theme tokens and responsive styling live in **src/styles.css**.
- Header navigation is intentionally limited to Tools and About. Filters are a compact disclosure menu. The footer is copyright and back to top.

## E-Z Topology documentation and recordings

Only E-Z Topology is currently listed. Its product page contains a ten-part tool guide: the nine toolbar tools plus the Patches workflow for connecting boundaries.

- **src/guide.js** is the shared source for the online guide and downloadable Markdown. It describes the current beta's actual settings, controls, workflows and limits.
- **public/demos/** contains real scripted captures of the tool running in 3ds Max 2026. Native viewport, actual cage/guide overlay and actual toolbar captures are composed together. They are not physical mouse recordings or generated animations.
- Every demo has a WebP poster. Visible demos autoplay and loop; offscreen, hidden-tab and print views use still posters. A discreet hover/focus pause icon provides control. Reduced-motion preferences default to still frames with optional explicit animation.
- **src/demoManifest.json** is regenerated from the actual GIF and poster files during build. Missing recordings stop the build.
- **public/docs/E-Z-Topology-Guide.md** is regenerated during build.
- **public/docs/E-Z-Topology-Guide.pdf** is a checked-in printable export. To refresh it, start the local preview and run `node scripts/generate-pdf.mjs`, then commit the resulting PDF. This browser step stays outside the lightweight Pages build.
- Online guide: `#/docs/ez-topology`. Chapter links use `?section=draw`, `?section=patches`, etc., so static hosting supports deep links.

## Assets and dependencies

The gallery cover illustration was generated specifically for this concept and is labeled an illustrative preview. The ten demonstration recordings are actual native tool captures, as described above. Fonts are self-hosted Pixelify Sans and IBM Plex Mono from Fontsource; interface icons are Phosphor. See **THIRD_PARTY_NOTICES.md** for their licenses.

The visual system uses a tinted sticky header, deep red/burgundy footer, blinking logo cursor, restrained entry/hover/tab motion and a documentation reading-progress line. Reduced motion disables decorative animation. Scroll feedback uses an animation-frame scheduler without re-rendering the documentation.

Click the logo's underscore to pause/resume its blink; this preference is remembered. Individual GIFs have discreet pause/resume controls on hover or keyboard focus.

No public license has been selected for the site's original code or the tool packages. Do not imply that a free download is an open-source release.
