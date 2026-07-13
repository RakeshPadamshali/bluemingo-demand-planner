/* ============================================================
   Bluemingo MES v2 — Integrated Works demo seed dataset
   Single source of truth for every demo screen. Values mirror
   the customer demo scenario (Heat H2601 -> slabs -> coil C2601,
   SMS-2 KR->BOF->ARS->LHF->RH->CCM, HSM-2, grade IS 2062 E250).
   ============================================================ */
window.MES_DATA = {

  plant: { name: 'Integrated Steel Works', shift: 'B', shiftTime: '14:00–22:00', date: '07 Jul 2026' },

  /* ---- Sales order (from SAP-SD) ---- */
  order: {
    no: 'SO-2026-04471', line: '10', customer: 'Apex Heavy Engineering',
    material: 'HRC — Hot Rolled Coil', grade: 'IS 2062 E250', qty: 5000, uom: 'MT',
    thickness: '2.50 mm', width: '1250 mm', delivery: '28 Jul 2026', source: 'SAP-SD',
    status: 'In Production', received: '07 Jul 2026 14:06'
  },

  /* ---- Order book (sales orders already in MES) ---- */
  orders: [
    { no: 'SO-2026-04455', line: '10', customer: 'Continental Motors — West',           material: 'HRC — Hot Rolled Coil', grade: 'IS 2062 E250', qty: 3200, uom: 'MT', thickness: '3.00 mm', width: '1500 mm', delivery: '24 Jul 2026', status: 'In Production', source: 'SAP-SD', received: '05 Jul 2026 09:12', po: '4500090514' },
    { no: 'SO-2026-04460', line: '20', customer: 'Zenith Auto — Manesar',       material: 'CRC — Cold Rolled Coil', grade: 'DC01',        qty: 1800, uom: 'MT', thickness: '0.80 mm', width: '1250 mm', delivery: '30 Jul 2026', status: 'Scheduled',     source: 'SAP-SD', received: '05 Jul 2026 11:40', po: '4500090547' },
    { no: 'SO-2026-04463', line: '10', customer: 'Titan Commercial — Hosur',         material: 'HRC — Hot Rolled Coil', grade: 'IS 2062 E350', qty: 2400, uom: 'MT', thickness: '5.00 mm', width: '1600 mm', delivery: '27 Jul 2026', status: 'Scheduled',     source: 'SAP-SD', received: '06 Jul 2026 07:22', po: '4500090603' },
    { no: 'SO-2026-04468', line: '10', customer: 'National Power — Trichy',                 material: 'Plate',                 grade: 'IS 2062 E350', qty: 2600, uom: 'MT', thickness: '12.0 mm', width: '2500 mm', delivery: '02 Aug 2026', status: 'Created',       source: 'SAP-SD', received: '06 Jul 2026 08:05', po: '4500090651' },
    { no: 'SO-2026-04471', line: '10', customer: 'Apex Heavy Engineering', material: 'HRC — Hot Rolled Coil', grade: 'IS 2062 E250', qty: 5000, uom: 'MT', thickness: '2.50 mm', width: '1250 mm', delivery: '28 Jul 2026', status: 'In Production', source: 'SAP-SD', received: '07 Jul 2026 14:06', po: '4500090712' },
    { no: 'SO-2026-04474', line: '10', customer: 'Meridian SAW — Nashik',           material: 'HRC — Hot Rolled Coil', grade: 'API 5L X60',   qty: 4500, uom: 'MT', thickness: '6.35 mm', width: '1650 mm', delivery: '06 Aug 2026', status: 'Created',       source: 'SAP-SD', received: '07 Jul 2026 16:31', po: '4500090778' },
    { no: 'SO-2026-04477', line: '10', customer: 'Cascade Ferrous — Pune',      material: 'Plate',                 grade: 'IS 2062 E250', qty: 2100, uom: 'MT', thickness: '16.0 mm', width: '2200 mm', delivery: '09 Aug 2026', status: 'Created',       source: 'SAP-SD', received: '08 Jul 2026 06:50', po: '4500090804' },
    { no: 'SO-2026-04480', line: '20', customer: 'Union Steel — Mumbai dealer',          material: 'HRC — Hot Rolled Coil', grade: 'SAILMA 350',   qty: 3600, uom: 'MT', thickness: '4.00 mm', width: '1250 mm', delivery: '11 Aug 2026', status: 'Created',       source: 'SAP-SD', received: '08 Jul 2026 10:18', po: '4500090839' },
    { no: 'SO-2026-04483', line: '10', customer: 'Metro Structural Traders', material: 'HRC — Hot Rolled Coil', grade: 'IS 2062 E250', qty: 2800, uom: 'MT', thickness: '4.00 mm', width: '1250 mm', delivery: '30 Jul 2026', status: 'Created',       source: 'SAP-SD', received: '08 Jul 2026 12:02', po: '4500090861' },
    { no: 'SO-2026-04485', line: '10', customer: 'Delta Steel — Kolkata',         material: 'HRC — Hot Rolled Coil', grade: 'IS 2062 E250', qty: 2200, uom: 'MT', thickness: '5.00 mm', width: '1250 mm', delivery: '01 Aug 2026', status: 'Created',       source: 'SAP-SD', received: '08 Jul 2026 13:47', po: '4500090884' },
    { no: 'SO-2026-04487', line: '10', customer: 'Sterling Forgings — Pune',          material: 'HRC — Hot Rolled Coil', grade: 'IS 2062 E350', qty: 3000, uom: 'MT', thickness: '6.00 mm', width: '1250 mm', delivery: '03 Aug 2026', status: 'Created',       source: 'SAP-SD', received: '08 Jul 2026 15:20', po: '4500090907' }
  ],

  /* ---- SAP-SD inbox — pending sales orders SAP can push into MES (pull via "Receive SO") ---- */
  sapInbox: [
    { no: 'SO-2026-04482', line: '10', customer: 'Titan Commercial — Ennore',   material: 'HRC — Hot Rolled Coil', grade: 'IS 2062 E250', qty: 4200, uom: 'MT', thickness: '3.20 mm', width: '1450 mm', delivery: '05 Aug 2026', idoc: 'ORDERS05 / 0000047821', po: '4500091277' },
    { no: 'SO-2026-04486', line: '10', customer: 'Meridian Pipes — Nashik',     material: 'HRC — Hot Rolled Coil', grade: 'API 5L X60',   qty: 6800, uom: 'MT', thickness: '6.00 mm', width: '1600 mm', delivery: '10 Aug 2026', idoc: 'ORDERS05 / 0000047835', po: '4500091302' },
    { no: 'SO-2026-04490', line: '20', customer: 'Cascade — Pune',          material: 'Plate',                 grade: 'IS 2062 E250', qty: 2100, uom: 'MT', thickness: '20.0 mm', width: '2200 mm', delivery: '12 Aug 2026', idoc: 'ORDERS05 / 0000047849', po: '4500091318' },
    { no: 'SO-2026-04495', line: '10', customer: 'Everest Thermal — Pune',            material: 'HRC — Hot Rolled Coil', grade: 'IS 2062 E250', qty: 3600, uom: 'MT', thickness: '4.00 mm', width: '1250 mm', delivery: '15 Aug 2026', idoc: 'ORDERS05 / 0000047860', po: '4500091334' },
    { no: 'SO-2026-04499', line: '10', customer: 'Summit Projects — Mumbai',    material: 'Plate',                 grade: 'IS 2062 E350', qty: 5200, uom: 'MT', thickness: '25.0 mm', width: '3000 mm', delivery: '18 Aug 2026', idoc: 'ORDERS05 / 0000047872', po: '4500091351' }
  ],

  /* ---- Grade spec / TDC (3-tier: standard vs order aim) ---- */
  grade: 'IS 2062 E250',
  spec: [
    { el: 'C',  unit: '%', stdMax: 0.220, aimMin: 0.040, aimMax: 0.090 },
    { el: 'Mn', unit: '%', stdMax: 1.500, aimMin: 0.900, aimMax: 1.400 },
    { el: 'S',  unit: '%', stdMax: 0.045, aimMin: 0.000, aimMax: 0.020 },
    { el: 'P',  unit: '%', stdMax: 0.045, aimMin: 0.000, aimMax: 0.030 },
    { el: 'Si', unit: '%', stdMax: 0.400, aimMin: 0.100, aimMax: 0.250 }
  ],

  /* ---- Typical ladle chemistry min/max per grade (linked from the scheduling heat table) ---- */
  gradeSpecs: {
    'IS 2062 E250': [ { el: 'C', min: 0.12, max: 0.22 }, { el: 'Mn', min: 0.60, max: 1.50 }, { el: 'Si', min: 0.10, max: 0.40 }, { el: 'S', min: 0, max: 0.045 }, { el: 'P', min: 0, max: 0.045 }, { el: 'CE', min: null, max: 0.42 } ],
    'IS 2062 E350': [ { el: 'C', min: 0.12, max: 0.20 }, { el: 'Mn', min: 0.80, max: 1.50 }, { el: 'Si', min: 0.15, max: 0.45 }, { el: 'S', min: 0, max: 0.045 }, { el: 'P', min: 0, max: 0.045 }, { el: 'CE', min: null, max: 0.47 } ],
    'SAILMA 350':   [ { el: 'C', min: 0.12, max: 0.20 }, { el: 'Mn', min: 0.70, max: 1.50 }, { el: 'Si', min: 0.10, max: 0.50 }, { el: 'S', min: 0, max: 0.045 }, { el: 'P', min: 0, max: 0.045 }, { el: 'CE', min: null, max: 0.44 } ],
    'API 5L X60':   [ { el: 'C', min: 0.08, max: 0.16 }, { el: 'Mn', min: 1.00, max: 1.40 }, { el: 'Si', min: 0.15, max: 0.40 }, { el: 'S', min: 0, max: 0.015 }, { el: 'P', min: 0, max: 0.020 }, { el: 'Nb+V+Ti', min: null, max: 0.15 }, { el: 'CE', min: null, max: 0.43 } ]
  },
  mechSpec: { ys: '250 MPa min', uts: '410–510 MPa', elong: '23% min' },

  /* ---- The tracked heat ---- */
  heat: {
    no: 'H2601', grade: 'IS 2062 E250', ladle: 'L-02', castStrand: 'CCM1',
    currentUnit: 'BOF1', currentStep: 'Blowing', enteredStep: '15:42', elapsed: '11 min',
    chemistryStatus: 'Pending', plannedTapWt: 165, uom: 'MT'
  },

  /* ---- SMS-2 route + heat genealogy (Torpedo -> ... -> CCM -> slabs) ---- */
  smsRoute: ['Torpedo', 'KR', 'BOF', 'ARS', 'LHF', 'RH', 'CCM'],
  units: { BOF: ['BOF1', 'BOF2', 'BOF3'], CCM: ['CCM1', 'CCM2'] },
  genealogy: [
    { unit: 'Torpedo', desc: 'Hot metal — Torpedo #TPC-14', ts: '14:35', operator: 'R. Naik',   key: 'HM 168 MT · Si 0.42%' },
    { unit: 'KR',      desc: 'Desulphurisation (KR)',        ts: '14:58', operator: 'R. Naik',   key: 'S 0.028 → 0.006%' },
    { unit: 'BOF1',    desc: 'Basic Oxygen Furnace — Blow',  ts: '15:42', operator: 'S. Kadam',  key: 'Tap 165 MT · T 1662°C' },
    { unit: 'ARS',     desc: 'Argon Rinsing Station',        ts: '—',     operator: '—',         key: 'Queued' },
    { unit: 'LHF',     desc: 'Ladle Heating Furnace',        ts: '—',     operator: '—',         key: 'Queued' },
    { unit: 'RH',      desc: 'RH Degasser',                  ts: '—',     operator: '—',         key: 'Queued' },
    { unit: 'CCM1',    desc: 'Caster strand CCM1',           ts: '—',     operator: '—',         key: '2 slabs planned' }
  ],

  /* ---- Slabs produced from the heat (14–20 char alphanumeric IDs) ---- */
  slabs: [
    { id: 'ISWCC1H2601S001', heat: 'H2601', wt: 26.4, strand: 'CCM1', grade: 'IS 2062 E250', size: '210 × 1250 × 9200 mm', status: 'Produced', hotCharge: true },
    { id: 'ISWCC1H2601S002', heat: 'H2601', wt: 24.8, strand: 'CCM1', grade: 'IS 2062 E250', size: '210 × 1250 × 8650 mm', status: 'Produced', hotCharge: false }
  ],

  /* ---- HSM-2 route + coil ---- */
  hsmRoute: ['Charging Table', 'RHF1', 'Descalar', 'Roughing Mill', 'Crop Shear', 'Finishing Mill', 'Down Coiler'],
  coil: {
    id: 'ISWHSM2C2601001', ref: 'C2601', fromSlab: 'ISWCC1H2601S001', grade: 'IS 2062 E250',
    wt: 25.9, thickness: '2.50 mm', width: '1250 mm', status: 'Produced, Pending QC',
    ys: 285, uts: 420, elong: 27, surface: 'Surface SIS — pending'
  },

  /* ---- HSM-2 slab inventory (arrived from CCM / SYMS yard) ---- */
  hsmInv: [
    { id: 'ISWCC1H2601S001', heat: 'H2601', grade: 'IS 2062 E250', thk: 210, width: 1250, len: 9200, wt: 26.4, charge: 'Hot',  surf: 842, arrived: '18:47', gauge: 2.50, coilRef: 'C2601' },
    { id: 'ISWCC1H2601S002', heat: 'H2601', grade: 'IS 2062 E250', thk: 210, width: 1250, len: 8650, wt: 24.8, charge: 'Cold', surf: 41,  arrived: '18:52', gauge: 3.00, coilRef: 'C2602' },
    { id: 'ISWCC2H2603S001', heat: 'H2603', grade: 'IS 2062 E350', thk: 210, width: 1250, len: 9000, wt: 25.9, charge: 'Cold', surf: 38,  arrived: '18:30', gauge: 4.00, coilRef: 'C2603' },
    { id: 'ISWCC2H2602S001', heat: 'H2602', grade: 'SAILMA 350',   thk: 210, width: 1250, len: 8900, wt: 25.4, charge: 'Cold', surf: 36,  arrived: '18:20', gauge: 5.00, coilRef: 'C2604' },
    { id: 'ISWCC1H2607S001', heat: 'H2607', grade: 'API 5L X60',   thk: 210, width: 1250, len: 9200, wt: 26.6, charge: 'Cold', surf: 35,  arrived: '18:12', gauge: 6.00, coilRef: 'C2605' }
  ],
  kickbackReasons: [
    { code: 'KB-SURF',   desc: 'Surface defect (scale / scratch)',  stage: 'Finishing Mill', disp: 'Re-roll' },
    { code: 'KB-GAUGE',  desc: 'Off-gauge / thickness out of tol',  stage: 'Finishing Mill', disp: 'Re-roll' },
    { code: 'KB-EDGE',   desc: 'Edge crack',                        stage: 'Roughing Mill',  disp: 'Return to yard' },
    { code: 'KB-TEMP',   desc: 'Low finishing temperature',         stage: 'RHF1',           disp: 'Return to yard' },
    { code: 'KB-COBBLE', desc: 'Cobble / mis-roll',                 stage: 'Finishing Mill', disp: 'Scrap' },
    { code: 'KB-WIDTH',  desc: 'Width out of tolerance',            stage: 'Roughing Mill',  disp: 'Re-roll' }
  ],

  /* ---- Ladle pool ---- */
  ladles: [
    { id: 'L-01', status: 'available', heatsLeft: 38, life: 60, lining: 'OK',        temp: '—' },
    { id: 'L-02', status: 'in-use',    heatsLeft: 22, life: 60, lining: 'OK',        temp: '1585°C', heat: 'H2601' },
    { id: 'L-03', status: 'cooling',   heatsLeft: 31, life: 60, lining: 'OK',        temp: '820°C' },
    { id: 'L-04', status: 'repair',    heatsLeft: 0,  life: 60, lining: 'Relining',  temp: '—' },
    { id: 'L-05', status: 'available', heatsLeft: 47, life: 60, lining: 'OK',        temp: '—' },
    { id: 'L-06', status: 'available', heatsLeft: 3,  life: 60, lining: 'Near limit', temp: '—' }
  ],

  /* ---- Sample plan per heat (~15) ---- */
  samples: [
    { point: 'Torpedo', count: 1, tests: 'HM chemistry' },
    { point: 'KR',      count: 2, tests: 'S after desulph' },
    { point: 'BOF',     count: 4, tests: 'C, Mn, S, P (turndown)' },
    { point: 'LF',      count: 5, tests: 'Full chemistry + trim' },
    { point: 'Tundish', count: 1, tests: 'Cast chemistry' },
    { point: 'CCM',     count: 2, tests: 'Product chemistry' }
  ],

  labs: ['MS Central Lab', 'Container Lab'],

  /* ---- Schedule (SMS-2, 24h horizon) — feeds the Gantt ---- */
  schedule: {
    horizonHrs: 24, bofs: 3, ccmStrands: 2,
    durations: { BOF: 40, LHF: 35, RH: 30, CCM: 88, setup: 8, buffer: 6 },
    slab: { thk: 210, width: 1250 },   // all grades cast to the same slab size this campaign — so caster setup triggers on grade change only
    heats: [
      { no: 'H2601', grade: 'IS 2062 E250', tonnage: 165, ladle: 'L-02', bfTap: 'BF2-T4521', bof: 'BOF1', ccm: 'CCM1', start: 0,   hotCharge: true  },
      { no: 'H2603', grade: 'IS 2062 E350', tonnage: 162, ladle: 'L-05', bfTap: 'BF2-T4523', bof: 'BOF2', ccm: 'CCM2', start: 44,  hotCharge: false },
      { no: 'H2602', grade: 'IS 2062 E250', tonnage: 163, ladle: 'L-01', bfTap: 'BF2-T4522', bof: 'BOF3', ccm: 'CCM1', start: 88,  hotCharge: true  },
      { no: 'H2607', grade: 'IS 2062 E350', tonnage: 165, ladle: 'L-03', bfTap: 'BF3-T7812', bof: 'BOF1', ccm: 'CCM2', start: 132, hotCharge: false },
      { no: 'H2604', grade: 'IS 2062 E250', tonnage: 166, ladle: 'L-06', bfTap: 'BF3-T7810', bof: 'BOF2', ccm: 'CCM1', start: 176, hotCharge: true  },
      { no: 'H2610', grade: 'IS 2062 E350', tonnage: 163, ladle: 'L-05', bfTap: 'BF2-T4527', bof: 'BOF3', ccm: 'CCM2', start: 220, hotCharge: false },
      { no: 'H2605', grade: 'SAILMA 350',   tonnage: 164, ladle: 'L-01', bfTap: 'BF3-T7811', bof: 'BOF1', ccm: 'CCM1', start: 264, hotCharge: false },
      { no: 'H2606', grade: 'API 5L X60',   tonnage: 166, ladle: 'L-03', bfTap: 'BF2-T4524', bof: 'BOF2', ccm: 'CCM2', start: 308, hotCharge: false },
      { no: 'H2608', grade: 'SAILMA 350',   tonnage: 161, ladle: 'L-02', bfTap: 'BF2-T4525', bof: 'BOF3', ccm: 'CCM1', start: 352, hotCharge: false },
      { no: 'H2609', grade: 'API 5L X60',   tonnage: 164, ladle: 'L-05', bfTap: 'BF2-T4526', bof: 'BOF1', ccm: 'CCM2', start: 396, hotCharge: false },
      { no: 'H2611', grade: 'SAILMA 350',   tonnage: 165, ladle: 'L-01', bfTap: 'BF3-T7814', bof: 'BOF2', ccm: 'CCM1', start: 440, hotCharge: false },
      { no: 'H2612', grade: 'API 5L X60',   tonnage: 162, ladle: 'L-03', bfTap: 'BF3-T7815', bof: 'BOF3', ccm: 'CCM2', start: 484, hotCharge: false }
    ]
  },

  /* ---- Delays ---- */
  delays: [
    { code: 'DLY-PWR',    desc: 'Power supply interruption', unit: 'RH',   type: 'Unplanned', mins: 18, heat: 'H2601' },
    { code: 'DLY-LADLE',  desc: 'Ladle not ready',           unit: 'BOF2', type: 'Planned',   mins: 12, heat: 'H2602' },
    { code: 'DLY-NOZZLE', desc: 'Nozzle / SEN change',       unit: 'CCM1', type: 'Unplanned', mins: 9,  heat: 'H2603' },
    { code: 'DLY-CHEM',   desc: 'Awaiting chemistry',        unit: 'LHF',  type: 'Unplanned', mins: 14, heat: 'H2601' }
  ],

  /* ---- Yards ---- */
  yard: {
    syms: { name: 'SYMS — Slab Yard', capacityMT: 40000, occupiedMT: 31240, rows: 6, cols: 14 },
    cyms: { name: 'CYMS — Coil Yard', capacityMT: 26000, occupiedMT: 18900, rows: 5, cols: 12 },
    rake: { name: 'Rake Yard', wagonsPlaced: 42, rakeNo: 'RK-2609' }
  },

  /* ---- Integration interfaces (health) ---- */
  interfaces: [
    { name: 'SAP-SD',            kind: 'SAP', dir: 'in',  status: 'green', last: '15:51' },
    { name: 'SAP-PP',            kind: 'SAP', dir: 'out', status: 'green', last: '15:49' },
    { name: 'SAP-QM',            kind: 'SAP', dir: 'out', status: 'green', last: '15:33' },
    { name: 'SAP-PM',            kind: 'SAP', dir: 'out', status: 'amber', last: '14:12' },
    { name: 'SAP-MM',            kind: 'SAP', dir: 'out', status: 'green', last: '15:40' },
    { name: 'BOF-L2',kind: 'L2',  dir: 'both',status: 'green', last: '15:52' },
    { name: 'CCM-L2',kind: 'L2',  dir: 'in',  status: 'green', last: '15:50' },
    { name: 'Mill-L2 (HSM-2)',   kind: 'L2',  dir: 'both',status: 'green', last: '15:48' },
    { name: 'SYMS',              kind: 'Yard',dir: 'both',status: 'green', last: '15:47' },
    { name: 'CYMS',              kind: 'Yard',dir: 'both',status: 'green', last: '15:45' },
    { name: 'MS Central Lab',    kind: 'Lab', dir: 'in',  status: 'green', last: '15:38' },
    { name: 'Container Lab',     kind: 'Lab', dir: 'in',  status: 'green', last: '15:20' },
    { name: 'Surface SIS',      kind: 'QC',  dir: 'in',  status: 'green', last: '15:44' }
  ],

  /* ---- KPIs (current shift) ---- */
  kpis: {
    heatsCast: { val: 18, plan: 20 }, slabsProduced: { val: 41, plan: 44 },
    coilsRolled: { val: 27, plan: 30 }, yieldPct: { val: 97.3, plan: 97.5 },
    oee: { val: 82.5, plan: 85.0 }, holds: { val: 3, aging: 1 }
  },

  /* ---- Track A scenario map (home page) ---- */
  scenarios: [
    { id: 'scheduling',  code: 'A1', icon: 'fa-calendar-days', href: 'scheduling.html',
      title: 'Scheduling & Order Management',
      desc: 'Sales order intake, SMS-2 heat sequencing, Time-Plan Gantt, reactive re-scheduling and ladle scheduling.',
      tags: ['Order Book', 'Heat Gantt', 'Ladle'] },
    { id: 'operations',  code: 'A2', icon: 'fa-industry', href: 'operations.html',
      title: 'Operations & Production Tracking',
      desc: 'Live heat lifecycle, full genealogy tree, manual/L2 readings, delay capture, slab & HSM-2 coil tracking.',
      tags: ['Heat Tracking', 'Genealogy', 'HSM-2 Coil'] },
    { id: 'quality',     code: 'A3', icon: 'fa-flask', href: 'quality-chemistry.html',
      title: 'Quality Management',
      desc: 'Sample plans, lab chemistry vs spec, out-of-spec holds, coil quality decision, downgrade, AUD and FG recall.',
      tags: ['Sampling', 'Chemistry', 'Coil QC'] },
    { id: 'yard',        code: 'A4', icon: 'fa-warehouse', href: 'yard.html',
      title: 'Yard Management · SYMS / CYMS',
      desc: 'Visual slab yard, slab allocation to HSM-2, coil yard and rake-wise dispatch with railway memo.',
      tags: ['SYMS', 'CYMS', 'Rake'] },
    { id: 'reports',     code: 'A5', icon: 'fa-chart-line', href: 'reports.html',
      title: 'MIS Reports & Dashboards',
      desc: 'Production dashboard vs plan, heat-wise / delay / quality-hold / order-tracking reports, mobile view.',
      tags: ['KPIs', 'OEE', 'Pareto'] },
    { id: 'integration', code: 'A6', icon: 'fa-plug', href: 'integration.html',
      title: 'System Integration',
      desc: 'SAP (SD/PP/QM/PM/MM) and L2 (BOF / CCM / Mill) message flows plus a live interface-health monitor.',
      tags: ['SAP', 'L2 PDI/PDO', 'Monitor'] },
    { id: 'security',    code: 'A7', icon: 'fa-shield-halved', href: 'security.html',
      title: 'Security & Access Control',
      desc: 'Role-based menus, AD/SSO login, plant-based segregation, non-repudiable audit trail and encryption.',
      tags: ['RBAC', 'AD/SSO', 'Audit'] }
  ]
};
