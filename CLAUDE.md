# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this workspace is

This is a **requirements / specification workspace** for the **Quality (QA) module of an MES** (Manufacturing Execution System) being built by Bluemingo for a **stainless-steel long-products manufacturer** (bright bars, rounds, hexes, flats, profiles). It is **not yet a code repository** — there is no source code, build tooling, package manifest, or git history. The three binary documents in the root are the source of truth for what the module must do:

- **`Quality Management - JSW and Ambica .docx`** — the functional requirements for the MES Quality module, grouped by capability area (Inspection, UD & Approvals, Sampling, Salvage, Test Management, RM Quality, TDC, Instruments, Roll Shop). This is the primary spec. End customers referenced are **Ambica Steels** and **JSW**.
- **`TDC & work order Generatiion (1).docx`** — almost entirely screenshots (10 PNGs, minimal text) of the **existing ERP — Microsoft Dynamics AX** (vendor code `asl`, currency INR) Customer-TDC master and Work-Order screens. These are the *reference format to replicate* in the MES ("Available format of TDC from ERP to be copied").
- **`QA LAB format.xlsx`** — 6 sheets of QA-lab screen/data-format mockups **with real sample data**: `Main window`, `Production sample issue`, `Sample report`, `Testing report`, `Testing Entry`, `Raw material inward report`. Use these for exact field names and screen layout.

When work begins, expect this to grow into an actual MES Quality codebase; until then, tasks are about reading/interpreting these specs, not building or testing code. Do not invent build/lint/test commands — none exist.

## Reading the source documents

The `.docx`/`.xlsx` files are binary (zipped XML) and won't read as plain text. Extract with PowerShell (the environment's primary shell):

```powershell
# --- .docx body text ---
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead("$PWD\Quality Management - JSW and Ambica .docx")
$e = $zip.Entries | Where-Object FullName -eq 'word/document.xml'
$r = New-Object System.IO.StreamReader($e.Open()); $xml = $r.ReadToEnd(); $r.Close(); $zip.Dispose()
($xml -replace '<w:tab[^>]*/>',"`t" -replace '</w:p>',"`n" -replace '<w:br[^>]*/>',"`n" -replace '<[^>]+>','') `
  -replace '&amp;','&' -replace '&lt;','<' -replace '&gt;','>'

# --- .xlsx cell text (shared strings) ---
$zip = [System.IO.Compression.ZipFile]::OpenRead("$PWD\QA LAB format.xlsx")
$e = $zip.Entries | Where-Object FullName -eq 'xl/sharedStrings.xml'
$r = New-Object System.IO.StreamReader($e.Open()); $x = $r.ReadToEnd(); $r.Close(); $zip.Dispose()
[regex]::Matches($x,'(?s)<si>(.*?)</si>') | ForEach-Object {
  ($_.Groups[1].Value | Select-String -AllMatches '(?s)<t[^>]*>(.*?)</t>').Matches.Groups | Where-Object Name -eq 1 | ForEach-Object Value }
```

Embedded images live under `word/media/*.png` (the TDC doc) and `xl/media/*.png`. Extract one with `[System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $dest, $true)`, then open it with the Read tool to view it. **The TDC doc's substance is in its 10 screenshots, not its text** — read the images, not just `document.xml`.

## Domain architecture (the big picture)

The Quality module tracks material from raw-material inward through casting, rolling, heat treatment, and bright-bar finishing, enforcing customer specs at every stage. The core objects and their relationships:

```
Sales Order ─▶ Work Order (FPO) ──┬─ has lines, one per Demand UID
                                  └─ each line: attach TDC ▶ Re-Validate TDC ▶ Release
                                     stage status flows  As Cast ▶ As Rolled ▶ As Bright

TDC  (Technical Delivery Conditions) = customer spec overlaid on a standard (e.g. ASTM A 276)
     ├─ chemical comp. min/max per element   ├─ mechanical values
     ├─ dimensions / surface / marking / colour code   └─ HT code (e.g. HT-16 Solution Annealed)

UIDs ─▶ combined into Heats by grade + chemistry (elementwise min/max from TDC) + heat size
Heat ─▶ Sample(s)  ─▶ Test(s)  ─▶ Inspection  ─▶ UD (Usage Decision / clearance)
        (id+barcode)  (YS,UTS,    (chemical, dim,   │
         resampling    Elong,RA,   defect, marking)  ├─ pass ▶ release / next operation
         allowed)      Impact,                       └─ fail ▶ Salvage: resample / reinspect /
                       Hardness…)                              rework / reroute / re-heat-treat
                                                               └─ NCR raised & closed; loss tracked
```

Cross-cutting flows the spec calls out: **TDC change control** (changes initiated by Quality; multi-level approval — Planner → Quality → Plant Head), **RM inward inspection** (accept / retest / return with supplier feedback; RMPO & RMA), **Instrument calibration** (intervals, re-cal alerts, verification checklists), and **Roll Shop** physical roll inspection. Inspection type/sequence is configurable per operation, and a batch may be split (child billets) or consolidated (same order + same results).

## Domain glossary

Terms used throughout the specs (steel-QA / Dynamics-AX terminology):

- **MES** — Manufacturing Execution System (the system being built).
- **TDC** — Technical Delivery Conditions: the binding customer quality spec. Held in a TDC master, attached to Work Orders, validated, and approved in multiple levels.
- **Work Order / FPO** — production order generated per sales order; `FPO Number` is its id; lines are per Demand UID.
- **UID** — unique id per bar/billet/job (e.g. `PE00072`, `B030268`).
- **Heat / Heat No** — a melt batch (e.g. `2526-16496`); UIDs are grouped into heats by grade and chemistry.
- **Grade** — stainless grade: `304L`, `316L`, `416`, `17-4PH`, `X46Cr13`, etc.
- **HT / HTC / HT code** — Heat Treatment / its code (`HT-16` Solution Annealed, `HT-23` Quenched). `HTChartReq` = HT chart required.
- **Execution** — finishing route: Cold Drawn Ground & Polished, Cold Finished, `P.S.Q.`, etc.
- **UD** — Usage Decision: aggregated accept/reject clearance for a batch at a stage (auto-clearance rules, Mass UD by filter).
- **NCR** — Non-Conformance Report (raised and closed during production).
- **Salvage** — rework workflow when results fail (resample, reinspect, rework same/different operation, reroute, re-heat-treat); material loss is tracked.
- **RM / RMPO / RMA** — Raw Material / RM Purchase Order / RM Approval(-Acceptance).
- **Test attributes** — `YS` yield strength, `UTS` ultimate tensile strength, `Elong` elongation, `R.A.` reduction of area, `Impact`, `Hardness`, `GIL`, Macro etch.
- **Shape / size codes** — RO (round), Hex, Flat Bar; sizes like `68 Dia`, `23 Hex`, `100 x 6`.

When adding details, keep field names and codes consistent with `QA LAB format.xlsx` and the Dynamics-AX screenshots — they reflect the customer's actual current system and must map cleanly into the MES.
