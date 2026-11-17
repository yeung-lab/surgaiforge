# surgaiforge.org

Source for the public **SurgAI Forge** website and supporting demos. Deployed at
[surgaiforge.org](https://surgaiforge.org) via GitHub Pages.

## Repo layout

```
.
├── index.html                              Legacy single-page build (archived)
├── CNAME                                   GitHub Pages custom domain
├── SurgAI Forge Gantt Chart/               Internal Gantt view (iframed from the site)
└── SOAR Model Suite Demo Platform/
    ├── SurgAI Forge Website Prototype/     The site — one .dc.html per page
    │   ├── SurgAI Forge Homepage.dc.html
    │   ├── About Us.dc.html
    │   ├── Open Resources.dc.html
    │   ├── For Surgeons.dc.html            Hosts the interactive model demo
    │   ├── For Computer Scientists.dc.html
    │   ├── Papers.dc.html
    │   ├── Support.dc.html
    │   ├── Privacy.dc.html
    │   ├── Terms.dc.html
    │   ├── assets/                         Logos, hero images, team photos
    │   ├── demo-data/                      JSON outputs for the model demo
    │   └── mint-demo/                      Built MINT no-code tour (static)
    ├── mint-demo-source/                   Editable copy of MINT's frontend
    ├── Example Model Outputs/              Case videos (gitignored, see below)
    └── serve.py                            Local dev server w/ HTTP Range support
```

## Run locally

The site is static HTML with a small amount of client-side templating via
`support.js`. The model demo needs HTTP Range requests for video seeking, so
use the bundled `serve.py` rather than plain `python -m http.server`:

```bash
cd "SOAR Model Suite Demo Platform"
python3 serve.py
# then open http://localhost:8000/SurgAI%20Forge%20Website%20Prototype/SurgAI%20Forge%20Homepage.dc.html
```

### Demo videos

The two de-identified case videos used by the model demo are **not** committed
to the repo — GitHub rejects individual files over 100 MB and the redacted
`.mp4`s are 500–700 MB each. They are shipped as **GitHub Release assets**:

- `00304-33607.mp4` (Case A)
- `00625-41653.mp4` (Case B)

To run the demo locally, download them into `Example Model Outputs/`:

```bash
cd "SOAR Model Suite Demo Platform/Example Model Outputs"
gh release download videos-v1 --repo yeung-lab/surgaiforge --pattern "*.mp4"
```

In production the website's `demo-data/manifest.json` points directly at the
release-asset URLs, so viewers don't need local copies.

## MINT demo

The "Demo it" button on the MINT card links to a statically-built, scripted
tour of the MINT desktop app (no uploads, no backend, no inference). Sources
live in `mint-demo-source/` — a standalone copy of MINT's `frontend/` with a
demo API client and upload-gating UI. To rebuild after edits:

```bash
cd "SOAR Model Suite Demo Platform/mint-demo-source"
npm run build:demo
# writes to ../SurgAI Forge Website Prototype/mint-demo/
```

`node_modules/` in `mint-demo-source/` is a symlink back to the real MINT
checkout at `~/Documents/GitHub/mint-iteration3/frontend/node_modules`.

## Content rules

- Do not invent medical outputs, timestamps, dataset counts, paper titles, or
  model metrics. Use `aria-disabled="true"` with a title explaining why for
  links that aren't ready yet.
- Content for public audiences uses "model output", "detected event",
  "example case", "assessment" — not "diagnosis" or "clinical decision
  support".
- The model demo displays **precomputed outputs only**. No inference runs
  in the browser. A persistent note on each demo surface reminds the viewer.

## Deployment

GitHub Pages serves from the repo root on branch `main`. The `CNAME`
file maps the site to `surgaiforge.org`.
