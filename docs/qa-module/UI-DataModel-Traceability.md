# Bluemingo MES v2 — QA Module: UI ↔ Data-Model Traceability

**Purpose.** Reconcile every QA UI screen and workflow against the data model (`Data-Model.md`) so implementation can start with a build-ready map: for each screen, which tables it reads/writes, the columns behind each field, the operation per action, and how each workflow threads the tables. Gaps found during this pass are consolidated in the **Gap Register** (§ end); data-model gaps have been fixed in `Data-Model.md`, UI-only gaps are listed as follow-ups.

**Date:** 2026-07-14 · **Refreshed:** 2026-07-16 · **Scope:** 15 functional screens + 28 master screens (43 files) vs 74 `mes_qc_*` tables + 4 views.

> **Refresh 2026-07-16.** Two waves landed after the original pass and are folded in below:
> 1. **12 stakeholder scope points** — TDC Copy (`copied_from_tdc_id`), TDC-scoped sampling rules (`sampling_rule.tdc_id`), sample draw position (`sample.draw_position`), size-basis master (`mes_qc_size_basis`), RM inward 3-stage Inspection→Testing→UD (`sample.rm_receipt_id`, `usage_decision.rm_receipt_id`, RM status `TESTING`), grade-chemistry works spec (`mes_qc_grade_chemistry` §5.9), inspection mode (`inspection.inspection_mode` ONLINE/OFFLINE), plan-vs-actual lab equipment (`sample_test.instrument_id` / `test_record`+`test_result.instrument_id`), camera-as-instrument defect capture (`attachment.instrument_id`+`captured_at`), Bulk UD (`mass_ud_ref`), Re-UD (`supersedes_ud_id`).
> 2. **Chemistry separation** — chemistry now has its own dictionary **`mes_qc_element` (§5.10)** referenced at every chemistry touchpoint; `mes_global_attributes` serves **non-chemistry** characteristics only. Shared spec tables carry `attribute_id` **xor** `element_id`. The element master owns both wide mappings directly: `column_reference` → `mes_qc_heat_chemistry` columns, `tdc_range_ref` → `mes_tdc_attr_range` RA_n.

## How to read

- **Op** — `READ` (display/filter), `CREATE` / `UPDATE` / `DELETE` (persist), `DERIVED` (computed at read time, not stored).
- Tables are `mes_qc_*` unless noted; `§n` cites the `Data-Model.md` section. Core platform tables (`mes_batches`, `mes_schedule_material_childs`, `mes_operations`, `mes_global_attributes`, `mes_tdc_input`, `mes_units`, `mes_customers`) are reused, not re-defined.
- **Two dictionaries (D1):** every chemistry reference maps to `mes_qc_element` (§5.10); `attribute_id`→`mes_global_attributes` appears only for non-chemistry characteristics. Where a mapping below says `attribute_id` for a chemical row, read `element_id` (the xor rule).
- **Snapshot** = value copied onto the row at creation (e.g. spec min/max) for fast, immutable reporting; **denormalized** = a convenience copy of a value owned elsewhere (`heat_number`, `material_number`, `grade` — see `Data-Model.md` §2).
- Gap tags in the register: **[DM-FIXED]** applied to the data model this pass · **[UI]** column exists, screen must expose it (UI follow-up) · **[DECISION]** derivable/platform-level, documented not added.

## Coverage at a glance

| Workflow area | Screen(s) | Primary tables |
|---|---|---|
| Configuration | `masters.html` + 28 `master-*.html` | §5 lookups + config (incl. §5.9 `grade_chemistry`, §5.10 `element`), §7.5.1/.3/.5/.6, §11.3/.4, §12.1/.2, §13.1, §14.1, §15.1, `mes_global_attributes` (non-chemistry) |
| TDC | `tdc.html` | §11.1–11.12 (`mes_tdc_input`, `tdc_limit`, `standard*`, `tdc_*`) |
| RM Quality | `rm-inward.html` | §13 (`rm_receipt`, `rm_inspection`, `rm_inspection_result`, `supplier_feedback`) + §7.1 (`sample.rm_receipt_id`) + §10.1 (`usage_decision.rm_receipt_id`) — 3-stage Inspection→Testing→UD |
| Sampling | `sample-issue.html` | §7.1 + §7.5 (`sample`, `sampling_rule`, `sampling_rule_test`, `sample_test`, `sample_prep_*`, `agency`) |
| Testing | `test-entry.html` | §7.2/7.3 (`test_record`, `test_result`) + §5.2/5.3, §9.1, §10.3, §11 |
| Chemistry | `heat-chemistry.html` | §7.4 (`heat_chemistry`, columns via `element.column_reference`) + §5.9 (`grade_chemistry`), §5.10 (`element`), §5.6/5.8, §9.1, §11 |
| Inspection | `qc-worklist.html` | §6 (`inspection`, `inspection_result`) + §5.5, §8.1, §9.1, `v_qc_worklist` |
| Defects | `defect-mapping.html` | §8.1 (`defect_record`) + §12.6 (`attachment`) |
| Clearance | `clearance.html` | §9.1 (`clearance`) + §10.3 (`approval`) |
| Usage Decision | `usage-decision.html` | §10 (`usage_decision`, `_line`, `approval`) + §9.1, §12 |
| Salvage / NCR | `salvage-ncr.html` | §12 (`salvage_type*`, `ncr*`, `salvage`, `capa`, `attachment`, `fg_recall*`) + §5.7 |
| Instruments | `instruments.html` | §14 (`instrument*`, `calibration*`, `instrument_verification`) |
| Certificate / MTC | `certificate.html` | §16 (`certificate`, `_line`, `_heat`) + §11, §7.3/7.4 |
| Dashboards/MIS | `dashboard.html` | §17 views (`v_qc_inspection`, `v_qc_test_result`, `v_qc_defect`, `v_qc_worklist`) |

---

# 1. Configuration — Master screens

`masters.html` is a tile launcher (no table). Each `master-*.html` is a template-generated CRUD screen over one table. Every master shares the audit tail (`active_status`, `created_by/date`, `updated_by/date`, `version_id`).

