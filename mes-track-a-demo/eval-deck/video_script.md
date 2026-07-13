# Integrated Steel Works — MES Demo · Track A Video Script

**Product:** Bluemingo MES v2  ·  **Track:** A — Functional Fit  ·  **App:** http://localhost:8817/
**Tracked scenario:** A hot-rolled-coil sales order — 5,000 MT HRC, grade IS 2062 E250 → Heat **H2601** → slabs → coil **C2601**
**Plants:** SMS-2 (KR → BOF → ARS → LHF → RH → CCM) · HSM-2 (Charging Table → RHF → Roughing → Finishing → Down Coiler)

> **How to read this script.** Each scene has three blocks: **ON SCREEN** (what to click, in order), **NARRATION** (read aloud at a calm demo pace), and **DURATION** (target seconds). Section-intro lines are short spoken transitions. Keep the mouse moving with the narration so the response lands on the word that names it.

---

## ▶ Title / Intro

**ON SCREEN:** Open **http://localhost:8817/** — the Bluemingo MES v2 home (app.html shell). Rest on the landing dashboard showing the SMS-2 and HSM-2 overview tiles.

**NARRATION:** Welcome. This is Bluemingo MES version two, on one unified data model across the SMS-2 melt shop and HSM-2 hot strip mill. We'll follow a single order end to end — SAP download, heat H2601 and its slabs, coil C2601, quality release and dispatch — every screen live, with real SAP and Level-2 exchange, full genealogy and audit.

**DURATION:** 30 s

---

## A1 · Integrated Scheduling & Order Management

> *A SAP order becomes a reactive schedule across both plants.*

### A1.1-1 · Trigger a mock Sales Order from SAP (SD) — 5,000 MT HRC, Grade IS 2062 E250
*(P1)*

**ON SCREEN:** **Scheduling** (scheduling.html) → **Order Book / SAP-SD intake** panel → click **"Receive SO from SAP"**. Watch IDoc ORDERS05 pull in and the new order appear in the order list.

**NARRATION:** I click Receive SO from SAP; IDoc ORDERS05 pulls off the middleware and MES creates the order — grade IS 2062 E250, five thousand tonnes of HRC, dimensions and delivery date — with no re-keying.

**DURATION:** 22 s

### A1.1-2 · Create SMS-2 Schedule — 24 h horizon, 3 BOFs active, 2 CCM strands
*(P1)*

**ON SCREEN:** Scheduling → **"Create SMS-2 Schedule"** → set horizon **24 h**, activate **BOF1/2/3**, strands **CCM1/CCM2** → generate. The **Time Plan** view appears with sequenced heats.

**NARRATION:** I set a twenty-four-hour horizon with three BOFs and both strands and generate. MES auto-sequences the heats by grade, ladle and strand into a Time Plan, honouring tundish life, grade nesting and width hierarchy.

**DURATION:** 18 s

### A1.1-3 · Time-Plan Gantt for SMS-2 — heat sequence across BOF1/2, LHF, RH, CCM1/CCM2
*(P1)*

**ON SCREEN:** Scheduling → **Time-Plan Gantt**. Point to the lanes **BOF1/BOF2 → LHF → RH → CCM1/CCM2**, then to the coloured **setup bars** on each grade / width change.

**NARRATION:** The same schedule as a Gantt — each lane a unit, synchronized with setup, processing and buffer times. Coloured setup bars mark every grade or width change, so the sequence is genuinely castable.

**DURATION:** 18 s

### A1.1-4 · Simulate a BOF2 breakdown — reactive re-scheduling
*(P2)*

**ON SCREEN:** Scheduling toolbar → click **"Simulate BOF2 breakdown"** → in the modal enter the **estimated downtime** → confirm. Affected heats re-slot to **BOF1/BOF3**; an **alert banner** appears.

**NARRATION:** I trigger a BOF2 breakdown and enter the downtime. MES re-slots the affected heats onto BOF1 and BOF3, raises a planner alert and produces a revised schedule — well inside the five-minute target.

**DURATION:** 17 s

### A1.1-5 · Hot-charging flag for slabs destined to RHF (HSM-2)
*(P2)*

**ON SCREEN:** Scheduling → heat table / rolling schedule → expand a heat to its **slab list**. The hot-charge-eligible slabs are **flagged** for the direct CCM→RHF path.

**NARRATION:** Expanding a heat, hot-charge-eligible slabs are flagged and queued straight to the HSM-2 charging table. That direct caster-to-furnace path, visible in the schedule, captures the reheat-energy saving on every eligible slab.

**DURATION:** 15 s

> *A1.2 — ladle and equipment scheduling.*

### A1.2-1 · View current ladle inventory — status (available / in use / cooling / repair)
*(P1)*

**ON SCREEN:** Scheduling → **Ladle pool / schedule** view. Show ladle statuses — available, in use, cooling, repair — each with heat history, lining status and campaign life.

