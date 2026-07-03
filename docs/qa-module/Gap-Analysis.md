# QA Module — Gap Analysis vs "Quality Management - JSW and Ambica"

Compares the source requirements doc against what we've designed (`Data-Model.md`) and built (`ui/` — 9 static screens).
**Legend:** ✅ Covered · 🟡 Partial (modelled but workflow/engine incomplete) · ❌ Gap (not addressed) · ⬜ Out-of-QA (belongs to another module).

**Headline:** ~12 covered · ~13 partial · ~16 gaps. The core inspection→test→clearance→UD→TDC spine is solid; the gaps are mostly **adjacent workflows** (sampling engine, salvage/NCR, RM, instruments, roll-shop, agencies) that were consciously deferred — now itemised so scope is a decision, not an omission.

---

## Inspection

| # | Requirement | Status | Coverage / Gap |
|---|-------------|--------|----------------|
| 1 | Billet chemical composition entry at Casting | ✅ | Heat Chemistry screen + `mes_qc_heat_chemistry` + `chemistry_type` (Ladle@Casting) |
| 2 | Batch-wise inspection; type+name definition linked to tests & operations; split batch (child billets) own recording | ✅ | `mes_qc_inspection_type`, `mes_qc_stage_qc_map`, inspection anchored to confirmation/batch/`schedule_material_child_id`; Masters screen |
| 3 | Inspection-type **sequence** per operation; different sequence per batch; **manual path override** by authority; track progress; **auto/manual movement to next stage by result** | 🟡 | `stage_qc_map.sequence_no` + `inspection.status` exist; **no per-batch inspection-route state machine / auto-progression engine** |
| 4 | Inspection criteria — which batches need inspection, from **material allocation & order details** | 🟡 | `stage_qc_map` scopes by operation/material-form/sku; **allocation-driven selection not explicit** |
| 5 | Defect recording — type, remarks, severity, **configurable location** | ✅ | `mes_qc_defect_record` + location model + `defect.is_location_required`; Defect-Mapping screen |
| 6 | Material-attribute inspection — dimension, number, marker, bundling capture & validation | ✅ | `mes_qc_inspection_result` (attributes incl. dim/marking/bundling) validated vs TDC |
| 7 | Process-parameter validation → **subsequent salvage instruction** | 🟡 | Process params validated in core; **the →salvage-instruction link not modelled** |
| 8 | Show other defined attributes incl. marking during inspection | ✅ | inspection_result + `mes_global_attributes` |
| 9 | **Warehouse / Yard location confirmation** during inspection | ❌ | No location-confirmation field on inspection |
| 10 | Inspection id gen; **break batch** for partial-qty clearance; **consolidate batches** (same order + same results) | 🟡 | `inspection_number` (gen rules open); batch split/relations exist in core but **QA-driven split-on-partial-clearance & consolidation not modelled** |
| 11 | Batch sequence **with icons** of planned inspections/tests; select batch; **all historical data** | 🟡 | Worklist shows type/status badges; **no batch-journey/sequence visual or explicit history view** |
| 12 | **Inspection agency** definition & linkage; agency schedule; plan vs actual; agency performance | ❌ | No agency master / scheduling / performance |

## UD & Approvals

| # | Requirement | Status | Coverage / Gap |
|---|-------------|--------|----------------|
| 13 | **Combine UIDs → Heats** by Grade + Chemistry (elementwise min-max from TDC) + Heat Size; Quality approval | ⬜ | **Heat formation = Production module (OOS for QA).** QA touchpoints only: chemistry validation (✅ Heat Chemistry), a thin Quality approval gate, Usage Decision (✅). |
| 14 | **Raise & close NCR** during production | ❌ | NCR not modelled |
| 15 | UD aggregated till stage; **drill-downs**; **auto-UD business rules/master**; **Mass UD** by filter | ✅🟡 | `usage_decision`+`_line`, drill-down UI, `is_auto`, Mass-UD stub. **Auto-UD rule engine & Mass-UD are partial** |

## Sampling

| # | Requirement | Status | Coverage / Gap |
|---|-------------|--------|----------------|
| 16 | Sample definition — type, capture operation, **number per heat by order params**, **tests linked to sample type**, id gen & selection at test, **barcode** | 🟡 | `mes_qc_sample` + test selects sample. **Sampling-rule engine, test↔sample-type map, barcode gen not modelled** |
| 17 | **Sample-prep checklist**; step-by-step instructions (Macro etch); **mandatory tests before assigning to test agency** | ❌ | Not modelled |
| 18 | Sample **size & location by order params** | 🟡 | sample has dims/location fields; rule-based sizing not modelled |
| 19 | Sample storage location | ✅ | `sample.storage_location` |
| 20/21 | **Resampling/rework till results pass**; resampling for mechanical fails | 🟡 | `test_record.retest_of_test_record_id` + "Request re-sample"; continue-till-pass loop partial |

## Salvage Actions