| Master screen | Table (§) | Key columns | Notes |
|---|---|---|---|
| master-inspection-type | `inspection_type` (§5.1) | code, name, category, result_basis, default_capture_source | category/result_basis/default_capture_source exist — expose on form (UI) |
| master-test-type | `test_type` (§5.1) | code, name, category | `category` exists — expose (UI) |
| master-chemistry-type | `chemistry_type` (§5.1) | code, name | LADLE/PRODUCT/CHECK |
| master-defect-type | `defect_type` (§5.1) | code, name | |
| master-defect-reason | `defect_reason` (§5.1) | code, name | |
| master-sample-status | `sample_status` (§5.1) | code, name | PLANNED/DRAWN/ISSUED/IN_PREP/TESTED/CONSUMED/RETAINED/HOLD |
| master-material-status | `material_status` (§5.1) | code, name, **blocks_dispatch** | blocks_dispatch added (DM) |
| master-ud-type / -reason / -action | `ud_type` / `ud_reason` / `ud_action` (§5.1) | code, name; ud_action.material_status_id | |
| master-ncr-category | `ncr_category` (§12.2) | code, name | |
| master-salvage-type | `salvage_type` (§12.1) | code, name, routes_to, requires_target_operation, is_rework, is_terminal, default_material_status_id | `is_rework` exists — expose (UI) |
| master-instrument-type | `instrument_type` (§14.1) | code, name | |
| master-roll-type | `roll_type` (§15.1) | code, name | Screen exists; parked (removed from nav) |
| master-supplier | `supplier` (§13.1) | supplier_code, supplier_name, supplier_type, rating, is_approved | fully maps |
| master-agency | `agency` (§7.5.6) | agency_code, agency_name, agency_type, **scope, accreditation** | scope/accreditation added (DM) |
| master-standard | `standard` (§11.3) | standard_code, standard_name, standard_year, standard_type | |
| master-standard-limit | `standard_limit` (§11.4) | standard_id, grade, attribute_id, min_value, max_value, uom_unit_id, target_value | |
| master-sample-type | `sample_type` (§7.5.1) | type_code, type_name, category, default_length/pieces/weight/width/thickness, barcode_required | |
| master-characteristic | `mes_global_attributes` (core) | code, name, family (MECHANICAL/DIMENSIONAL/NDT/PROCESS), uom, column_reference | Shared core dictionary — **non-chemistry only**; chemistry moved to the Element master (D1) |
| master-size-basis | `size_basis` (§5.1) | code, name (BY_LENGTH/BY_WEIGHT/BY_PIECES/FULL_SECTION) | Referenced by `sampling_rule.size_basis_id` |
| master-grade-chemistry | `grade_chemistry` (§5.9) | grade, **element_id**→`mes_qc_element`, min/max/aim_value, uom | Works spec tier: TDC → GRADE → report-only |
| master-element | **`element` (§5.10 — the chemistry dictionary)** | element_code (symbol), element_name, sequence_no, uom, decimals, **column_reference** (heat-chemistry wide col), **tdc_range_ref** (`mes_tdc_attr_range` RA_n) | THE chemistry reference everywhere; RA_1–RA_14 seeded |

**Config-heavy masters (field-level):**

*master-test* → `test` (§5.2) header + `test_attribute` (§5.3) child grid: code→test_code, name→test_name, type→test_type_id, **method→method_standard** (added DM), sample-based→sample_required; child: attribute→attribute_id, UoM (derived), min/max→default_min/default_max, #spec→no_of_specimens, aggregate→aggregate_rule.

*master-defect* → `defect` (§5.4): code/name, type→defect_type_id, reason→defect_reason_id, severity→default_severity, **location model→default_location_type** (added DM); `auto_hold` + `use_for_inspection/test/ud` exist — expose on form (UI).

*master-stage-qc-map* → `stage_qc_map` (§5.5): operation_id, material_form_id, qc_kind, inspection_type_id|test_id, attribute_id, limit_source, fixed_min/max, is_mandatory, sequence_no; `product_category_id`/`sku_id`/`capture_source` exist — expose (UI).

*master-standard-limit* → `standard_limit` (§11.4): standard_id, grade, attribute_id, min_value/max_value/target_value, uom_unit_id.

*master-sampling-rule* → `sampling_rule` (§7.5.3) + `sampling_rule_test` (§7.5.2): operation_id, material_form_id, grade, **tdc_id (optional TDC scope — TDC-specific rule wins)**, sample_type_id, **sampling_basis select (PER_HEAT/PER_LOT/PER_N_PIECES — exposed 2026-07-16)**, samples_count/qty_basis, **size_basis_id select (master-driven)**, location_rule; tests → child `sampling_rule_test.test_id`.

*master-prep-checklist* → `sample_prep_checklist` + `sample_prep_step` (§7.5.5): the two-level header(code/name/sample_type_id/test_id) + steps(sequence_no/instruction/is_mandatory) model exists; the screen currently stores flat rows — align UI to the 2-level model (UI).

---

# 2. TDC — `tdc.html`

*Author/manage Technical Delivery Conditions: customer spec over standard(s), 3-tier limits, test-method standards, print-targeted remarks, customer-grade mappings, multi-level approval.*