**NARRATION:** The live ladle pool shows each ladle's status — available, in use, cooling or repair — with heat history, lining status and heats remaining before relining, so no lining runs past its limit.

**DURATION:** 16 s

### A1.2-2 · Assign a specific ladle to Heat #H2601 at BOF1 tapping
*(P1)*

**ON SCREEN:** Ladle schedule → select **Heat H2601** → assign ladle **L-02** at **BOF1 tapping**. System validates availability + temperature history, then **assigns and locks**.

**NARRATION:** I assign a ladle to heat H2601 for BOF1 tapping. MES validates its availability and temperature history, then assigns and locks it to the heat, so the vessel can't be double-booked across tappings.

**DURATION:** 18 s

### A1.2-3 · 'Ladle Schedule' view aligned with heat Time Plan (conflicts flagged)
*(P2)*

**ON SCREEN:** Scheduling → **Ladle Schedule**. Show the turnaround timeline against the heat Time Plan; a near-relining conflict is **flagged in red** with its reason.

**NARRATION:** The Ladle Schedule overlays turnaround against the heat Time Plan, so conflicts surface visually — a ladle nearing relining is flagged red with its reason. The planner sees the clash before the floor does.

**DURATION:** 15 s

---

## A2 · Operations Management & Production Tracking

> *Real-time tracking, and the transactions that create slabs and coils.*

### A2.1-1 · Select active Heat #H2601 — current unit assignment (In BOF1 – Blowing)
*(P1)*

**ON SCREEN:** **Operations** (operations.html) → **Heat Lifecycle · SMS-2** tab. Open the tracked **Heat H2601** summary; show current step **"In BOF1 – Blowing"**, time-at-step, and the live **BOF-L2** process parameters.

**NARRATION:** The Heat Lifecycle tab shows heat H2601 live — in BOF1, blowing — with its current step, time at step, and process parameters streaming from BOF-L2. One pane tells the operator where every heat is.

**DURATION:** 20 s

### A2.1-2 · Genealogy: Torpedo → KR → BOF → ARS → LHF → RH → CCM → Slab IDs
*(P1)*

**ON SCREEN:** Operations → Heat Lifecycle → **Heat Genealogy** tree. Expand from **Torpedo → KR → BOF → ARS → LHF → RH → CCM**, ending at the **two slab IDs**.

**NARRATION:** The genealogy tree for H2601 runs from the torpedo, through KR, BOF, ARS, ladle furnace and RH, to the caster, where the heat splits into two slabs. Each node carries timestamp, unit, operator and value — any coil traces to its torpedo in one click.

**DURATION:** 24 s

### A2.1-3 · Capture a manual reading (temperature at LHF) via manual entry
*(P2)*

**ON SCREEN:** Operations → Heat Lifecycle → **Live Process Parameters** → click **"Capture manual reading"** → enter the **LHF temperature**. The entry appends to the **Readings Log** tagged **"Manual"**.

**NARRATION:** I capture an LHF temperature by hand. It appends to the readings log with my user ID and timestamp, flagged Manual versus Auto — operators keep working through an instrument dropout, and the lineage stays honest.

**DURATION:** 16 s

### A2.1-4 · Simulate a process delay at RH (power supply interruption) — log delay code
*(P2)*

**ON SCREEN:** Operations → **Operator Actions** → click **"Record Delay"**. Pick the reason; unit, planned/unplanned type and duration **auto-fill**; it's added to **Delay Capture** and flagged for **SAP-PM**.

**NARRATION:** I record a delay at RH and pick the reason; MES auto-fills the unit, planned-or-unplanned type and duration, updates availability, and adds it to delay capture, flagged for transfer to SAP-PM.

**DURATION:** 18 s

### A2.1-5 · Slab production posting — 2 slabs from Heat H2601 (26.4 MT & 24.8 MT)
*(P1)*

**ON SCREEN:** Operations → Heat Lifecycle → click **"Post slab production (2 slabs)"**. Show the two **slab IDs**, weights **26.4 MT** and **24.8 MT**, the as-cast parameters (**setpoint vs actual**); PDO to CCM-L2, queued for **SAP-PP**.

**NARRATION:** Posting slab production from H2601: in one action MES creates two slabs at twenty-six-point-four and twenty-four-point-eight tonnes, generates their IDs, captures as-cast setpoint against actual, sends the output to CCM-L2 and queues the goods movement for SAP-PP. Inventory, genealogy, Level-2 and SAP all move in step.

**DURATION:** 28 s

> *A2.2 — HSM-2 coil tracking; the slab enters the mill.*

### A2.2-1 · Slab arriving at Charging Table from SYMS (hot charge from CCM or cold from yard)
*(P1)*

**ON SCREEN:** Operations → **HSM-2 Coil Tracking** tab → **Slab Arrival to Inventory** → select a slab. Show **hot-charge vs cold**, **PDI sent to Mill-L2**, status → **"In Furnace RHF1"**.