| # | Requirement | Status | Coverage / Gap |
|---|-------------|--------|----------------|
| 22 | **Re-heat-treatment** planned if fails after resampling; results validated | ❌ | Salvage/re-HT planning not modelled |
| 24 | Salvage workflows — resample/reinspect/rework (same/diff op)/reroute; **material loss tracked** | ❌ | `defect_record.disposition`+`salvage_operation_id` are hooks only; **no workflow; material loss not tracked** |
| 25 | **Online instant salvage recommendations**; manage inspection status | ❌ | Not modelled |

## Test Management

| # | Requirement | Status | Coverage / Gap |
|---|-------------|--------|----------------|
| 26 | Test definition — attributes, min/max **or value-selection for possible-value attributes**; overall clearance/**failure severity by rules** | ✅🟡 | `test`+`test_attribute` (specimens, aggregate) validated vs TDC. **Discrete/value-selection attributes & severity-rule engine partial** |
| 27 | Test linkage to **inspection type and sample type** | 🟡 | `test_type` exists; test↔sample-type & test↔inspection-type linkage not explicit |
| 28 | Test id (batch-linked) gen; retest same batch same/new sample | ✅ | `test_record` (+ `retest_of`) |
| 29 | **Image & document capture** during test | ❌ | No attachment/image fields |

## RM Quality Inspection

| # | Requirement | Status | Coverage / Gap |
|---|-------------|--------|----------------|
| 30 | Upload/integrate **RM inventory** in inspection | ❌ | Not modelled |
| 31 | **RMPO & RMA** shared with Quality & production head for approval | ❌ | Not modelled |
| 32 | **RM inward** quality+quantity inspection; supplier feedback; accept/retest/**return** workflow | ❌ | Not modelled (RM inward consciously excluded) |

## TDC

| # | Requirement | Status | Coverage / Gap |
|---|-------------|--------|----------------|
| 33 | Review TDC availability, **attach to Work Order**; view TDC details | 🟡 | TDC authoring/view ✅ (tdc.html); **attach-to-WO is Work-Order-side**, not built |
| 34 | Create fresh TDC; changes **initiated by Quality**; elements mapped to **all UIDs in WO**; existing TDCs in master; create-new screen; create/change **by role** | ✅🟡 | TDC creation screen + `mes_tdc_input`/`attr_range`; role-based implied. **Element↔all-UIDs assignment is core** |
| 35 | Planner & Quality acknowledge; **final approval by Plant Head**; multi-level approvals | ✅ | `mes_tdc_approval` (Planner→Quality→Plant Head) + Approval tab |
| 36 | WO created in MES, TDC attached per sales-order release | ⬜ | Work-Order generation = core module |
| 37 | TDC definition — customer spec over standards | ✅ | tdc + chemical/mechanical/dimensional spec |
| 38 | "More JSW requirements to be added" | — | Placeholder — **JSW-specific reqs not yet provided** |

## Instruments

| # | Requirement | Status | Coverage / Gap |
|---|-------------|--------|----------------|
| 39 | Instrument type/list; test↔instrument; calibration intervals (+bias) + **re-cal alerts**; verification checklists | ❌ | Deferred; only a loose `instrument_id` ref on test |
| 40 | Quality feedback to operations + **corrective actions**; issue-resolution workflow (CAPA) | ❌ | Not modelled |

## Roll Shop Quality

| # | Requirement | Status | Coverage / Gap |
|---|-------------|--------|----------------|
| 41 | Physical **roll inspection**; manual report in MES | ❌ | Not modelled |
| 42 | Quality reviews & approves/rejects **allocations** | ❌ | Not modelled |

---

## Gaps grouped, with recommendation

**A — Close next (core QA, high value, fits current model):**
- **Sampling engine** (16–18): sample-type↔test map, sampling rule (number/size/location per heat by order params), barcode, prep-checklist + agency assignment (17).
- **Salvage / Rework / Re-HT workflow** (7, 22, 24, 25): disposition → salvage action → re-test loop, **material-loss tracking**. (Model already has `disposition`/`salvage_operation_id` hooks.)
- **NCR** (14): raise/close non-conformance, link to defects/UD.
- **Image/document capture** (29): attachments on inspection/test/defect.
- **Inspection routing** (3, 4, 10, 11): per-batch inspection sequence/auto-progression, batch split/consolidate, batch-journey view + history.
- **Auto-UD rule engine & Mass-UD** (15): finish beyond flag/stub.
- **Value-selection attributes** (26): discrete-valued characteristics (the platform's `attribute_possible_values` already supports this).
- **Warehouse/yard location on inspection** (9) — small.

**B — Phase 2 (distinct sub-modules):**
- **Instruments & Calibration** (39) + **CAPA / issue resolution** (40).
- **Inspection agencies** (12) + sample test-agency (17).

**C — Adjacent / out-of-QA modules:**
- **Heat formation** (13) — **Production module, confirmed OOS for QA.** QA contributes only chemistry validation (✅ done), a thin Quality approval gate, and UD (✅ done).
- **RM Quality Inspection** (30–32) — RM inward, RMPO/RMA, supplier feedback/return.
- **Roll Shop Quality** (41–42).
- **TDC↔Work-Order attach & WO release** (33, 36) — Work-Order module.
- **MTC / test certificate** — not in this doc, but standard steel-QA output (flagged as an expert addition).

**Pending input:** JSW-specific requirements (#38) are not yet in the doc.

---

## Additional gaps from the TDC/Work-Order doc (Dynamics AX) & QA LAB Excel

These two references are the **format to replicate**. They confirm the gaps above with field-level detail and surface several **new** ones — most importantly, the **TDC is far more complex than we modelled**.

### TDC master — significantly under-modelled (biggest new finding)

| Dynamics-AX TDC feature (observed) | In our design | Status |
|---|---|---|
| Chemical limits in **three tiers — Std / Cus / ASL** (standard default · customer override · effective applied) + a **Print** flag per element | single min/max per element | ❌ model + UI |
| **Standards master** + **"Fill standards" / "Fill Min-Max"** (ASTM A 276 / A 370 / A 388…) to pre-populate the spec | author values directly | ❌ |
| **Per-test-method standards**: Tensile (A 370), Brinell/Rockwell hardness, Charpy impact, Ultrasonic (A 388), Macro etch, IGC, Grain size, Delta ferrite, Degree of purity, Inclusion rating, Ferric-chloride pitting | none | ❌ |
| **HT descriptions 1–3** + Hot-rolling reduction ratio | HT code only | ❌ |
| **Mechanical** richer: proof stress at **RP 0.1 / 0.2 / 1.0**, hardness in **BHN + HRC**, Charpy **L/T orientation + temperature + lateral expansion + shear %**, multi-UOM, Print flags | YS/UTS/EL/RA/Hardness/Impact, single min/max | 🟡 |
| **Remarks Rem-01…09 with print-target flags (SO / WO / HT / BC / TC)** | none | ❌ |
| **Multiple customer grades (Cust grade 1–5)**, customer short code, Customer-TDC-No, print-grade description, grade series/group | single grade | 🟡 |
| **TDC print/report** ("Cust TDC Report") | none | ❌ |
| Release / Block / Unblock / Open / Stopped lifecycle + Approval status | DRAFT…BLOCKED statuses | ✅ mostly |
| Flags: HTChartReq, IBRReport, CE Mark, Eddy current, MPI, Crack test | some as attributes | 🟡 |

### Work Order generation (Dynamics AX) — mostly Work-Order module, with QA touchpoints

| Observed | In our design | Status |
|---|---|---|
| WO (FPO) list + lines; **attach TDC + Re-Validate TDC** + Release / Re-Open | not built (core module) | ⬜ reinforces #33, #36 |
| **Stage statuses As Cast / As Rolled / As Bright** + RMPO / RMA status per WO | stages exist (`mes_operations`) but not surfaced as As-Cast/Rolled/Bright progression | 🟡 |
| Create FPO Lines, Print Work Order | core | ⬜ |

### QA LAB Excel — screens / fields to add

| Sheet → need | In our design | Status |
|---|---|---|
| **Production sample issue** screen: Ht Card No, Grade, Heat No, RM Size, UID, Condition, Issue/Receiving/Completion dates, Sample Len/Pcs/Wt, Testing Req | `mes_qc_sample` entity only | ❌ (reinforces Sampling #16) |
| **Heat summary** view (heat-centric rollup) | none | ❌ |
| **Main window** — QA-lab navigation **by unit/line** (HT · Bright Bar · Profile · Unit-1 · bb/unit-4) + sections (Inward in HT, Casting, Process HT, Testing, Inspection, Dispatch…) | Dashboard partial; no unit/line segmentation | 🟡 |
| **Raw material inward report**: Ht Job Card, Mat Recd Date, WO No, RM Size/Shape, Rect Wt, Pcs, Ok, SD, Oval, S.L, Truck No, Station, UID, Color Code, RM Len | none | ❌ (reinforces RM #30–32) |
| **Sample report** + sample-id taxonomy (SID / CSID / Rid / PPid / Pid), Hold, Issue Type, Challan/RMPO | partial | 🟡 |
| **GIL** (grain / inclusion level) test attribute (in Testing report/entry) | not in mechanical attr set | 🟡 (add attribute) |

### Net-new implications
- **TDC is the most under-modelled object** and needs a dedicated rework: Std/Cus/ASL tiers + Print flags, a **Standards master + fill-from-standard**, per-test-method standards, a richer mechanical spec, remarks-with-print-targets, multi customer-grade, and a TDC print/report. → **expands Task #9** well beyond "Standards master".
- **Sampling** and **RM inward** gaps are now confirmed with exact field sets (Sample-Issue and RM-Inward screens).
- A few small additions: **Heat-summary** view, **unit/line** navigation, **GIL** attribute, sample-id taxonomy.

---

## What is solid (no gap)
Heat chemistry vs TDC · stage-wise inspection (config + recording) · defect recording + **spatial defect mapping** · material-attribute inspection · test management (definition, specimens, aggregate, retest, validate vs TDC) · UD aggregation + drill-down + master-driven decision + multi-level approval · TDC authoring (chemical/mechanical/dimensional) + multi-level approval · clearance gates · QC masters.
