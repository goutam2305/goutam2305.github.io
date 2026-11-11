# GOUTAM Lab

An independent portfolio for practical 3D tools. The first project is **E-Z Topology**, a free retopology tool being built for **3ds Max**. Maya support is planned.

## Local preview

Node.js 24 or newer is recommended. No administrator installation is required if Node is already available.

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 4173 --strictPort
```

Open http://127.0.0.1:4173 in your normal browser. The server binds only to your local machine. No VPN, proxy, browser security settings or browser automation is needed.

## Checks and production build

```sh
npm test
npm run test:ui
npm run build
npm run test:sites
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

The deployable static website is **dist/client**, not the entire development folder. The starter also retains an unused Sites worker for hosting portability; GitHub Pages publishes only dist/client.

## GitHub Pages setup

The website repository is **goutam2305/goutam2305.github.io**. The first version is backed up on **feat/goutam-lab-portfolio**. Pages is configured to use GitHub Actions. Live publication is held for the first normal-browser visual review.

After that review:

1. Publish the reviewed website commit on main and make main the default branch.
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

## Assets and dependencies

The three project illustrations were generated specifically for this concept; they are not screenshots of real tool output. They are labeled illustrative previews on the detail pages. Fonts are self-hosted Pixelify Sans and DM Sans from Fontsource; interface icons are Phosphor. See **THIRD_PARTY_NOTICES.md** for their licenses.

No public license has been selected for the site's original code or the tool packages. Do not imply that a free download is an open-source release.