**NARRATION:** A slab arrives at the charging table — hot-charged from the caster or cold from SYMS. I confirm it, MES fires the PDI to Mill-L2, and status flips to In Furnace RHF1 — one confirmed event.

**DURATION:** 19 s

### A2.2-2 · Track slab: RHF → Descaler → Roughing → Crop Shear → Finishing → Down Coiler
*(P2)*

**ON SCREEN:** HSM-2 Coil Tracking → **Rolling Order Exchange** → click **"Generate PDO"**, then **"Get PDI for coils"**. The **Mill-L2 message log** traces each step; coil ID generated at the **Down Coiler**.

**NARRATION:** As the slab rolls, the Mill-L2 log traces it through descaler, roughing, crop shear, finishing and down coiler, each step timestamped. At the coiler, Level-2 generates the coil ID and returns it to MES.

**DURATION:** 16 s

### A2.2-3 · Coil weight capture from load cell; coil production PDO sent to MES
*(P1)*

**ON SCREEN:** HSM-2 Coil Tracking → **Generated Coils** panel (after Generate PDO / Get PDI). Show **load-cell weight**, thickness, width, length, grade; status **"Produced, Pending QC"**.

**NARRATION:** Coil C2601 lands in Generated Coils with its load-cell weight and rolling parameters — thickness, width, length and grade — captured from Level-2. Its status is set automatically to Produced, Pending QC, so nothing ships before quality.

**DURATION:** 20 s

### A2.2-4 · Demonstrate kick-back (slab returned from furnace to yard)
*(P1)*

**ON SCREEN:** HSM-2 Coil Tracking → click **"Record Kickback"**. Choose the reason; **stage and disposition auto-fill**. Slab status → **"Kick-back"**; SYMS updated; roll plan revised.

**NARRATION:** I record a kick-back and pick the reason; stage and disposition auto-fill, status becomes Kick-back, SYMS inventory is corrected and the HSM-2 roll plan is revised on the spot — yard and mill stay in sync.

**DURATION:** 18 s

---

## A3 · Quality Management

> *From heat chemistry to coil certification, lab-integrated throughout.*

### A3.1-1 · Heat H2601 sample plan — Torpedo(1) KR(2) BOF(4) LF(5) Tundish(1) CCM(2) ≈ 15
*(P1)*

**ON SCREEN:** **Quality → Sampling** (quality-sampling.html). Show the per-point sample plan for **H2601** — Torpedo 1, KR 2, BOF 4, LF 5, Tundish 1, CCM 2, ≈ 15 samples — each with a **barcoded sample ID**.

**NARRATION:** MES auto-generates the full per-point sample plan for heat H2601 — about fifteen samples across torpedo, KR, BOF, ladle furnace, tundish and caster, each barcoded — so the lab knows what's coming.

**DURATION:** 18 s

### A3.1-2 · Receive chemistry from MS Central Lab — BOF sample C 0.06 / Mn 1.2 / S 0.005
*(P1)*

**ON SCREEN:** **Quality → Heat Chemistry** (quality-chemistry.html). Show the BOF sample auto-result from the **MS Central Lab** — **C 0.06 / Mn 1.2 / S 0.005** — compared against the grade spec (**TDC**) with a **PASS** flag.

**NARRATION:** The BOF chemistry returns automatically from the MS Central Lab against that barcode — carbon zero-point-zero-six, manganese one-point-two, sulphur zero-point-zero-zero-five. MES checks each element against the grade's delivery conditions and flags PASS — no transcription.

**DURATION:** 20 s

### A3.1-3 · Receive Container-Lab result — multi-lab aggregation for final heat chemistry
*(P2)*

**ON SCREEN:** Quality → Heat Chemistry → **Overall chemistry / aggregation** view. Show **MS Central + Container Lab** consolidated; grade confirmed **IS 2062 E250**; heat **"Chemistry OK"**.

**NARRATION:** The Container Lab result is aggregated with the central lab into one consolidated chemistry. MES confirms the grade as IS 2062 E250 and marks the heat Chemistry OK — multi-lab reconciliation, done automatically.

**DURATION:** 15 s

### A3.1-4 · Simulate out-of-spec result (S = 0.025% at LHF) — show system response
*(P1)*

**ON SCREEN:** Quality → Heat Chemistry → trigger the **LHF re-sample (out-of-spec)**, **S = 0.025%**. System auto-**HOLDs** the heat, suggests **corrective action (extra stir at ARS)**, notifies the **shift manager**.

**NARRATION:** An out-of-spec LHF sample — sulphur at zero-point-zero-two-five percent — triggers an instant alert. MES puts the heat on HOLD so it can't progress, recommends a corrective action, extra stirring at ARS, and notifies the shift manager — guiding recovery, not just flagging the deviation.

