# MES — Track A Functional Demo

A self-contained, offline, single-page HTML mockup of a Manufacturing Execution System (MES),
covering **Track A (A1–A7)** end-to-end for an integrated steel works
(SMS-2 melt shop → HSM-2 hot strip mill):

- **A1** Integrated Scheduling & Order Management
- **A2** Operations Management & Production Tracking
- **A3** Quality Management (sampling, chemistry, testing, inspection, defects, usage decision, salvage/NCR, certificates)
- **A4** Yard Management (SYMS slab yard, CYMS coil yard)
- **A5** MIS Reports & Dashboards
- **A6** System Integration (SAP SD/PP/QM/PM/MM, Level-2 PDI/PDO)
- **A7** Security & Access Control

## Run

```
cd demo
python serve.py            # -> http://localhost:8080/   (override port: python serve.py 3000)
```

Open **http://localhost:8080/**. The app is a single-page app with **clean client-side routes** —
the address bar shows `/scheduling`, `/quality/inspection`, `/reports`, … (no `.html`, no query
strings). Deep-links and browser refresh work because `serve.py` falls back to the app shell for
unknown routes.

(A plain static server such as `python -m http.server` also works for click-through navigation, but
a refresh on a deep route would 404 — use `serve.py` for full single-page-app behaviour.)

## Layout

- **`demo/`** — the application. `index.html` is the SPA host (persistent header / sidebar / tabs +
  one iframe per open module, switched with zero reload) and the History-API router. Shared
  `demo/assets/` (`mes-styles.css`, `mes-data.js`, `mes-components.js`, `mes-shell.js` = shell +
  router) with **vendored** Roboto, Font Awesome and ECharts under `demo/assets/vendor/` — no CDN,
  air-gap-safe. `demo/serve.py` is the SPA dev server.
- **`eval-deck/`** — pipeline **scripts** for the evaluation deck (`build_ppt.py`) and the narrated
  walkthrough video (`make_video.py`, `shoot.py`, `shots.py`) plus `video_script.md`. The rendered
  `.pptx` / `.mp4` / screenshots are large binaries and are **not** tracked (see `.gitignore`).