| UI element / action | Table.column(s) | Op | Notes |
|---|---|---|---|
| List search / row (TDC no · customer · grade · status) | `mes_tdc_input.tdc_no/customer_id/grade/status` | READ | |
| New TDC | `mes_tdc_input` (status=DRAFT) | CREATE | |
| **Copy** (modal: new no / customer / grade) | `mes_tdc_input.copied_from_tdc_id` + deep-copied children (limits / standards / tests / remarks / customer-grades) | CREATE | New **independent** DRAFT TDC — ≠ the `parent_tdc_id` revision chain; "Copied from" badge |
| Header: no / status / **Rev** | `.tdc_no`, `.status`, `.revision_no` | READ | |
| New revision | `mes_tdc_input`(parent_tdc_id, revision_no+1, reason) | CREATE | §11.1 chain |
| Block / Unblock | `.status` (BLOCKED↔RELEASED) | UPDATE | |
| std-strip: primary / other chips | `.primary_standard_id`; `mes_qc_tdc_standard` (§11.5) | READ | |
| **Fill standards** | `mes_qc_standard_limit` (§11.4) → `mes_qc_tdc_limit`(tier=STANDARD) | CREATE | |
| **Fill Min/Max** | `mes_qc_tdc_limit`(tier=APPLIED) → project `mes_tdc_attr_range` | DERIVED | APPLIED = CUSTOMER else STANDARD; chemical rows project to `RA_n` via **`element.tdc_range_ref`** (§11.10) |
| General: customer/short code/cust TDC no | `.customer_id`, `.customer_short_code`, `.customer_tdc_no` | R/W | |
| General: item category, grade series/group, shape, execution, htc_code, size_range_text | `mes_tdc_input.*` | R/W | |
| General: HT chart / IBR / CE flags | `.ht_chart_req`, `.ibr_report`, `.ce_mark` | R/W | |
| General: customer grades (# / code / name) + add/✕ | `mes_qc_tdc_customer_grade` (§11.7) | R/W/CREATE/DELETE | |
| Chem: element | `mes_qc_tdc_limit.element_id`→**`mes_qc_element`** (§5.10) | READ | 1 UI row = 3 tier rows; chemical rows use the element dictionary |
| Mech: property | `mes_qc_tdc_limit.attribute_id`→`mes_global_attributes` | READ | non-chemistry characteristics |
| Chem/Mech: UOM | `.uom_unit_id`→`mes_units` | READ | |
| Chem/Mech: Standard / Customer min-max | `mes_qc_tdc_limit`(tier=STANDARD/CUSTOMER).min_value/max_value | R/W | |
| Chem/Mech: Applied (effective) | `mes_qc_tdc_limit`(tier=APPLIED) | DERIVED | validation reads APPLIED only (D2/D4) |
| Chem/Mech: **Print** checkbox | `mes_qc_tdc_limit.print_flag` | UPDATE | authoritative on APPLIED tier (decision) |
| Dimensional: size/tol/roughness/straightness/OOR/chamfer/marking/colour/bundle wt | `mes_qc_tdc_limit` attribute rows (`min/max/target_value`, `text_value` for qualitative) | R/W | needs dictionary entries (data) |
| Dimensional: Eddy/MPI/UT req | `mes_qc_tdc_test_standard.is_required` (§11.6) | R/W | |
| Tests & Standards: method / standard / required / remark / add | `mes_qc_tdc_test_standard` (§11.6) | R/W/CREATE | |
| Remarks: text + SO/WO/HT/BC/TC targets + add | `mes_qc_tdc_remark` + `mes_qc_tdc_remark_target.document_type` (§11.8) | R/W/CREATE/DELETE | |
| Approval: level/role/approver/status/date/remarks | `mes_tdc_approval` (§11.11) | READ | |
| Submit for approval | `mes_tdc_input.status`=PENDING_APPROVAL | UPDATE | |
| Approve (Level N) | `mes_tdc_approval.status`=APPROVED; all → `mes_tdc_input.status`=APPROVED/RELEASED | UPDATE | |

**Workflow.** New TDC(DRAFT) → pick standards `tdc_standard` → Fill standards (`standard_limit`→`tdc_limit` STANDARD) → customer overlay (CUSTOMER + `print_flag`) → Fill Min/Max (APPLIED → project `mes_tdc_attr_range`) → Submit → per-level `tdc_approval` (Planner→Quality→Plant Head) → RELEASED. Released APPLIED limits feed validation snapshots + MTC print.

---

# 3. RM Quality — `rm-inward.html`

*Inspect incoming raw material vs the RM spec, then Accept / Retest / Return-to-supplier with feedback/SCAR.*

| UI element / action | Table.column(s) | Op | Notes |
|---|---|---|---|
| Filter / meta | `mes_qc_rm_receipt.*`, `mes_qc_rm_inspection.decision` | READ/DERIVED | |
| Grid: GRN / date / RMPO / supplier / sup.heat / material / grade / form / size / qty / pcs / TC | `mes_qc_rm_receipt.grn_number, received_date, rmpo_number, supplier_id→name, supplier_heat_no, material_number, grade, material_form_id, size_text, received_qty, received_pieces, supplier_tc_no/received` | READ | §13.2 |
| Grid: RM spec (TDC) | `.tdc_id`→`mes_tdc_input.tdc_no` (else `standard_id`) | READ | |
| Grid: Result / Decision / RM No / Status | `mes_qc_rm_inspection.result/decision/rma_number`; `rm_receipt.status` | READ | |
| Inspect: characteristic / spec min-max (+src) / actual / OK? | `mes_qc_rm_inspection_result.attribute_id, min_spec/max_spec, **spec_source**, result_value/text_value, is_ok` | R/CREATE/DERIVED | spec_source added (DM) |
| Inspect: Mill TC received | `rm_receipt.supplier_tc_received` | UPDATE | |
| Inspect: Decision / RM number / remarks | `mes_qc_rm_inspection.decision, rma_number, remarks` (+ material_status_id) | CREATE | |
| Inspect: supplier feedback / SCAR (RETURN) | `mes_qc_supplier_feedback.feedback_text, scar_number` (§13.5) | CREATE | |
| Save decision | `mes_qc_rm_inspection`; `rm_receipt.status` (+batch_id on ACCEPT) | CREATE/UPDATE | |
| Mill-TC popup / attach | `mes_qc_attachment`(entity_type=**RM_RECEIPT**) | R/CREATE | entity_type extended (DM) |
| Receive & queue | `mes_qc_rm_receipt`(status=RECEIVED, tdc_id) | CREATE | TDC via required picker |
| **3-stage stepper** (Inspection → Lab testing → RM UD) | `rm_receipt.status` (RECEIVED/UNDER_INSPECTION → 1; **TESTING** → 2; ACCEPTED/RETEST/RETURNED → 3) | DERIVED | stage from status |
| Stage 1: **Complete inspection** (recommendation ACCEPT-CANDIDATE / SEND TO TESTING / RETURN) | `rm_inspection.decision` (now the inspection-stage recommendation); SEND TO TESTING → `rm_receipt.status=TESTING` | UPDATE | |
| Stage 2: **Samples panel** (planned/tested RM samples + Receive lab results) | `mes_qc_sample.rm_receipt_id` (§7.1) → standard Sampling/Test Entry §7 | READ/CREATE | no RM-local test tables |
| Stage 3: **Record RM Usage Decision** (ACCEPT/RETEST/RETURN + RMA no.) | `mes_qc_usage_decision.rm_receipt_id` (§10.1); `rm_inspection.rma_number` on ACCEPT | CREATE | drives final `rm_receipt.status` |
| Grid: **UD** column (RMUD no) | `usage_decision` on the RM lot | READ | |

**Workflow (3-stage, §13.6).** Receive→`rm_receipt`(RECEIVED) → **1. Inspect**→`rm_inspection`+`rm_inspection_result` (recommendation) → **2. Testing** (status=TESTING; samples via `sample.rm_receipt_id` → standard Test Entry / Heat Chemistry) → **3. RM UD** (`usage_decision.rm_receipt_id`): ACCEPT(rma_number, status=ACCEPTED, +internal batch_id→heat formation) / RETEST(status=RETEST) / RETURN(status=RETURNED → `ncr`(nc_against=SUPPLIER)+`supplier_feedback` SCAR).

---

# 4. Sampling — `sample-issue.html`

*Draw, barcode, prep & assign samples for testing per the sampling rule, with a per-heat PLANNED-coverage strip.*

| UI element / action | Table.column(s) | Op | Notes |
|---|---|---|---|
| Plan strip: heat/grade, op chips+counts, planned total | `mes_qc_sample.heat_number/batch_id/operation_id`; count incl. status=PLANNED (§5.1) | DERIVED | |
| Filters (search/op/status/type/agency) | `.sample_number/heat_number/material_number, operation_id, sample_status_id, sample_type_id, agency_id` | READ | |
| Grid: Sample No / barcode | `.sample_number / barcode` (§7.1/§7.5.4) | READ | empty until generated |
| Grid: Ht Card / Heat / Operation / UID | `.ht_card_no, heat_number/batch_id, operation_id, material_number/schedule_material_child_id` | READ | |
| Grid: **RM Size** | `mes_qc_sample.rm_size` | READ | added (DM) |
| Grid: Type / Condition / Issue / Recv / Completion / Len / **Pcs** / Wt | `.sample_type_id, condition, issue_date, received_date, completion_date, sample_length, **sample_pieces**, sample_weight` | READ | sample_pieces added (DM) |
| Grid: Testing Req (+edited tag) | `.testing_required` + `mes_qc_sample_test` diff vs rule (§7.5.7/.2) | READ/DERIVED | |
| Grid: Agency / Status | `.agency_id→name; sample_status_id` | READ | |
| Row: Prep checklist | `mes_qc_sample_prep_record` (§7.5.5) | R/UPDATE | |
| Toolbar: **Generate IDs & barcodes** | UPDATE `.sample_number/barcode/sample_status_id` (PLANNED→DRAWN) | UPDATE | sticker print external |
| Toolbar: Issue Sample | CREATE `mes_qc_sample` | CREATE | |
| Issue modal: lot / type / condition / ht card / issue date / length / pieces / weight / agency | `mes_qc_sample.*` (type defaults from `sample_type` §7.5.1) | CREATE | |
| Issue modal: **Draw location** (readonly) | `mes_qc_sampling_rule.location_rule` via sampling_rule_id | READ | |
| Issue modal: **Position** select (HEAD/MID/TAIL) + grid **Pos** column | `mes_qc_sample.draw_position` | CREATE/READ | default parsed from the rule's location text |
| Issue modal: **Equipment per checked test** | `mes_qc_sample_test.instrument_id` (§7.5.7) | CREATE | **planned** equipment, filtered by test kind; actual recorded at Testing |
| Issue modal: **TDC rule / Generic rule** chip | `mes_qc_sampling_rule.tdc_id` | DERIVED | TDC-scoped rule wins (most-specific), generic rule = fallback |
| Issue modal: **Tests to perform** (RULE/TDC tags) | `mes_qc_sample_test`(test_id, source, is_selected); defaults from `sampling_rule_test` (§7.5.2) + `tdc_test_standard` (§11.6) | READ/CREATE | structured (DM) |
| Prep modal: steps / toggle / mark complete | `mes_qc_sample_prep_step` (read); `mes_qc_sample_prep_record` (create/update); `sample.sample_status_id`/`completion_date` | R/CREATE/UPDATE | |

**Workflow.** Rule matched (op/form/grade/type) → PLANNED `sample` rows (drive plan strip) + `sample_test` plan → Generate IDs (barcode; PLANNED→DRAWN) → Issue (type/condition/ht_card/dims/agency; status=ISSUED) → Prep (`sample_prep_record`) → Test Entry consumes it (`test_record.sample_id`); chemical → `heat_chemistry`.

---

# 5. Testing — `test-entry.html`

*Lab entry of mechanical/metallurgical results on a drawn sample — per-attribute specimens (or per-lab columns) aggregated and validated vs the resolved TDC limit (else test-master default), then cleared or held.*

| UI element / action | Table.column(s) | Op | Notes |
|---|---|---|---|
| List / state badge | `mes_qc_sample.sample_number/heat_number`; `test_record.status/overall_result` + `clearance.result` | READ/DERIVED | |
| Chips: Heat/Material/Grade/TDC | denorm + `test_record.tdc_id`→`mes_tdc_input` | READ | |
| Chip: **HT** / **Orientation** | `sample.condition` / `test_record.specimen_orientation` | READ | orientation added (DM) |
| Chip: Source | `test_record.capture_source` (L2/MANUAL/INSTRUMENT) | READ/DERIVED | |
| Grid: Attribute / Unit | `test_result.attribute_id`→`mes_global_attributes`; `.uom_unit_id`→`mes_units` | READ | set per `test_attribute` (§5.3) |
| Grid: Valid range (+src tag) | `test_result.min_spec/max_spec/spec_source` (snapshot) | DERIVED→snapshot | TDC APPLIED else `test_attribute.default_min/max` |
| Grid: Specimen 1..N (spec mode) | `test_result.value_num` (specimen_seq 1..N) | C/UPDATE | N = `test_attribute.no_of_specimens`; unused greyed |
| Grid: lab columns (lab mode) | `test_result.value_num` + **`agency_id` / `source_label`** (device code appended) | C/UPDATE | multi-lab (DM) |
| **Equipment** chip (planned · actual, warn on mismatch) | planned `mes_qc_sample_test.instrument_id`; actual `mes_qc_test_record.instrument_id` + per-reading `mes_qc_test_result.instrument_id` | READ/UPDATE | plan-vs-actual traceability; actual set on import/receive/save |
| (element-wise readings, e.g. PMI) | `mes_qc_test_result.element_id`→`mes_qc_element` | CREATE | normalized element spot values; bulk heat chemistry stays wide (D4) |
| Grid: Aggregate / Result | `test_result.aggregate_value` (rule=`test_attribute.aggregate_rule`); `.result` | DERIVED→snapshot | |
| Toolbar: Import from instrument | `test_record.capture_source=INSTRUMENT, instrument_id`; `test_result.value_num` | U/CREATE | |
| Toolbar: Receive · <lab> | `test_result` rows for that lab | CREATE | cross-lab agg |
| Save / Overall | `test_record.status=DRAFT`, `test_result.*`; `.overall_result` | C/U/DERIVED | |
| Request re-sample | `test_record.retest_of_test_record_id`; new `sample` | CREATE | |
| Record test clearance (PASS) | `mes_qc_clearance`(clearance_type=MECHANICAL, CLEARED, test_record_id, tdc_id) | CREATE | |
| Put on hold → **Hold-reason** modal | `clearance.result=HOLD` + `hold_reason` (+`hold_reason_id`→`mes_hold_reasons`) | CREATE | hold_reason_id added (DM) |

**Workflow.** Select sample → `test_record`(test_id, sample_id, tdc_id) → per attribute `test_result` rows (specimen_seq, value_num, snapshot min/max/spec_source) → aggregate + result → `overall_result`. PASS→`clearance` CLEARED; FAIL→hold-reason modal→`clearance` HOLD. Multi-lab: each lab reports every attribute (`agency_id`), cross-lab aggregate → final vs TDC.

---

# 6. Chemistry — `heat-chemistry.html`

*Heat-level composition (Ladle/Product/Check) from L2 or manual, validated element-by-element vs the heat's TDC (non-TDC elements report-only); OOS auto-holds the heat and opens a corrective-action modal.*

| UI element / action | Table.column(s) | Op | Notes |
|---|---|---|---|
| List / state badge | `heat_chemistry.heat_number/batch_id/sample_id`; `.result` + `clearance.result` | READ/DERIVED | |
| Chips: Grade / **TDC** / Sample / Cast / Furnace / **Lab** / Source | grade (derived); `heat_chemistry.tdc_id`, `.sample_id`, `mes_batches`, **`.agency_id`**, `.capture_source` | READ | tdc_id + agency_id added (DM) |
| Chemistry-type tabs (Ladle/Product/Check) | `.chemistry_type_id`→`mes_qc_chemistry_type` | READ/CREATE | one row per (heat, chemistry_type) |
| Grid: Element / Unit | wide `.c_value/mn_value/…`; element set + column names from **`mes_qc_element`** (§5.10, `column_reference`) | READ | |
| Grid: src tag (**TDC / GRADE / REPORT**) + legend | TDC = `mes_qc_tdc_limit` element row; GRADE = `mes_qc_grade_chemistry` (§5.9); else report-only | DERIVED | resolution: TDC APPLIED → grade-chemistry → report-only |
| GRADE-limit validation (pass/fail + OOS auto-hold) | `mes_qc_grade_chemistry.element_id` min/max | DERIVED | GRADE rows validate exactly like TDC rows; corrective modal names "works grade spec" |
| Grid: TDC Spec (min-max) | `mes_qc_tdc_limit`(APPLIED) / `mes_tdc_attr_range` (§11.10) | READ | live (not snapshotted on wide row) |
| Grid: Actual | `.<element>_value` (+ capture_source=MANUAL on edit) | C/UPDATE | |
| Grid: Result (per element) | computed vs limit | DERIVED | persisted result is overall only (decision) |
| Toolbar: Import from L2 / Save | `.<element>_value`, `.capture_source=L2`, `.result` | C/UPDATE | OOS→auto-hold |
| Footer: Overall / Record clearance (PASS) | `.result`; `clearance`(CHEMISTRY, CLEARED, batch_id, tdc_id) | DERIVED/CREATE | |
| Footer: Put heat on hold (FAIL) / auto-hold | `clearance.result=HOLD` (+hold_reason); `mes_inventory_holds` | CREATE/UPDATE | |
| Corrective modal: recommended actions (Step/Station/Detail) | `mes_qc_corrective_action` (§5.6): action_text, target_operation_id, scope=ATTRIBUTE, attribute_id, deviation_dir, step_no | READ | |
| Corrective modal: notifications sent | `mes_qc_corrective_action.notify_roles` | READ | sent-event = platform notification (decision) |
| Corrective modal: **Apply corrective action** | `mes_qc_corrective_action_applied` (§5.8): corrective_action_id, clearance_id, attribute_id, applied_by/date, resample_sample_id, outcome | CREATE | applied-transaction added (DM) |

**Workflow.** Select heat → chemistry-type tab → Import L2 / type actuals → `heat_chemistry`(per (heat,type): `<element>_value`, capture_source, sample_id, tdc_id) → per-element result vs TDC → overall `result`. PASS→`clearance` CHEMISTRY/CLEARED. OOS→auto-hold→modal reads `corrective_action` by failing `attribute_id`+`deviation_dir`; **Apply**→`corrective_action_applied`(+resample) → re-clear.

---

# 7. Inspection — `qc-worklist.html`

*Union worklist of inspection + test records per production-confirmation lot, with inline result capture, defect recording, grouping, and salvage hand-off.*

| UI element / action | Table.column(s) | Op | Notes |
|---|---|---|---|
| Grid: QC No | `inspection.inspection_number` ∪ `test_record.test_record_number` | READ | UNION → `v_qc_worklist` (§17) |
| Grid: Confirmation / Seq / Stage | `inspection.confirmation_id`→`mes_production_confirmation`; `stage_qc_map.sequence_no`; `.operation_id` | READ/DERIVED | |
| Grid: Kind / Type | `stage_qc_map.qc_kind`; `inspection.inspection_type_id` / `test_record.test_id` | READ/DERIVED | |
| Grid: Heat / Material / Grade / Form | `.heat_number, material_number/schedule_material_child_id, grade (denorm §2), material_form_id` | READ | |
| Grid: Result / Status / Date / Inspector | `.overall_result`; `status` ⊕ `clearance.result`; `.inspection_date`; `.inspected_by`/agency | READ/DERIVED | |
| Grid: **Mode** column/badge + filter (ONLINE/OFFLINE) | `mes_qc_inspection.inspection_mode` (default from `stage_qc_map.default_inspection_mode` §5.5) | READ | ONLINE = in-line L2/gauge; OFFLINE = bench; modal shows a Mode chip + "auto (L2)" hint when ONLINE |
| Toolbar: Raise Inspection (incl. **Mode** select) | `mes_qc_inspection` (+`inspection_mode`) | CREATE | ad-hoc/re-inspection; mode defaulted by QC-item kind |
| Row: Inspection group / View / Record / Edit | group by `confirmation_id`; `inspection`(+result/defects) | READ/UPDATE | |
| Row: **Raise Salvage / NCR** | `mes_qc_ncr`(source inspection_id) via deep-link | CREATE | writes on salvage screen |
| Record modal: characteristic / unit / spec min-max (+src) | `inspection_result.attribute_id, uom_unit_id, min_spec/max_spec, spec_source` | READ | snapshot from TDC APPLIED else default |
| Record modal: Actual / meas.source / result | `inspection_result.value_num/value_text, capture_source, result` | C/U/DERIVED | tests→`test_result`; chem→`heat_chemistry` |
| Defects subgrid: defect/severity/qty/location/position/disposition | `mes_qc_defect_record.*` (§8.1) | CREATE/DELETE | disposition incl DOWNGRADE |
| Foot: Overall / Remarks / Save | `inspection.overall_result/remarks`; roll up `clearance` | DERIVED/U/CREATE | CRIT/MAJOR defect ⇒ FAIL |

**Workflow.** Confirmation at a QC-required op (active `stage_qc_map` rows) → generate QC items (`inspection` per INSPECTION row; `test_record` via `sample` per TEST row) → Record: `inspection_result`/`test_result`/`heat_chemistry` (min/max/spec_source snapshot) + `defect_record` → `overall_result` → roll up `clearance` → feeds `usage_decision_line`. Fail/Hold → Raise Salvage/NCR.

---

# 8. Defects — `defect-mapping.html`

*Spatially plot defect records via the generic location model (linear bars / XY plate surfaces), review in a table, attach evidence.*

| UI element / action | Table.column(s) | Op | Notes |
|---|---|---|---|
| Left list (UID / heat·grade·form + count) | `defect_record` grouped by piece; `v_qc_defect` (§17) | READ/DERIVED | |
| Detail chips / map location-type / face | `.operation_id`, `.location_type` (G3), `.position_ref` | READ/DERIVED | linear vs SURFACE_XY by form |
| Map: markers (X/Y, colour) | `.position_1, position_2, position_ref, severity` | READ | |
| Map: meta (length/width/Ø) | piece geometry via `mes_schedule_material_childs` (through `v_qc_defect`) | READ | decision: exposed via view |
| Table: Defect / Severity / Location / **Detected by** / Disposition / Delete | `.defect_id→name, severity, position_*, **detection_source**, disposition` | READ/DELETE | detection_source (MANUAL/ONLINE_GAUGE/CAMERA/NDT/LAB) |
| Gallery: thumbnails / view / caption / **Attach file** | `mes_qc_attachment`(entity_type=DEFECT, doc_type=PHOTO, caption) (§12.6) | READ/CREATE | marker overlay from `defect_record.position_*` |
| Gallery: **Capture from camera** (device pick + live frame + Capture) | `mes_qc_attachment.instrument_id` (camera = `mes_qc_instrument`, type CAMERA) + `captured_at`; caption carries the device code | CREATE | camera integration; detected-by=Camera hints suggest a capture |
| Add-defect modal: defect/severity/disposition/detected-by | `defect_record.defect_id, severity, disposition, detection_source` | CREATE | |
| Add-defect modal: location type (auto)/position 1/position 2/face | `.location_type, position_1, position_2, position_ref, location_uom_unit_id` | CREATE | form-adaptive (linear hides Y/face) |
| Save defect | `mes_qc_defect_record` (auto detected_at) | CREATE | standalone log anchors on batch/child |

**Workflow.** Defect from inspection (`defect_record.inspection_id`) / test (`test_record_id`) / direct log (`batch_id`/`schedule_material_child_id`) → generic location (`location_type`+`position_*`) → plotted via `v_qc_defect` → evidence → `attachment`(DEFECT) → `defect.auto_hold` may hold → `disposition` routes to Salvage/NCR.

---

# 9. Clearance — `clearance.html`

*Release material per Work Order → Stage → per-dimension quality gate, with acceptance-under-deviation.*

| UI element / action | Table.column(s) | Op | Notes |
|---|---|---|---|
| Stat chips (cleared/pending/hold/orders) | rollups of `clearance.result` | DERIVED | PENDING = no row where `stage_qc_map` applicable |
| WO list: FPO / **SO** / customer / grade / heat / qty | `clearance.work_order_no, sales_order_no` (DM); `tdc.customer_id`→name; `.heat_number`; `mes_batches` qty | READ | WO/SO denorm added (DM) |
| Order-state badge | rollup `clearance.result` | DERIVED | |
| Matrix: stage + op | `clearance.operation_id`→`mes_operations` | READ | As Cast/Rolled/Bright |
| Matrix: Chemistry/Mechanical/Physical/UT cell | one `clearance` row per `clearance_type`; cell = `.result` | READ | N/A = no `stage_qc_map` row |
| Matrix: Stage clearance / release | rollup; release = `clearance_type=FINAL` (decision) | DERIVED/CREATE | |
| Modal: Result / Cleared by / Remarks | `clearance.result, cleared_by, cleared_date, remarks` | CREATE/UPDATE | REJECTED value = FAIL |
| Modal: **Hold reason** (when HOLD) | `clearance.hold_reason` (+`hold_reason_id`) | CREATE | **UI: add the field** |
| AUD panel: deviation/concession ref (when CONDITIONAL) | `clearance.deviation_ref` | CREATE | enforced |
| AUD panel: approval chain (Planner→Quality→Plant Head) | `mes_qc_approval`(entity_type=CLEARANCE) (§10.3) | R/CREATE | |
| Save / Release stage | `clearance` (+`approval` if CONDITIONAL) | CREATE/UPDATE | |

**Workflow.** Record gate → `clearance`(result, cleared_by/date, remarks). CONDITIONAL → +`deviation_ref` +`approval`(Planner→Quality→Plant-Head). HOLD/REJECTED → disposition → `ncr`→`salvage`. All gates cleared → stage READY → release (`clearance_type=FINAL`) → order released.

---

# 10. Usage Decision — `usage-decision.html`

*Aggregate all clearances for a heat/lot → accept/reject/conditional/rework/downgrade with a TDC release-check, reason & action.*

| UI element / action | Table.column(s) | Op | Notes |
|---|---|---|---|
| Lot list / readiness badge | `usage_decision.heat_number`; rollup `clearance.result` | READ/DERIVED | |
| **Bulk / Mass UD** modal (filters: grade/stage/READY-only → preview + select lots → one shared decision) | one `usage_decision` per lot, all stamped with a shared `mass_ud_ref` (MUD-…) | CREATE | decided lots excluded; CONDITIONAL-in-bulk requires a deviation ref; "BULK · MUD-…" tag on summaries |
| **Re-UD** action + **Decision history** (CURRENT / SUPERSEDED chain) | new `usage_decision` row with `supersedes_ud_id` → prior UD; latest in chain = current; approval re-applies | CREATE/READ | replaces the old reset-style Revise; lot status follows the newest UD |
| Detail: **Type** (Heat/Slab/Coil/Bar) | `mes_material_forms.name` via batch/child | DERIVED | kind-aware (§10.1) |
| Detail: Grade/TDC/UID/Qty/**Order**/material status | `tdc.grade/tdc_no`; `schedule_material_child_id`; `usage_decision.sales_order_no/work_order_no` (DM); `.material_status_id` | READ | WO/SO denorm added (DM) |
| Action: AUD / Raise Salvage-NCR | AUD modal; deep-link `mes_raise_ncr` | —/READ | |
| Clearance summary (dimension/stage/records/result) | `clearance`(clearance_type, operation_id, result) + `inspection_id`/`test_record_id` | READ | feeds `usage_decision_line` |
| Release check: Property/Measured/Spec(TDC)/Source/Result | `mes_global_attributes`; `test_result`/`heat_chemistry`/`inspection_result` values; `min_spec/max_spec`(spec_source=TDC); `capture_source`; `.result` | READ/DERIVED | TDC-driven, keyed by `usage_decision.tdc_id` |
| Evidence: inspection details / test results / open defects | `inspection`, `test_record`(+`test_result`/`heat_chemistry`), `defect_record` (gated by `defect.use_for_ud`) | READ | |
| Decision (ACCEPT/CONDITIONAL/REJECT/REWORK/DOWNGRADE) | `usage_decision.decision` | CREATE | |
| UD type / action / reason / material status | `.ud_type_id, ud_action_id (→material_status_id), ud_reason_id, material_status_id` | CREATE | master-driven |
| Deviation/concession ref (CONDITIONAL) | `usage_decision.deviation_ref` | CREATE | **UI: add the input** |
| UD remarks / salvage-remarks | `.ud_remarks` (salvage note seeds downstream `salvage`) | CREATE | |
| Record / Revise / Approve | `usage_decision` + `usage_decision_line`; `.approval_status`, `approved_by/date`; `approval`(USAGE_DECISION) | C/U | `canDecide()` blocks while clearances PENDING |

**Workflow.** Record UD → `usage_decision`(decision, is_auto) + `usage_decision_line` ← `clearance` rows → `approval_status`=PENDING → `approval`(Quality→Plant-Head) → APPROVED. REWORK/DOWNGRADE → deep-link Raise Salvage/NCR → `ncr`→`salvage` → route → re-inspect/re-clear.

---

# 11. Salvage & NCR — `salvage-ncr.html`

*Disposition non-conforming material (resample/rework/reroute/re-HT/downgrade/scrap) with NCR, loss tracking, CAPA & FG Recall.*

| UI element / action | Table.column(s) | Op | Notes |
|---|---|---|---|
| Filter / meta (open · loss) | `ncr.*`, `salvage.salvage_type_id/qty_loss` | READ/DERIVED | |
| Grid: NCR No/Date/Source/Ref | `ncr.ncr_number/ncr_date`; source FK (inspection/test_record/**sample**/defect/clearance/usage_decision) | READ/DERIVED | ncr.sample_id added (DM) for chemistry source |
| Grid: Heat/UID/Stage/**Grade**/Against/Severity/Issue | `ncr.heat_number, material_number, operation_id, grade (DM), nc_against, severity, title` | READ | grade denorm added (DM) |
| Grid: Disposition/Target/Loss/Loss%/CAPA/Status | `salvage.salvage_type_id→name, target_operation_id | downgrade_grade, qty_loss, loss_pct`; `capa` counts; `ncr.status` | READ/DERIVED | |
| Raise NCR: source/against/category/severity/detected-by/title/desc/save | `ncr.*` (source FK by src; `ncr_category_id`, `detected_by`, `title`, `description`) | CREATE | prefilled from deep-link |
| Dispo: aggregated-UD panel | `usage_decision`(+`_line`); link `salvage.usage_decision_id` | READ | |
| Dispo: suggestion chips | `mes_qc_salvage_type_ncr_category` (§12.10) | DERIVED | data-driven (DM) |
| Dispo: disposition / target op | `salvage.salvage_type_id, target_operation_id` | CREATE | |
| Dispo: Downgrade to grade + alternate-SO | `salvage.downgrade_grade` (from `grade_downgrade` §5.7); `.realloc_sales_order_line_id, realloc_status` | CREATE/DERIVED | |
| Dispo: qty in/out → loss/loss%/outcome/remarks | `salvage.qty_in/qty_out/qty_loss/loss_pct/outcome/remarks` | C/DERIVED | outcome incl RETURNED/ACCEPTED (DM) |
| Dispo: Apply | `salvage` (+material_status_id); `ncr.status=DISPOSITIONED, disposition_summary` | CREATE/UPDATE | |
| CAPA: step/verify/add/close | `capa`(action_type, action_text, responsible_id, target_date, status, verified_by/date); `ncr.status` | R/C/UPDATE | |
| FG Recall: reason / units / initiate | `fg_recall`(recall_number, reason_code, status, raised_by, notify_customer, ncr_id) + `fg_recall_unit`(schedule_material_child_id, **batch_id/heat_number/qty**, location, dispatch_status, is_returned, is_quarantined) | CREATE | unit heat/qty added (DM) |
| Deep-link receiver | `sessionStorage mes_raise_ncr` → prefill Raise NCR | READ | from UD/Inspection |

**Workflow.** Raise NCR → `ncr`(source FK, category, severity, nc_against). Dispo → `salvage`(salvage_type, target/downgrade, qty→loss, outcome, material_status) → `ncr.status=DISPOSITIONED` → route per `salvage_type.routes_to` → re-clear. Downgrade → `grade_downgrade` → open-order rematch → `realloc_*`. CAPA verified → `ncr` CLOSED. FG Recall → `fg_recall`+`_unit` → returned units re-enter QA, quarantine via `material_status`.

---

# 12. Instruments & Calibration — `instruments.html`

*Gauge register with calibration intervals, re-cal alerts, multi-point calibration, and periodic in-use verification.*

| UI element / action | Table.column(s) | Op | Notes |
|---|---|---|---|
| Filter / meta (overdue/due) | `instrument.*`, derived from `next_cal_date` | READ/DERIVED | |
| Grid: code/name(★)/type/make·model/range/least-count/location/interval/last·next cal/status/cert | `instrument.instrument_code, name, is_critical, instrument_type_id, make, model, measuring_range, least_count, location, owner_dept, calibration_interval_days, last_cal_date, next_cal_date, status`; latest `calibration.certificate_no` | READ/DERIVED | cal-status computed from next_cal_date |
| Calibrate: date/type/agency/cert/reference | `calibration.cal_date, cal_type, agency_id, certificate_no, reference_standard` (§14.3) | CREATE | agency when EXTERNAL |
| Calibrate: points (nominal/measured/error/tol/OK) | `calibration_point.nominal_value, measured_value, error, tolerance, is_ok` (§14.4) | C/DERIVED | |
| Calibrate: result / next due / Save | `calibration.result, next_due_date`; update `instrument.last/next_cal_date/status` | C/DERIVED/UPDATE | FAIL→OUT_OF_SERVICE |
| Verify: checklist / result / record | `instrument_verification.check_summary, result, verify_date, verified_by` (§14.5) | CREATE | items rolled to summary (decision) |
| Cert attachment | `mes_qc_attachment`(entity_type=**CALIBRATION**) | CREATE | entity_type extended (DM) |
| Add & schedule | `instrument`(interval; status=UNDER_CALIBRATION) | CREATE | |

**Workflow.** Add→`instrument`(interval) → `next_cal_date` drives re-cal alerts. Calibrate→`calibration`(+`agency_id`)+`calibration_point` → result → update instrument. Verify→`instrument_verification`. At use, `inspection.instrument_id`/`test_record.instrument_id` may reference (traceability §14.6).

---

# 13. Certificate / MTC — `certificate.html`

*List MTCs and generate/preview/print an EN 10204 certificate from heat chemistry + test results vs the TDC (spec vs actual).*

| UI element / action | Table.column(s) | Op | Notes |
|---|---|---|---|
| Filter / meta | `certificate.tc_number/heat_number/material_number/customer_id/grade/work_order_no/status` | READ | |
| Grid: TC/date/type/heat/**UID**/grade/customer/WO/standard/size/qty/status/prepared-by | `certificate.*` (+ **schedule_material_child_id/uid**) | READ | piece link added (DM) |
| MTC meta: customer/SO/WO/grade/spec/**TDC**/heat/size/qty/condition/marking/**result** | `certificate.customer_id, sales_order_no, work_order_no, grade, standard_code, tdc_id→tdc_no, heat_number, size_text, qty, ht_condition`; marking from `tdc_limit.text_value`; **overall_result** | READ | overall_result added (DM) |
| MTC chemical/mechanical lines (spec vs found + bad flag) | `certificate_line`(section, **element_id for CHEMICAL lines** / attribute_id for others, min_spec/max_spec, actual_value, is_ok, uom_unit_id) (§16.2) | READ | actual from `heat_chemistry`/`test_result`; chem section labelled "elements (mes_qc_element)" |
| MTC remarks / signatures | `tdc_remark`(TEST_CERT); `certificate.prepared_by/approved_by/signed_by` | READ | |
| Issue & sign | `certificate.status, signed_by, approved_by`; PDF → `attachment`(entity_type=**CERTIFICATE**) | UPDATE/CREATE | |
| Generate MTC (heat/type/customer → build) | `certificate`(DRAFT) + `certificate_line` rows; multi-heat via `certificate_heat` (§16.3) | CREATE | |

**Workflow.** Generate → `certificate`(DRAFT) → pull APPLIED `tdc_limit`(print_flag) + `heat_chemistry`(§7.4) + `test_result`(§7.3) → `certificate_line` by section → append `tdc_remark`(TEST_CERT). Issue → status ISSUED/SIGNED → store signed PDF `attachment`(CERTIFICATE).

---

# Gap Register

Consolidated from all five reader batches. **[DM-FIXED]** applied to `Data-Model.md` this pass · **[UI]** column/table exists, screen must expose it (UI follow-up) · **[DECISION]** derivable/platform-level, documented (`Data-Model.md` §20) not added.

### Data-model gaps — fixed this pass (28)

| # | Sev | Area | Gap → resolution |
|---|---|---|---|
| 1 | IMP | Sampling | Sample "Pcs" no column → **`sample.sample_pieces`** |
| 2 | IMP | Sampling | "RM Size" no column → **`sample.rm_size`** |
| 3 | MIN | Sampling | `sample_status` missing IN_PREP/HOLD → **enum extended** |
| 4 | MIN | Sampling | Tests-to-perform only free text → **`mes_qc_sample_test`** (§7.5.7) |
| 5 | IMP | Testing | Per-reading lab identity unstorable → **`test_result.agency_id` + `source_label`** |
| 6 | IMP | Testing | Specimen orientation no storage → **`test_record.specimen_orientation`** |
| 7 | IMP | Chemistry | `heat_chemistry` no governing TDC → **`heat_chemistry.tdc_id`** |
| 8 | MIN | Chemistry | No lab on chemistry row → **`heat_chemistry.agency_id`** |
| 9 | IMP | Chemistry | No applied-corrective transaction → **`mes_qc_corrective_action_applied`** (§5.8) |
| 10 | MIN | Testing/Chem | Hold-reason free text → **`clearance.hold_reason_id`** → `mes_hold_reasons` |
| 11 | IMP | Clearance/UD | Group by WO/SO, no columns → **`clearance`/`usage_decision.work_order_no` + `sales_order_no`** |
| 12 | IMP | Salvage | FG Recall multi-heat, header single → **`fg_recall_unit.batch_id` + `heat_number`** |
| 13 | MIN | Salvage | Recall unit no qty → **`fg_recall_unit.qty` + `qty_unit_id`** |
| 14 | MIN | Salvage | `salvage.outcome` lacks RETURNED/ACCEPTED → **enum extended** |
| 15 | MIN | Salvage | NCR chemistry source no FK → **`ncr.sample_id`** |
| 16 | MIN | Salvage | Disposition suggestions hardcoded → **`mes_qc_salvage_type_ncr_category`** (§12.10) |
| 17 | MIN | Salvage/NCR | Grade not denormalized → **`ncr.grade` + `salvage.grade`** (+ §2 convention) |
| 18 | IMP | Certificate | No certified-piece link → **`certificate.schedule_material_child_id` + `uid`** |
| 19 | MIN | Certificate | No frozen printed verdict → **`certificate.overall_result`** |
| 20 | IMP | Cross-cutting | `attachment.entity_type` omits doc anchors → **+ CERTIFICATE / RM_RECEIPT / CALIBRATION** |
| 21 | MIN | RM | Spec-source not persisted → **`rm_inspection_result.spec_source`** |
| 22 | IMP | Masters | `material_status.blocks_dispatch` no column → **added** |
| 23 | IMP | Masters | Defect location model not storable → **`defect.default_location_type`** |
| 24 | IMP | Masters | Test method/standard no column → **`test.method_standard`** |
| 25 | MIN | Masters | Agency scope/accreditation no columns → **`agency.scope` + `accreditation`** |
| 26 | MIN | Masters | Generic description unbacked → **§5.1 note (optional `description`)** |
| 27 | MIN | Inspection | No unified worklist view → **`v_qc_worklist`** (§17) |
| 28 | MIN | Defects | Map extent geometry → **exposed via `v_qc_defect`** |

### UI follow-ups — column/table already exists, screen must expose it (10)

| # | Sev | Screen | Follow-up |
|---|---|---|---|
| U1 | IMP | clearance | Add a **Hold-reason** field (→`clearance.hold_reason`) shown when Result=HOLD |
| U2 | IMP | usage-decision | Add a **Deviation/concession ref** input (→`usage_decision.deviation_ref`) for CONDITIONAL/AUD — *partially done 2026-07-16: the Bulk-UD modal requires it for CONDITIONAL; the single-lot AUD modal still captures justification only* |
| U3 | IMP | master-defect | Expose `auto_hold`, `use_for_inspection/test/ud`, and the location-model select |
| U4 | IMP | master-prep-checklist | Rework UI to the 2-level `checklist`+`step` model (code/name, per-step mandatory) |
| U5 | MIN | salvage-ncr | Recall modal: expose `notify_customer` + optional `ncr_id` link |
| U6 | MIN | master-inspection-type / -test-type | Expose `category`/`result_basis`/`default_capture_source` |
| U7 | MIN | master-sampling-rule | ~~Expose `sampling_basis` select; map size to numeric columns~~ — **DONE 2026-07-16** (`sampling_basis` select + master-driven `size_basis_id` + optional `tdc_id` scope all exposed) |
| U8 | MIN | master-salvage-type / -standard-limit / -stage-qc-map / -sample-type | Expose the remaining existing columns (`is_rework`, `target_value`, `product_category_id`/`sku_id`/`capture_source`, width/thickness/barcode_required) |
| U9 | IMP | masters landing | Add CRUD screens for **`corrective_action` (§5.6), `grade_downgrade` (§5.7), `salvage_type_ncr_category` (§12.10)** — still open; re-tile orphan `roll-type`. *Partially done 2026-07-16: `size_basis`, `grade_chemistry` and `element` masters were added and wired (28 masters).* |
| U10 | MIN | defect-mapping | Bind evidence captures to `mes_qc_attachment`(DEFECT/PHOTO) (code comment references a non-existent `defect_capture` table) |

### Design decisions — documented, no schema change (`Data-Model.md` §20)

- Per-element chemistry pass/fail is **DERIVED** (actuals vs TDC limits); persist via `ncr`/`corrective_action_applied` only if audit requires.
- Notification-sent/ack events → platform-level **`mes_qc_notification`** service (out of QA scope).
- TDC **`print_flag`** is authoritative on the `tier=APPLIED` row.
- Stage "release to next stage" is recorded as a **`clearance_type=FINAL`** clearance row.
- Instrument in-use verification kept as a **`check_summary`** roll-up (no per-item child).
- UD salvage/re-grade remarks seed the downstream `salvage` row (no dedicated UD column).

---

# Reverse coverage — tables not surfaced by a screen

| Table(s) | Status |
|---|---|
| `corrective_action` (§5.6), `grade_downgrade` (§5.7), `salvage_type_ncr_category` (§12.10) | Config **used transactionally** (chemistry / salvage) but **no dedicated master CRUD screen** → **U9** (still open) |
| `size_basis` (§5.1), `grade_chemistry` (§5.9), **`element` (§5.10)** | **Master screens added 2026-07-16** (`master-size-basis.html`, `master-grade-chemistry.html`, `master-element.html`) and wired into all screens |
| `certificate_heat` (§16.3) | Multi-heat MTC modeled; UI demo is single-heat (add when multi-heat certs are needed) |
| `roll_type`, `roll`, `roll_inspection`, `roll_grinding` (§15) | `roll-shop.html`/`master-roll-type.html` exist but **parked** (removed from nav) — re-add to surface |
| `corrective_action_applied` (§5.8), `sample_test` (§7.5.7), `approval` (§10.3), `fg_recall`+`_unit` (§12.8/9) | Surfaced **embedded** in Chemistry / Sample Issue (tests + planned equipment) / Clearance+UD AUD chains / Salvage FG-Recall — no standalone screens needed |
| Views `v_qc_inspection`, `v_qc_test_result`, `v_qc_defect`, `v_qc_worklist` (§17) | Back the Dashboard/MIS (`dashboard.html`) |

Everything else in the 71-table model maps to at least one screen.

---

# Ready-to-code summary

- **Every functional screen and workflow is now backed by the data model.** 28 data-model gaps were closed in the original pass, and the 2026-07-16 refresh folds in the 12 stakeholder scope points plus the chemistry separation (`Data-Model.md`: **74 tables + 4 views**). The remaining items are the open **UI follow-ups** above (U1–U6, U8, U10, and the U9 remainder) and documented **decisions** — none block starting the build.
- **Recommended build order** (dependency-first): (1) masters + the two dictionaries (**`mes_qc_element`** for chemistry, `mes_global_attributes` for characteristics) → (2) TDC authoring (`tdc_input`, `tdc_limit` 3-tier with attribute/element xor, `standard*`) → (3) Sampling + Testing + Chemistry capture → (4) Inspection + Defects → (5) Clearance → Usage Decision → (6) Salvage/NCR/CAPA + FG Recall → (7) RM Quality, Instruments, Certificate/MTC → (8) Dashboards over the §17 views.
- **Next optional deliverables** (still parked): **DDL** (`CREATE TABLE` for the 74 tables) and a **per-screen API/DTO contract**.