**DURATION:** 28 s

### A3.1-5 · Alloy design — suggest alloy additions to bring chemistry within spec
*(P2)*

**ON SCREEN:** Quality → Heat Chemistry → **corrective action** → show the alloy-addition recommendation (**CaSi desulph at LHF**, FeMn) with **cost**. Operator **confirms**; addition **logged**.

**NARRATION:** The alloy-design function recommends specific additions — CaSi for desulphurisation and FeMn — with quantities and cost. The operator confirms, and it's logged against the heat: chemistry correction made guided, costed and auditable.

**DURATION:** 16 s

> *A3.2 — quality decisions for the finished coil.*

### A3.2-1 · Coil C2601 lab result (YS 285 / UTS 420) + online surface — both PASS
*(P1)*

**ON SCREEN:** **Quality → Testing / Usage Decision** (quality-usage-decision.html). Show C2601 mechanicals **YS 285 / UTS 420** plus the **online surface** result — both **PASS**. Auto **UD → "QC Released"**; batch attributes to **SAP-QM**.

**NARRATION:** Coil C2601's mechanicals — yield two-eighty-five, tensile four-twenty megapascals — pass, alongside a clean surface inspection. MES triggers an automatic usage decision, releases the coil to QC Released, and sends the batch characteristics to SAP-QM.

**DURATION:** 20 s

### A3.2-2 · Coil with surface defect detected by online SIS — flagged for review
*(P2)*

**ON SCREEN:** **Quality → Defects / Inspection** (quality-defects.html). Show a **online SIS** defect; coil → **"Manual QC Hold"**; **defect image** displayed; QC inspector notified.

**NARRATION:** When online surface inspection flags a defect, the coil moves to Manual QC Hold with the defect image shown, and the inspector is notified. Automation clears good coils; a human handles only judgement calls.

**DURATION:** 16 s

### A3.2-3 · Manual QC decision — inspector declares coil 'Downgrade to IS 2062 E200'
*(P1)*

**ON SCREEN:** **Quality → Salvage & NCR → disposition** (quality-salvage.html). Inspector sets **disposition = Downgrade → IS 2062 E200**. MES **suggests a matching alternate SO**; batch **re-assigned**; **SAP-QM** update.

**NARRATION:** The inspector downgrades the coil from E250 to grade IS 2062 E200. MES immediately suggests a matching alternate sales order, re-assigns the batch and updates SAP-QM — a downgrade becomes a recovered sale, not a write-off.

**DURATION:** 22 s

### A3.2-4 · 'Acceptance Under Deviation' (AUD) workflow for a borderline coil
*(P1)*

**ON SCREEN:** **Quality → Usage Decision** → raise **AUD / Concession**. Enter the **justification**; show the two-level approval chain **Shift Manager → QC Head**; audit trail retained.

**NARRATION:** For a borderline coil, the Acceptance Under Deviation workflow accepts it against a documented justification, routed through two-level approval — shift manager, then QC head — with the full trail retained. Deviations are governed, never quietly waved through.

**DURATION:** 20 s

### A3.2-5 · FG Recall — recall a batch of coils from dispatch for re-inspection
*(P2)*

**ON SCREEN:** **Quality → Salvage & NCR → FG Recall** (quality-salvage.html). Enter the **reason**; select **dispatched coils**; initiate. Affected coil IDs listed; **CYMS/dispatch notified**; **SAP FG-Recall** message triggered.

**NARRATION:** FG Recall recalls a dispatched batch. I select the affected coils with a reason, and MES lists every coil ID, notifies the CYMS yard and dispatch, and fires the SAP FG-recall message — containment right down to the coil.

**DURATION:** 16 s

---

## A4 · Yard Management (SYMS & CYMS)

> *The SYMS slab yard and CYMS coil yard, synced to production.*

### A4-1 · SYMS visual layout — slab yard grid (~40,000 T), inventory with IDs/grades/weights
*(P2)*

**ON SCREEN:** **Logistics → Yard → SYMS · Slab Yard** (yard.html, SYMS tab). Show the **occupancy grid** (~40,000 T capacity), free/occupied slots, capacity KPIs; **search a slab by ID or heat**.

**NARRATION:** The SYMS slab yard is a visual grid of roughly forty thousand tonnes, with free and occupied slots and live capacity KPIs. Any slab is searchable by ID or heat — found in seconds, not on foot.

**DURATION:** 16 s

### A4-2 · Allocate slabs from SYMS to HSM-2 rolling plan — priority-based selection
*(P1)*

**ON SCREEN:** Yard → SYMS → **HSM-2 Rolling-Plan Allocation**. Show **priority-ranked slabs** (grade + age); **allocate**; status → **"Allocated to HSM Plan"**; confirmation back to MES.

