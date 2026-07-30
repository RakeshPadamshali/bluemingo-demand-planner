/* ============================================================
   CRM (Cold Rolling Mill) — shared dummy line schedule.
   Consumed by crm-schedule.html (table) and crm-gantt.html (Gantt) so both
   show the SAME jobs and the SAME computed times.

   Full route (production operations only — no QA/inspection steps):
     Pickling -> Cold Rolling -> Electro-Cleaning -> Annealing (CAL | BAF)
     -> Skin-Pass -> [Galvanizing -> Colour Coating]  -> finish (Slitting | Cut-to-Length)
   The coating leg is product-driven:
     CRCA = uncoated, GI = hot-dip galvanized, PPGI = pre-painted galvanized.
   Annealing is per-coil either Continuous (CAL) or Batch furnace (BAF) — the
   BAF block is long and marks a BATCH-type unit vs the CONTINUOUS lines.
   ============================================================ */
window.CRM_SCHEDULE = {
  plant: 'Integrated Steel Works — Cold Rolling Mill (CRM)',
  shift: 'A', shiftTime: '06:00 – 14:00', date: '11 May 2026',
  baseMin: 6 * 60,                 // 06:00, in minutes-of-day
  buffer: 5,                       // transfer/buffer minutes between ops

  // Common pre-anneal route (every coil): {op, unit(lane), minutes, topology, equipment type, css}
  route: [
    { op: 'Pickling',        unit: 'Pickling Line PL-1',         min: 42, topo: 'TRANSFORM', eqp: 'CONTINUOUS', cls: 'g-pkl' },
    { op: 'Cold Rolling',    unit: 'Tandem Cold Mill TCM-1',     min: 30, topo: 'TRANSFORM', eqp: 'CONTINUOUS', cls: 'g-tcm' },
    { op: 'Electro-Cleaning', unit: 'Electro-Cleaning Line ECL-1', min: 16, topo: 'TRANSFORM', eqp: 'CONTINUOUS', cls: 'g-ecl' }
  ],
  // Annealing — each coil takes ONE of these (continuous line or batch furnace):
  anneal: {
    CAL: { op: 'Annealing', unit: 'Continuous Anneal CAL-1', min: 26, topo: 'TRANSFORM', eqp: 'CONTINUOUS', cls: 'g-cal' },
    BAF: { op: 'Annealing', unit: 'Batch Anneal BAF-1',      min: 82, topo: 'TRANSFORM', eqp: 'BATCH',      cls: 'g-baf' }
  },
  skinPass: { op: 'Skin-Pass', unit: 'Skin-Pass Mill SPM-1', min: 20, topo: 'TRANSFORM', eqp: 'CONTINUOUS', cls: 'g-spm' },
  // Coating ops inserted per product (after Skin-Pass, before finishing):
  coating: {
    'Galvanizing':    { op: 'Galvanizing',    unit: 'Galvanizing Line CGL-1',   min: 34, topo: 'TRANSFORM', eqp: 'CONTINUOUS', cls: 'g-gal' },
    'Colour Coating': { op: 'Colour Coating', unit: 'Colour Coating Line CCL-1', min: 30, topo: 'TRANSFORM', eqp: 'CONTINUOUS', cls: 'g-ccl' }
  },
  productPath: { 'CRCA': [], 'GI': ['Galvanizing'], 'PPGI': ['Galvanizing', 'Colour Coating'] },
  // Finishing op differs per job (SPLIT topology):
  finish: {
    'Slitting':      { op: 'Slitting',      unit: 'Slitting Line SL-2',  min: 34, topo: 'SPLIT', eqp: 'CONTINUOUS', cls: 'g-slt' },
    'Cut-to-Length': { op: 'Cut-to-Length', unit: 'Cut-to-Length CTL-1', min: 30, topo: 'SPLIT', eqp: 'CONTINUOUS', cls: 'g-ctl' }
  },

  // 8 dummy coils moving through the mill this shift.
  //   product = CRCA | GI | PPGI ;  anneal = CAL | BAF
  jobs: [
    { sched: 'CRM-SCH-2401', coil: 'CRC-A-2270', order: 'SO-2026-0502-11', customer: 'Continental Motors',      grade: 'DC04', product: 'CRCA', anneal: 'CAL', hrcThk: 2.80, crcThk: 0.70, width: 1250, qty: 26.2, finish: 'Cut-to-Length', status: 'Confirmed' },
    { sched: 'CRM-SCH-2402', coil: 'CRC-A-2271', order: 'SO-2026-0502-12', customer: 'Zenith Auto',             grade: 'DC01', product: 'GI',   anneal: 'CAL', hrcThk: 2.50, crcThk: 0.80, width: 1250, qty: 24.8, finish: 'Slitting',      status: 'In Process', slit: { edge: 25, strips: [600, 600] } },
    { sched: 'CRM-SCH-2403', coil: 'CRC-A-2272', order: 'SO-2026-0502-13', customer: 'Apex Heavy Engineering',  grade: 'DC03', product: 'CRCA', anneal: 'BAF', hrcThk: 3.00, crcThk: 1.20, width: 1180, qty: 27.5, finish: 'Cut-to-Length', status: 'In Process' },
    { sched: 'CRM-SCH-2404', coil: 'CRC-A-2273', order: 'SO-2026-0502-15', customer: 'National Power Equipment', grade: 'DC01', product: 'GI',   anneal: 'CAL', hrcThk: 2.50, crcThk: 0.60, width: 1000, qty: 20.4, finish: 'Slitting',      status: 'Charged', slit: { edge: 20, strips: [480, 480] } },
    { sched: 'CRM-SCH-2405', coil: 'CRC-A-2274', order: 'SO-2026-0502-14', customer: 'Metro Structural Traders', grade: 'DC01', product: 'PPGI', anneal: 'CAL', hrcThk: 2.50, crcThk: 0.80, width: 1250, qty: 24.0, finish: 'Slitting',      status: 'Charged', slit: { edge: 25, strips: [400, 400, 400] } },
    { sched: 'CRM-SCH-2406', coil: 'CRC-A-2275', order: 'SO-2026-0502-18', customer: 'Pioneer Appliances',      grade: 'DC06', product: 'PPGI', anneal: 'CAL', hrcThk: 2.20, crcThk: 0.50, width: 1050, qty: 18.9, finish: 'Slitting',      status: 'Charged', slit: { edge: 15, strips: [340, 340, 340] } },
    { sched: 'CRM-SCH-2407', coil: 'CRC-A-2276', order: 'SO-2026-0502-19', customer: 'Summit Projects',         grade: 'DC04', product: 'GI',   anneal: 'CAL', hrcThk: 2.80, crcThk: 1.00, width: 1250, qty: 26.0, finish: 'Cut-to-Length', status: 'Planned' },
    { sched: 'CRM-SCH-2408', coil: 'CRC-A-2277', order: 'SO-2026-0502-21', customer: 'Vulcan Forge',            grade: 'DC03', product: 'CRCA', anneal: 'BAF', hrcThk: 3.00, crcThk: 1.50, width: 900,  qty: 22.3, finish: 'Cut-to-Length', status: 'Planned' }
  ]
};

