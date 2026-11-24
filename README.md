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

Do not upload an unrelated workspace or a tool's development repository. Only the three audited public MZP distributions belong in public/downloads; private source, development folders and loose tool runtimes stay outside this repository. Repository setup and live publication are separate; a Pages configuration alone does not mean the site is already live.

## Editing projects

Edit **src/projects.js**. Project order in that array is the gallery order. Each project includes a stable id, name, thumbnail, platform lists and public availability. Put website images in **public/assets/**.

- A planned platform belongs in plannedPlatforms, not platforms.
- src/releaseManifest.json lists the three approved public MZP files, sizes, versions and SHA-256 hashes. Local /downloads URLs deliver files without sending visitors to a repository page. The Available filter includes these approved betas.
- Download consent uses the versioned software terms. Acceptance is remembered locally; no email collection, account or newsletter is enabled in this release. The terms are also installed with each tool.
- UI theme tokens and responsive styling live in **src/styles.css**.
- Header navigation is intentionally limited to Tools and About. Filters are a compact disclosure menu. The footer is copyright and back to top.

## E-Z Topology documentation and recordings

EasyViewer and E-Z Topology are listed. E-Z StitchNSeam and E-Z Reference are marked `hidden: true` in src/projects.js: they have no card, page or route, and their installer and guide are left out of the published build. To bring one back, remove `hidden`, name it in src/terms.js (and raise termsVersion), and run every test suite. Topology contains a ten-part tool guide; the other products have independent settings/workflow guides.

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

The workshop scene uses separate generated raster layers for its repeatable ivy rails, wall hardware, rope and irregular mossy stone pavement. It grows with the real project catalog; the extra cards in design concepts are not published projects.

The live Chrome preview uses `npm run preview:browser` after the dev server is running. Its native viewport follows the actual window, including maximizing/resizing, rather than emulating a fixed screenshot size. The page hides the root scrollbar track while wheel, touch, keyboard and document scrolling remain available.

Pull the lamp's brass handle downward, click that handle or activate it with the keyboard to switch themes. The shade separately supports drag/release and arrow-key nudges with bounded pendulum motion. The cord and rope divider spring back. Pull or click the hanging All projects tag beside Tools to open filters. The navigation, lamp and rope share one seamless sticky workshop frame, with a continuous backdrop and ivy supports. Projects use clipped workshop sheets, a paperclip and status stamps; ordinary page scrolling moves them below the full-size lamp. Mobile has a compact frame from the start, without scroll-driven shrinking.

Dark mode shows a visible illuminated bulb, warm continuous falloff on the wall and pavement, amber material highlights and directional 2D shadows responding to the lamp angle. Light has no finite bitmap cone endpoint. Five of the seven fireflies orbit the lit lamp at different radii and speeds, while two wander; membership rotates. Project and documentation pages hide wall bricks and keep all fireflies in the canopy so reading surfaces stay clear.

One fixed, pointer-transparent light field spans both the header and content, including project pages; it uses viewport coordinates, while individual object highlights/shadows use document coordinates. This avoids a light cutoff at the rope. The rope's local shadow is deliberately soft and narrow. The pipe below the logo occasionally emits a small steam puff and shudders. Both hanging wrenches support cursor drag/release and keyboard nudges with damped return. The clock has real-time hands and a swinging pendulum. Steam/clock timers and wrench frames stop for hidden pages and reduced motion. Small mobile layouts retain the lamp and omit the extra hardware to keep the compact frame usable.

The workshop mechanic travels along the sagging rope and descends beside hovered or keyboard-focused projects. He can tighten bolts, tap with a hammer, inspect through a magnifier, adjust his helmet, weld unfinished/beta projects, reconsider or sit and rest. Work actions avoid consecutive repetition. Optional thought/speech bubbles stay attached to his head above the scenery and avoid the lamp. After inactivity he can occasionally visit and physically pull the lamp cord; a 120-second switch cooldown and 45-second human-activity guard (including wheel and touch scrolling) protect direct control. Scroll/reflow retarget his route, projects leaving view return him to the rope, and hidden tabs preserve his position/request. The two eight-pose helmeted sheets are temporary behaviour artwork: the user's final likeness still needs a photo.

There is no header scene-pause control; reduced motion and hidden tabs automatically stop decorative motion and physics. Existing logo cursor and GIF controls remain independent. Mechanic decisions and dialogue run locally, with no AI service or network requests.

The free E-Z beta tools are free for personal and commercial use; modifying them requires prior GOUTAM Lab consent. EasyViewer is a paid product, sold and licensed only through Fab, and is not covered by these terms. Settings, projects and generated outputs may be freely edited and used. See public/docs/GOUTAM-Lab-Software-Terms.txt and src/terms.js. This is not an open-source license; the site's original code has no additional public modification grant.