**NARRATION:** I allocate slabs to the HSM-2 rolling plan; MES ranks candidates by grade match and age. On allocation, each slab moves to Allocated to HSM Plan with a confirmation from SYMS — schedule and physical yard stay locked together.

**DURATION:** 20 s

### A4-3 · CYMS coil yard — arrival, location update, dispatch staging
*(P2)*

**ON SCREEN:** Yard → **CYMS · Coil Yard** (yard.html, CYMS tab). Show **coil arrival**, **bay location** update, and the **dispatch-staging** lane.

**NARRATION:** The CYMS coil yard mirrors it for finished goods — locations update as coils arrive and move to bays, each is searchable by ID, and a dispatch-staging lane keeps inventory accurate to the gate.

**DURATION:** 15 s

---

## A5 · MIS Reports & Dashboards

> *Live data into decisions — real-time, drillable, exportable.*

### A5-1 · Production Dashboard — shift production vs plan (heats, slabs, coils, yield, OEE)
*(P1)*

**ON SCREEN:** **Insights → Reports & KPIs** (reports.html) → **Production Dashboard** tab. Show shift production vs plan for **SMS-2 and HSM-2** — heats cast, slabs, coils, yield, OEE — with **traffic-light KPIs**, **trend charts**, and **drill-down**.

**NARRATION:** The production dashboard shows shift production against plan for both SMS-2 and HSM-2 — heats, slabs, coils, yield and OEE — with traffic-light KPIs and trend charts. Click any KPI to drill into the detail. Real-time, both plants, one screen.

**DURATION:** 26 s

### A5-2 · Heat-wise Production Report (last 24 h) — heat no., grade, slab count, weight, yield
*(P2)*

**ON SCREEN:** Reports → **Heat-wise (24h)** tab. Show per-heat production and yield with a process-parameter summary; **Export PDF / Excel**.

**NARRATION:** The heat-wise report covers the last twenty-four hours — heat number, grade, slab count, weight and yield, with a process-parameter summary — generating well under thirty seconds. One click exports to Excel or PDF.

**DURATION:** 15 s

### A5-3 · Delay Report — planned vs unplanned delays, affected heats, hours by unit
*(P2)*

**ON SCREEN:** Reports → **Delay Report** tab. Show **planned vs unplanned** delays, a **Pareto** of delay codes, and **delay hours by unit**.

**NARRATION:** The delay report separates planned from unplanned downtime, ranks causes in a Pareto of delay codes, and totals hours by unit. It's submittable to SAP, so the same data feeds maintenance.

**DURATION:** 15 s

### A5-4 · Quality Hold Report — coils/slabs on QC hold, aging, responsible QC code
*(P1)*

**ON SCREEN:** Reports → **Quality Holds** tab. Show **hold inventory**, **age-wise analysis** with **>24h / >48h** alerts highlighted, and the responsible QC code.

**NARRATION:** The quality-hold report is a live inventory of every coil and slab on QC hold, aged, with the responsible QC code. Anything past twenty-four or forty-eight hours is highlighted, so blocked stock gets resolved.

**DURATION:** 18 s

### A5-5 · Order Tracking Report — SO status from order to dispatch
*(P1)*

**ON SCREEN:** Reports → **Order Tracking** tab. Show per-SO **production %**, **quality status**, **dispatch readiness**, driven from the live order book. Point to **SO-2026-04471**.

**NARRATION:** Order tracking shows, for every sales order including the one we followed, production percentage, quality status and dispatch readiness — straight from the live order book. Sales can answer where's my order without calling the floor.

**DURATION:** 18 s

### A5-6 · Mobile / tablet view of the production dashboard
*(P2)*

**ON SCREEN:** Reports → **Production Dashboard** in a **narrow viewport** (resize / device mode). KPIs and alerts **reflow** with no horizontal scroll.

**NARRATION:** The same dashboard on a tablet or phone reflows so KPIs and alerts stay readable with no horizontal scrolling. A manager off-site gets the same numbers as the control room, on any device.

**DURATION:** 15 s

---

## A6 · System Integration

> *Live SAP and Level-2 data exchange, at the wire level.*

### A6.1-1 · Trigger Sales Order receipt from SAP-SD — ACK + order creation in MES
*(P1)*

**ON SCREEN:** **System → Integration → SAP Interfaces** (integration.html, SAP tab) → **"Sales order receipt"** row → **Run now**. Show IDoc **ORDERS05** inbound, order created in the MES Order Book, **ACK** to SAP.

**NARRATION:** On the SAP tab I run the sales-order receipt flow — the ORDERS05 IDoc arrives, the order appears in the MES order book with all attributes, and an acknowledgment returns to SAP. The Scheduling intake, at the wire level.

**DURATION:** 20 s

### A6.1-2 · Post heat production to SAP-PP — Heat H2601, 2 slabs as semi-finished goods
*(P1)*