/* Build the ordered operation list a given coil runs through. */
window.crmJobOps = function (j) {
  var S = window.CRM_SCHEDULE;
  var coat = (S.productPath[j.product] || []).map(function (k) { return S.coating[k]; });
  return S.route
    .concat([S.anneal[j.anneal] || S.anneal.CAL])
    .concat([S.skinPass])
    .concat(coat)
    .concat([S.finish[j.finish]]);
};

/* Forward scheduler over the shared single-unit lines (a unit is taken at
   max(job-ready, unit-free); the next op starts after this op + buffer).
   Returns { units[], bars[{job,segs[]}], jobs[ + planStart/planEnd ] }. */
window.crmSchedule = function () {
  var S = window.CRM_SCHEDULE, free = {}, bars = [], jobs = [];
  S.jobs.forEach(function (j) {
    var ops = window.crmJobOps(j);
    var ready = 0, segs = [], first = null, last = 0;
    ops.forEach(function (op) {
      var t = Math.max(ready, free[op.unit] || 0);
      segs.push({ unit: op.unit, start: t, dur: op.min, cls: op.cls, op: op.op, topo: op.topo, eqp: op.eqp });
      free[op.unit] = t + op.min;
      ready = t + op.min + S.buffer;
      if (first === null) first = t;
      last = t + op.min;
    });
    bars.push({ job: j, segs: segs });
    jobs.push(Object.assign({}, j, { planStart: first, planEnd: last }));
  });
  // Lane order top-to-bottom = process flow.
  var units = S.route.map(function (o) { return o.unit; })
    .concat([S.anneal.CAL.unit, S.anneal.BAF.unit, S.skinPass.unit,
             S.coating['Galvanizing'].unit, S.coating['Colour Coating'].unit,
             S.finish['Slitting'].unit, S.finish['Cut-to-Length'].unit]);
  return { units: units, bars: bars, jobs: jobs };
};

/* 06:00-based HH:MM for a minute offset. */
window.crmClock = function (mins) {
  var m = (window.CRM_SCHEDULE.baseMin + Math.round(mins)) % 1440;
  return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
};
