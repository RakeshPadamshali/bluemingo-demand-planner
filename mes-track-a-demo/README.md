# MES — Track A Functional Demo

A self-contained, offline, multi-page HTML mockup of a Manufacturing Execution System (MES),
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

Serve the `demo/` folder over HTTP (loading via `file://` will not work — the app uses
`fetch`/relative module loading) and open `app.html`:

```
cd demo
python -m http.server 8817
# then open http://localhost:8817/app.html
```

`app.html` is the tabbed shell (single-page host); every page under `demo/*.html` also works
standalone. There is no build step.

## Layout

- **`demo/`** — the application: one page per section, sharing `demo/assets/`
  (`mes-styles.css` design system, `mes-data.js` seed data, `mes-components.js` UI helpers,
  `mes-shell.js` app shell) with **vendored** Roboto, Font Awesome and ECharts under
  `demo/assets/vendor/` — no CDN calls, safe on an air-gapped network.
- **`eval-deck/`** — the pipeline **scripts** that generate the evaluation deck
  (`build_ppt.py`) and the narrated live-browsing walkthrough video
  (`make_video.py`, plus `shoot.py` / `shots.py` for capture and `video_script.md` for narration).
  The rendered deck (`.pptx`), video (`.mp4`), and screenshots are large binaries and are **not**
  tracked here (see `.gitignore`); regenerate them from these scripts.