**ON SCREEN:** Integration → SAP Interfaces → **"Production posting (GR)"** row → **Run now**. Show **LOIPRO / BAPI_GOODSMVT**, movement type, order confirmation, **SAP GR posted** for H2601's 2 slabs.

**NARRATION:** I run the goods-receipt flow for H2601's two slabs as semi-finished goods. MES sends the posting via BAPI and IDoc with movement type and order confirmation, and SAP posts the goods receipt — inventory in step instantly.

**DURATION:** 20 s

### A6.1-3 · Send coil QC result (batch classification) to SAP-QM
*(P1)*

**ON SCREEN:** Integration → SAP Interfaces → **"SAP-QM"** row → **Run now**. Show the **inspection lot** update and batch characteristics — **YS, UTS, surface grade** — written to the SAP batch master.

**NARRATION:** The coil quality result flows to SAP-QM — yield strength, UTS and surface grade written to the batch master, and the inspection lot updated. MES quality data becomes the batch's certified record for the mill test certificate.

**DURATION:** 18 s

### A6.1-4 · Send delay information to SAP-PM for maintenance tracking
*(P2)*

**ON SCREEN:** Integration → SAP Interfaces → **"SAP-PM"** row → **Run now**. Show delay + **equipment ID + duration** creating a **PM notification**.

**NARRATION:** The RH delay flows to SAP-PM — the equipment ID and duration create a maintenance notification, and a PM order can be raised from MES. Floor downtime becomes a maintenance work item automatically.

**DURATION:** 15 s

### A6.1-5 · Storage-location update to SAP-MM when slab moves SYMS → HSM charging
*(P2)*

**ON SCREEN:** Integration → SAP Interfaces → **"SAP-MM"** row → **Run now**. Show the stock transfer, **movement type 311**, SLOC **"Slab Yard" → "In Process HSM"**, material document.

**NARRATION:** Moving a slab from yard to mill, MES posts a stock transfer to SAP-MM — movement type three-one-one — shifting the storage location from Slab Yard to In Process HSM, with a material document. Physical and SAP stock stay aligned.

**DURATION:** 15 s

> *A6.2 — Level-2 exchange with the BOF, caster and mill.*

### A6.2-1 · PDI sent from MES to BOF-L2 for Heat H2601 — grade, chemistry, practice
*(P1)*

**ON SCREEN:** Integration → **Level-2 (L2)** tab → **"BOF-L2"** row → **Send**. Show the **PDI** — grade, target chemistry, BOF practice — over **OPC-UA**, with the **ACK**.

**NARRATION:** On the Level-2 tab I send the PDI to BOF-L2 for heat H2601 — grade, target chemistry and BOF practice — over OPC-UA. The log shows it go out and the acknowledgment return, confirming the heat at Level-2.

**DURATION:** 20 s

### A6.2-2 · PDO received from CCM-L2 — slab dims, weight, strand, cut sequence
*(P1)*

**ON SCREEN:** Integration → Level-2 → **"CCM-L2"** row → **Receive**. Show the **PDO** parsed into a slab record — dimensions, weight, strand, cut sequence — with **message ID and timestamp** in the log.

**NARRATION:** I receive a PDO from CCM-L2, the caster Level-2 system. MES parses it into a slab record — dimensions, weight, strand and cut sequence — and logs the message ID and timestamp. The earlier slabs are born here.

**DURATION:** 20 s

### A6.2-3 · PDI to Mill-L2 (HSM-2) — charging confirmation + rolling target (thickness, width, temp)
*(P1)*

**ON SCREEN:** Integration → Level-2 → **"Mill-L2"** row → **Send**. Show the **charging confirmation** plus rolling targets — **thickness, width, temperature** — logged; rolling schedule **locked at L2**.

**NARRATION:** To the mill: I send the PDI to Mill-L2 with the charging confirmation and rolling targets — thickness, width and temperature. L2 confirms and locks the rolling schedule, so every coil is rolled to the order's targets.

**DURATION:** 18 s

### A6.2-4 · Integration monitoring — status of all active interfaces (L2, SAP, SYMS, CYMS, Lab)
*(P2)*

**ON SCREEN:** Integration → **Interface Monitor** tab. Show **health tiles** for L2, SAP, SYMS, CYMS and Lab — last message time, **Green/Amber/Red** — and a **failed-message retry**.

**NARRATION:** The interface monitor gives one health view of every integration — L2, SAP, SYMS, CYMS and the labs — each with last message time, a green-amber-red status, and one-click retry. IT recovers a dropped message without a support call.

**DURATION:** 16 s

---

## A7 · Security & Access Control

> *Who can do what — and the audit trail that proves it.*

### A7-1 · Log in as different roles — Shift Operator / QC Inspector / PPIC / Admin
*(P1)*

**ON SCREEN:** **System → Security & Access** (security.html). Use the **role switcher** in the header to move through **Shift Operator → QC Inspector → PPIC Planner → Admin**; watch the **menu change** per role.

