/* ============================================================
   CRM (Cold Rolling Mill) — shared dummy line schedule.
   Consumed by crm-schedule.html (table), crm-gantt.html (Gantt) and
   crm-slitting.html (report) so all show the SAME jobs / computed times.

   Full route (production operations only — no QA/inspection steps):
     Pickling -> Cold Rolling -> Electro-Cleaning -> Annealing (CAL | BAF)
     -> Skin-Pass -> [Galvanizing -> Colour Coating] -> finish (Slitting | Cut-to-Length)
   Coating leg is product-driven: CRCA = uncoated, GI = galvanized, PPGI = pre-painted.
   Annealing is per coil Continuous (CAL) or Batch furnace (BAF, a long BATCH block).

   The job list is GENERATED to fill a full production day (3 shifts, ~24 h).
   ============================================================ */
window.CRM_SCHEDULE = {
  plant: 'Integrated Steel Works — Cold Rolling Mill (CRM)',
  shift: 'A–C', shiftTime: '3-day rolling plan', date: '11 May 2026', baseDate: '2026-05-11',
  baseMin: 6 * 60,                 // 06:00, in minutes-of-day
  buffer: 4,                       // transfer/buffer minutes between ops

  // Common pre-anneal route (every coil): {op, unit(lane), minutes, topology, equipment type, css}
  route: [
    { op: 'Pickling',        unit: 'Pickling Line PL-1',         min: 26, topo: 'TRANSFORM', eqp: 'CONTINUOUS', cls: 'g-pkl' },
    { op: 'Cold Rolling',    unit: 'Tandem Cold Mill TCM-1',     min: 24, topo: 'TRANSFORM', eqp: 'CONTINUOUS', cls: 'g-tcm' },
    { op: 'Electro-Cleaning', unit: 'Electro-Cleaning Line ECL-1', min: 20, topo: 'TRANSFORM', eqp: 'CONTINUOUS', cls: 'g-ecl' }
  ],
  // Annealing — each coil takes ONE of these (continuous line or batch furnace):
  anneal: {
    CAL: { op: 'Annealing', unit: 'Continuous Anneal CAL-1', min: 24, topo: 'TRANSFORM', eqp: 'CONTINUOUS', cls: 'g-cal' },
    BAF: { op: 'Annealing', unit: 'Batch Anneal BAF-1',      min: 60, topo: 'TRANSFORM', eqp: 'BATCH',      cls: 'g-baf' }
  },
  skinPass: { op: 'Skin-Pass', unit: 'Skin-Pass Mill SPM-1', min: 20, topo: 'TRANSFORM', eqp: 'CONTINUOUS', cls: 'g-spm' },
  // Coating ops inserted per product (after Skin-Pass, before finishing):
  coating: {
    'Galvanizing':    { op: 'Galvanizing',    unit: 'Galvanizing Line CGL-1',   min: 26, topo: 'TRANSFORM', eqp: 'CONTINUOUS', cls: 'g-gal' },
    'Colour Coating': { op: 'Colour Coating', unit: 'Colour Coating Line CCL-1', min: 22, topo: 'TRANSFORM', eqp: 'CONTINUOUS', cls: 'g-ccl' }
  },
  productPath: { 'CRCA': [], 'GI': ['Galvanizing'], 'PPGI': ['Galvanizing', 'Colour Coating'] },
  // Finishing op differs per job (SPLIT topology):
  finish: {
    'Slitting':      { op: 'Slitting',      unit: 'Slitting Line SL-2',  min: 26, topo: 'SPLIT', eqp: 'CONTINUOUS', cls: 'g-slt' },
    'Cut-to-Length': { op: 'Cut-to-Length', unit: 'Cut-to-Length CTL-1', min: 24, topo: 'SPLIT', eqp: 'CONTINUOUS', cls: 'g-ctl' }
  },

  // A full day of coils moving through the mill (deterministic — same on every load).
  //   product = CRCA | GI | PPGI ;  anneal = CAL | BAF
  jobs: (function () {
    var CUSTOMERS = ['Continental Motors', 'Zenith Auto', 'Apex Heavy Engineering', 'National Power Equipment',
                     'Metro Structural Traders', 'Pioneer Appliances', 'Summit Projects', 'Vulcan Forge',
                     'Harbor Fabricators', 'Crestline Industries', 'Ironbridge Works', 'Delta Coil Traders'];
    var GRADES   = ['DC01', 'DC03', 'DC04', 'DC06'];
    var WIDTHS   = [900, 1000, 1050, 1180, 1250];
    var GAUGE    = [0.50, 0.60, 0.70, 0.80, 0.90, 1.00, 1.20, 1.50];
    var HRC      = [2.20, 2.50, 2.80, 3.00];
    var PRODUCTS = ['CRCA', 'GI', 'PPGI', 'GI', 'CRCA', 'GI', 'PPGI', 'CRCA', 'GI', 'CRCA'];
    var N = 120, jobs = [];
    function slitFor(width, i) {
      var edge = width >= 1200 ? 25 : (width >= 1050 ? 20 : 15);
      var usable = width - 2 * edge, n = (i % 3 === 0) ? 3 : 2, w = Math.round(usable / n);
      var strips = [], sum = 0, k;
      for (k = 0; k < n - 1; k++) { strips.push(w); sum += w; }
      strips.push(usable - sum);          // last strip takes the remainder -> sum == usable exactly
      return { edge: edge, strips: strips };
    }
    function statusFor(i) {
      if (i < N * 0.12) return 'Confirmed';
      if (i < N * 0.28) return 'In Process';
      if (i < N * 0.55) return 'Charged';
      return 'Planned';
    }
    for (var i = 0; i < N; i++) {
      var width = WIDTHS[i % WIDTHS.length];
      var finish = (i % 3 === 0) ? 'Slitting' : 'Cut-to-Length';
      var job = {
        sched: 'CRM-SCH-' + (2401 + i),
        coil: 'CRC-A-' + (2270 + i),
        order: 'SO-2026-050' + (2 + Math.floor(i / 8)) + '-' + (11 + (i % 8)),
        customer: CUSTOMERS[i % CUSTOMERS.length],
        grade: GRADES[i % GRADES.length],
        product: PRODUCTS[i % PRODUCTS.length],
        anneal: (i % 6 === 5) ? 'BAF' : 'CAL',
        hrcThk: HRC[i % HRC.length],
        crcThk: GAUGE[i % GAUGE.length],
        width: width,
        qty: (180 + (i * 37) % 115) / 10,   // 18.0 – 29.4 t, deterministic spread
        finish: finish,
        status: statusFor(i)
      };
      if (finish === 'Slitting') job.slit = slitFor(width, i);
      jobs.push(job);
    }
    return jobs;
  })()
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

/* 06:00-based HH:MM for a minute offset (wraps past midnight). */
window.crmClock = function (mins) {
  var m = (window.CRM_SCHEDULE.baseMin + Math.round(mins)) % 1440;
  return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
};
