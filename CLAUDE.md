# surgaiforge.org: how the site is built and deployed

## Deployment (changed Nov 16, 2026)

- GitHub Pages source is **GitHub Actions**, not "deploy from branch".
- On every push to `main`, `.github/workflows/pages.yml` runs
  `scripts/build-site.sh`, which assembles the public site into `_site/`
  and deploys it. Only what's in `_site/` is live.
- The root `index.html` (redirect stub) and `index-legacy.html` (old
  single-page site) are **no longer served**. They're kept only for
  history.
- Don't change the workflow file or the Pages settings unless
  explicitly asked.

## Where to edit

- Source pages: `SOAR Model Suite Demo Platform/SurgAI Forge Website Prototype/*.dc.html`
- Edit those files in place. Do not move or rename them; the build
  handles public URLs.
- Local dev still works:
  ```bash
  cd "SOAR Model Suite Demo Platform" && python3 serve.py
  ```

## URL mapping (done by the build)

| Source file | Public URL |
|---|---|
| SurgAI Forge Homepage.dc.html | `/` |
| About Us.dc.html | `/about` |
| Open Resources.dc.html | `/open-resources` |
| For Surgeons.dc.html | `/for-surgeons` |
| For Computer Scientists.dc.html | `/for-computer-scientists` |
| Papers.dc.html | `/papers` |
| Support.dc.html | `/support` |
| Privacy.dc.html | `/privacy` |
| Terms.dc.html | `/terms` |

- In source, keep linking between pages with the original relative form,
  e.g. `href="About%20Us.dc.html#team"`. The build rewrites these to
  clean URLs (`/about#team`), and the relative form keeps local dev
  working.
- The build also generates redirect stubs at the old long URLs
  (`/SOAR%20Model%20Suite%20Demo%20Platform/SurgAI%20Forge%20Website%20Prototype/<Page>.dc.html`),
  so old shared links keep working.

## Adding a new page

1. Create `<Name>.dc.html` in the Prototype folder (copy an existing
   page for structure).
2. Add `"<Name>|<slug>"` to the `PAGES` array in
   `scripts/build-site.sh`.
3. Link to it from other pages as `<Name with %20>.dc.html`.
4. Each page must be self-contained (its own `<x-dc>` block, loads
   `./support.js`). Don't make one page import another as a component:
   the runtime fetches siblings by their original `.dc.html` filename,
   which doesn't exist in the built site.

## Assets and folders

- The build copies only: `assets/`, `demo-data/`, `mint-demo/`,
  `support.js`, plus `CNAME` and the `SurgAI Forge Gantt Chart/` folder
  (at its same path).
- If you add a new top-level folder or file the pages need (e.g.
  `fonts/`, `papers-data/`), add it to the `cp -R` line in
  `scripts/build-site.sh` or it will 404 on the live site.
- Use relative paths (`assets/foo.png`, `demo-data/x.json`). Pages sit
  at the site root, so these resolve correctly.

## MINT demo

- `mint-demo/` is a static build from `mint-demo-source/`
  (`npm run build:demo`).
- Its build uses absolute paths starting with
  `/SurgAI Forge Website Prototype/mint-demo/`. `build-site.sh` rewrites
  those to `/mint-demo/`. If you change the Vite `base` or how links
  back to the site are written, check that the rewrite in
  `build-site.sh` still matches.

## Videos

- Demo case videos (500 to 700 MB each) are GitHub Release assets
  (`videos-v1`), never committed. `demo-data/manifest.json` points at
  the release URLs.

## Before pushing

- Run `bash scripts/build-site.sh` from the repo root and check
  `_site/`. Serve it with a server that maps `/about` to `about.html`
  (GitHub Pages does this automatically).
- Add `_site/` to `.gitignore` if it isn't there yet.
- After pushing, the deploy shows up under the repo's Actions tab
  ("Deploy site to GitHub Pages") and takes about 20 seconds.

## Content rules

Follow the "Content rules" section in `README.md` (no invented medical
outputs or metrics; demos show precomputed outputs only).