**NARRATION:** The role switcher moves through four roles: a shift operator has no scheduling, a QC inspector can't post production, the PPIC planner sees the full schedule, the admin sees everything. The screen reshapes to each role.

**DURATION:** 22 s

### A7-2 · LDAP / AD authentication — login with corporate credentials (SSO)
*(P1)*

**ON SCREEN:** Security & Access → **Authentication** section. Show **AD / SSO** configuration, the **AD-group → role** mapping, and the **local fallback** user.

**NARRATION:** Authentication uses corporate Active Directory over single sign-on, each user's role mapped from their AD group — so MES uses the identities the plant already governs. A local fallback account covers the rare case AD is unreachable.

**DURATION:** 18 s

### A7-3 · Plant-based access control — SMS-2 user cannot see HSM-2 quality decisions
*(P2)*

**ON SCREEN:** Security & Access → **plant segregation**. Show an **SMS-2 user** attempting to open **HSM-2 quality decisions** and receiving a **permission-denied** response.

**NARRATION:** Access is segregated by plant: an SMS-2 user opening HSM-2 quality decisions gets permission denied. A melt-shop role can't reach the mill's quality data unless explicitly granted — enforced, not merely hidden.

**DURATION:** 15 s

### A7-4 · Audit trail for a quality-decision change — who changed what and when
*(P1)*

**ON SCREEN:** Security & Access → **Audit Trail**. Show a quality-decision change record — **user ID, timestamp, old → new value, reason** — non-repudiable and **exportable**.

**NARRATION:** Every consequential change is audited. Here's the coil-downgrade record — who changed it, when, old value, new value and reason — one non-repudiable row that exports for auditors. On any grade or usage change, no question who or why.

**DURATION:** 22 s

### A7-5 · Data-encryption indicator for sensitive fields (chemistry recipes, test results)
*(P2)*

**ON SCREEN:** Security & Access → **system info**. Show the **transport (HTTPS/TLS)** and **encryption-at-rest** indicators; note **no plaintext passwords** in logs.

**NARRATION:** The system-info screen shows the security posture — HTTPS in transit, encryption at rest for sensitive fields like chemistry recipes and test results, and no plaintext passwords in the logs. The plant's edge, protected end to end.

**DURATION:** 15 s

---

## ⏹ Closing

**ON SCREEN:** Return to the **home dashboard** (app.html) showing **SO-2026-04471 → H2601 → C2601** traced end to end.

**NARRATION:** That completes Track A. One order, from SAP download through a reactive cross-plant schedule, heat H2601, coil C2601, quality release and dispatch — with live SAP and Level-2 integration, full genealogy and a complete audit trail. One data model across SMS-2 and HSM-2, not two systems bolted together. Thank you.

**DURATION:** 28 s

---

## Recording checklist & timing

