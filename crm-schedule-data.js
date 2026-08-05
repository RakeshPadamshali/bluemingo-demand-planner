/* ============================================================
   CRM (Cold Rolling Mill) — shared dummy line schedule + orders.
   Consumed by crm-schedule.html, crm-gantt.html, crm-slitting.html and
   crm-orders.html so all show the SAME jobs / orders / computed times.

   Full route (production operations only — no QA/inspection steps):
     Pickling -> Cold Rolling -> Electro-Cleaning -> Annealing (CAL | BAF)
     -> Skin-Pass -> [Galvanizing -> Colour Coating] -> finish (Slitting | Cut-to-Length)

   ORDER-FIRST model: a set of sales orders (each with an ordered qty + due date)
   is generated, and coils are generated to (partly) cover each order. So a coil's
   customer/product/grade come from its order, and orders aggregate many coils.
   ============================================================ */

/* Deterministic generator — same orders + coils on every load. */
var CRM_GEN = (function () {
  var CUSTOMERS = ['Continental Motors', 'Zenith Auto', 'Apex Heavy Engineering', 'National Power Equipment',
                   'Metro Structural Traders', 'Pioneer Appliances', 'Summit Projects', 'Vulcan Forge',
                   'Harbor Fabricators', 'Crestline Industries', 'Ironbridge Works', 'Delta Coil Traders'];
  var GRADES   = ['DC01', 'DC03', 'DC04', 'DC06'];
  var WIDTHS   = [900, 1000, 1050, 1180, 1250];
  var GAUGE    = [0.50, 0.60, 0.70, 0.80, 0.90, 1.00, 1.20, 1.50];
  var HRC      = [2.20, 2.50, 2.80, 3.00];
  var PRODUCTS = ['CRCA', 'GI', 'PPGI', 'GI', 'CRCA', 'GI', 'PPGI', 'CRCA', 'GI', 'CRCA'];
  var FILL     = [1.00, 1.00, 0.82, 1.00, 0.66, 1.00, 0.90, 1.00];   // coverage: some orders under-scheduled
  var DUE      = [3, 2, 4, 1, 5, 2, 6, 3, 1, 4];                       // due offset (days) from baseDate

  function slitFor(width, k) {
    var edge = width >= 1200 ? 25 : (width >= 1050 ? 20 : 15);
    var usable = width - 2 * edge, n = (k % 3 === 0) ? 3 : 2, w = Math.round(usable / n);
    var strips = [], sum = 0, x;
    for (x = 0; x < n - 1; x++) { strips.push(w); sum += w; }
    strips.push(usable - sum);       // last strip = remainder, so 2*edge + sum(strips) == width
    return { edge: edge, strips: strips };
  }

  var M = 30, orders = [], jobs = [], coilNo = 2270;
  for (var o = 0; o < M; o++) {
    var order = {
      id: 'SO-2026-' + (1001 + o),
      customer: CUSTOMERS[o % CUSTOMERS.length],
      product: PRODUCTS[o % PRODUCTS.length],
      grade: GRADES[o % GRADES.length],
      width: WIDTHS[o % WIDTHS.length],
      crcThk: GAUGE[o % GAUGE.length],
      hrcThk: HRC[o % HRC.length],
      finish: (o % 3 === 0) ? 'Slitting' : 'Cut-to-Length',
      orderedQty: 60 + (o * 31) % 108,        // 60 – 168 t
      dueOffsetDays: DUE[o % DUE.length]
    };
    var scheduledQty = order.orderedQty * FILL[o % FILL.length];
    var nCoils = Math.max(1, Math.round(scheduledQty / 26));
    var per = scheduledQty / nCoils;
    for (var c = 0; c < nCoils; c++) {
      var gi = jobs.length;                    // schedule sequence index
      var job = {
        sched: 'CRM-SCH-' + (2401 + gi),
        coil: 'CRC-A-' + (coilNo++),
        order: order.id,
        customer: order.customer,
        grade: order.grade,
        product: order.product,
        anneal: (gi % 6 === 5) ? 'BAF' : 'CAL',
        hrcThk: order.hrcThk,
        crcThk: order.crcThk,
        width: order.width,
        qty: Math.round(per * 10) / 10,
        finish: order.finish,
        status: 'Planned'
      };
      if (order.finish === 'Slitting') job.slit = slitFor(order.width, c);
      jobs.push(job);
    }
    orders.push(order);
  }
  // status by schedule position: early coils done, later still planned
  var T = jobs.length;
  jobs.forEach(function (j, i) {
    j.status = i < T * 0.12 ? 'Confirmed' : i < T * 0.28 ? 'In Process' : i < T * 0.55 ? 'Charged' : 'Planned';
  });
  return { orders: orders, jobs: jobs };
})();

window.CRM_SCHEDULE = {
  plant: 'Integrated Steel Works — Cold Rolling Mill (CRM)',
  shift: 'A–C', shiftTime: '3-day rolling plan', date: '11 May 2026', baseDate: '2026-05-11',
  baseMin: 6 * 60,                 // 06:00, in minutes-of-day
  buffer: 4,                       // transfer/buffer minutes between ops

  route: [
    { op: 'Pickling',        unit: 'Pickling Line PL-1',         min: 26, topo: 'TRANSFORM', eqp: 'CONTINUOUS', cls: 'g-pkl' },
    { op: 'Cold Rolling',    unit: 'Tandem Cold Mill TCM-1',     min: 24, topo: 'TRANSFORM', eqp: 'CONTINUOUS', cls: 'g-tcm' },
    { op: 'Electro-Cleaning', unit: 'Electro-Cleaning Line ECL-1', min: 20, topo: 'TRANSFORM', eqp: 'CONTINUOUS', cls: 'g-ecl' }
  ],
  anneal: {
    CAL: { op: 'Annealing', unit: 'Continuous Anneal CAL-1', min: 24, topo: 'TRANSFORM', eqp: 'CONTINUOUS', cls: 'g-cal' },
    BAF: { op: 'Annealing', unit: 'Batch Anneal BAF-1',      min: 60, topo: 'TRANSFORM', eqp: 'BATCH',      cls: 'g-baf' }
  },
  skinPass: { op: 'Skin-Pass', unit: 'Skin-Pass Mill SPM-1', min: 20, topo: 'TRANSFORM', eqp: 'CONTINUOUS', cls: 'g-spm' },
  coating: {
    'Galvanizing':    { op: 'Galvanizing',    unit: 'Galvanizing Line CGL-1',   min: 26, topo: 'TRANSFORM', eqp: 'CONTINUOUS', cls: 'g-gal' },
    'Colour Coating': { op: 'Colour Coating', unit: 'Colour Coating Line CCL-1', min: 22, topo: 'TRANSFORM', eqp: 'CONTINUOUS', cls: 'g-ccl' }
  },
  productPath: { 'CRCA': [], 'GI': ['Galvanizing'], 'PPGI': ['Galvanizing', 'Colour Coating'] },
  finish: {
    'Slitting':      { op: 'Slitting',      unit: 'Slitting Line SL-2',  min: 26, topo: 'SPLIT', eqp: 'CONTINUOUS', cls: 'g-slt' },
    'Cut-to-Length': { op: 'Cut-to-Length', unit: 'Cut-to-Length CTL-1', min: 24, topo: 'SPLIT', eqp: 'CONTINUOUS', cls: 'g-ctl' }
  },

  orders: CRM_GEN.orders,
  jobs: CRM_GEN.jobs
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

/* Forward scheduler over the shared single-unit lines.
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
  var units = S.route.map(function (o) { return o.unit; })
    .concat([S.anneal.CAL.unit, S.anneal.BAF.unit, S.skinPass.unit,
             S.coating['Galvanizing'].unit, S.coating['Colour Coating'].unit,
             S.finish['Slitting'].unit, S.finish['Cut-to-Length'].unit]);
  return { units: units, bars: bars, jobs: jobs };
};

/* Order-wise aggregation for the Order Status report.
   Returns one row per order with scheduled/produced qty, coverage, fulfilment,
   coil count and expected-completion offset (max planEnd, minutes from 06:00). */
window.crmOrders = function () {
  var R = window.crmSchedule(), byOrder = {};
  R.jobs.forEach(function (j) { (byOrder[j.order] = byOrder[j.order] || []).push(j); });
  return window.CRM_SCHEDULE.orders.map(function (o) {
    var cs = byOrder[o.id] || [];
    var sched = cs.reduce(function (a, c) { return a + c.qty; }, 0);
    var prod = cs.filter(function (c) { return c.status === 'Confirmed'; }).reduce(function (a, c) { return a + c.qty; }, 0);
    var wip = cs.filter(function (c) { return c.status === 'In Process' || c.status === 'Charged'; }).reduce(function (a, c) { return a + c.qty; }, 0);
    var expEnd = cs.length ? Math.max.apply(null, cs.map(function (c) { return c.planEnd; })) : 0;
    return {
      id: o.id, customer: o.customer, product: o.product, grade: o.grade, width: o.width,
      orderedQty: o.orderedQty, dueOffsetDays: o.dueOffsetDays, coils: cs.length,
      scheduledQty: sched, producedQty: prod, wipQty: wip, expectedEnd: expEnd,
      coverage: o.orderedQty ? sched / o.orderedQty : 0,
      fulfilment: o.orderedQty ? prod / o.orderedQty : 0
    };
  });
};

/* 06:00-based HH:MM for a minute offset (wraps past midnight). */
window.crmClock = function (mins) {
  var m = (window.CRM_SCHEDULE.baseMin + Math.round(mins)) % 1440;
  return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
};

/* Calendar date (weekday + D Mon) for a day offset from baseDate. */
window.crmDay = function (dayOffset) {
  var WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var b = new Date((window.CRM_SCHEDULE.baseDate || '2026-05-11') + 'T00:00:00');
  var dt = new Date(b.getTime() + dayOffset * 86400000);
  return { wd: WD[dt.getDay()], dm: dt.getDate() + ' ' + MO[dt.getMonth()] };
};