| # | Scene | Screen / URL | Dur (s) | Running |
|---|-------|--------------|:------:|:------:|
| — | **Title / Intro** | app.html (home) | 30 | 0:30 |
| — | *A1 section intro* | scheduling.html | 5 | 0:35 |
| 1 | A1.1-1 · SO from SAP-SD (5,000 MT HRC, E250) | scheduling.html | 22 | 0:57 |
| 2 | A1.1-2 · Create SMS-2 Schedule (24 h) | scheduling.html | 18 | 1:15 |
| 3 | A1.1-3 · Time-Plan Gantt | scheduling.html | 18 | 1:33 |
| 4 | A1.1-4 · Simulate BOF2 breakdown | scheduling.html | 17 | 1:50 |
| 5 | A1.1-5 · Hot-charging flag | scheduling.html | 15 | 2:05 |
| 6 | A1.2-1 · Ladle inventory / status | scheduling.html | 16 | 2:21 |
| 7 | A1.2-2 · Assign ladle to H2601 | scheduling.html | 16 | 2:37 |
| 8 | A1.2-3 · Ladle Schedule (conflicts) | scheduling.html | 15 | 2:52 |
| — | *A2 section intro* | operations.html | 5 | 2:57 |
| 9 | A2.1-1 · Heat H2601 — In BOF1 Blowing | operations.html | 18 | 3:15 |
| 10 | A2.1-2 · Heat genealogy tree | operations.html | 24 | 3:39 |
| 11 | A2.1-3 · Manual reading (LHF temp) | operations.html | 16 | 3:55 |
| 12 | A2.1-4 · Record delay at RH | operations.html | 17 | 4:12 |
| 13 | A2.1-5 · Slab production posting (2 slabs) | operations.html | 23 | 4:35 |
| 14 | A2.2-1 · Slab arrival at Charging Table | operations.html | 19 | 4:54 |
| 15 | A2.2-2 · Track slab RHF → Down Coiler | operations.html | 16 | 5:10 |
| 16 | A2.2-3 · Coil weight capture / PDO | operations.html | 18 | 5:28 |
| 17 | A2.2-4 · Kick-back | operations.html | 18 | 5:46 |
| — | *A3 section intro* | quality-*.html | 5 | 5:51 |
| 18 | A3.1-1 · H2601 sample plan (~15) | quality-sampling.html | 18 | 6:09 |
| 19 | A3.1-2 · Chemistry from MS Central Lab | quality-chemistry.html | 18 | 6:27 |
| 20 | A3.1-3 · Container-Lab aggregation | quality-chemistry.html | 15 | 6:42 |
| 21 | A3.1-4 · Out-of-spec (S 0.025%) → HOLD | quality-chemistry.html | 22 | 7:04 |
| 22 | A3.1-5 · Alloy design | quality-chemistry.html | 16 | 7:20 |
| 23 | A3.2-1 · Coil C2601 pass → QC Released | quality-usage-decision.html | 18 | 7:38 |
| 24 | A3.2-2 · Surface defect → Manual QC Hold | quality-defects.html | 16 | 7:54 |
| 25 | A3.2-3 · Manual downgrade → E200 | quality-salvage.html | 19 | 8:13 |
| 26 | A3.2-4 · Acceptance Under Deviation | quality-usage-decision.html | 17 | 8:30 |
| 27 | A3.2-5 · FG Recall | quality-salvage.html | 17 | 8:47 |
| — | *A4 section intro* | yard.html | 5 | 8:52 |
| 28 | A4-1 · SYMS slab-yard layout | yard.html | 16 | 9:08 |
| 29 | A4-2 · Allocate slabs → HSM-2 plan | yard.html | 18 | 9:26 |
| 30 | A4-3 · CYMS coil yard | yard.html | 15 | 9:41 |
| — | *A5 section intro* | reports.html | 5 | 9:46 |
| 31 | A5-1 · Production Dashboard | reports.html | 21 | 10:07 |
| 32 | A5-2 · Heat-wise Report (24 h) | reports.html | 15 | 10:22 |
| 33 | A5-3 · Delay Report | reports.html | 15 | 10:37 |
| 34 | A5-4 · Quality Hold Report | reports.html | 16 | 10:53 |
| 35 | A5-5 · Order Tracking Report | reports.html | 17 | 11:10 |
| 36 | A5-6 · Mobile / tablet view | reports.html | 15 | 11:25 |
| — | *A6 section intro* | integration.html | 5 | 11:30 |
| 37 | A6.1-1 · SAP-SD SO receipt + ACK | integration.html | 20 | 11:50 |
| 38 | A6.1-2 · SAP-PP production posting (GR) | integration.html | 19 | 12:09 |
| 39 | A6.1-3 · SAP-QM coil QC result | integration.html | 17 | 12:26 |
| 40 | A6.1-4 · SAP-PM delay info | integration.html | 14 | 12:40 |
| 41 | A6.1-5 · SAP-MM SLOC update (mvt 311) | integration.html | 15 | 12:55 |
| 42 | A6.2-1 · PDI → BOF-L2 | integration.html | 18 | 13:13 |
| 43 | A6.2-2 · PDO ← CCM-L2 | integration.html | 18 | 13:31 |
| 44 | A6.2-3 · PDI → Mill-L2 | integration.html | 16 | 13:47 |
| 45 | A6.2-4 · Interface Monitor | integration.html | 17 | 14:04 |
| — | *A7 section intro* | security.html | 5 | 14:09 |
| 46 | A7-1 · Role-based login (4 roles) | security.html | 21 | 14:30 |
| 47 | A7-2 · LDAP / AD SSO | security.html | 16 | 14:46 |
| 48 | A7-3 · Plant-based access control | security.html | 15 | 15:01 |
| 49 | A7-4 · Audit trail (QC decision) | security.html | 20 | 15:21 |
| 50 | A7-5 · Data-encryption indicator | security.html | 15 | 15:36 |
| — | **Closing** | app.html (home) | 28 | **16:04** |

**Totals** — 50 walkthrough scenes + Title + Closing = **52 primary scenes** (plus 7 section-intro transitions = 59 rows).
**Computed total runtime: 964 s ≈ 16 min 4 s** — comfortably within the ~18-minute target.

### Pace notes for the presenter
- If you need a tighter cut, trimming the ten P2 quick-confirmation scenes by a couple of seconds apiece brings the total under fifteen minutes with no loss of coverage.
- Flagship scenes to protect at full length: **A2.1-2** (genealogy), **A2.1-5** (slab posting), **A3.1-4** (out-of-spec HOLD), **A5-1** (production dashboard), **A1.1-1** (SAP SO intake) — the highest-value P1 moments; let them breathe.
- Keep the order → H2601 → C2601 thread explicit: name the same IDs in Scheduling, Operations, Quality, Reports and Integration so viewers see one order, not five disconnected demos.
