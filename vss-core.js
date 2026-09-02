/* Vardhman Special Steels demo — shared helpers over window.VSS (from vss-data.js).
   Times are integer MINUTES from baseDate midnight (2026-07-01). "As of" = mid-plan
   so orders show a realistic spread across stages.
   vssPlan() is the ORDER-LEVEL forward scheduler: orders are sequenced by delivery date at
   the plant's planning grain (RDD week; descending size within the week = rolling-cycle
   rule), booked on real machines along their route at the sheet's capacities (rolling mill:
   size-wise Bdgt Prdty/Day, 90% yield, 2 h/day non-productive, Roll-Set changeover types),
   parallel lines are load-balanced (least-loaded first), open billet stock is used before casting. */
(function () {
  var V = window.VSS;
  var BASE = new Date(V.meta.baseDate + 'T00:00:00');
  var AS_OF_MIN = 5 * 1440;                     // 2026-07-06
  V.meta.asOf = '2026-07-06';
  var WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  window.VSS_BASE = BASE;
  window.VSS_ASOF_MIN = AS_OF_MIN;
  function vssDateAt(min) { return new Date(BASE.getTime() + min * 60000); }
  window.vssDateAt = vssDateAt;
  window.vssClock = function (min) { var d = vssDateAt(min); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
  window.vssDayLabel = function (min) { var d = vssDateAt(min); return { wd: WD[d.getDay()], dm: d.getDate() + ' ' + MO[d.getMonth()] }; };
  function vssStamp(min) { var d = vssDateAt(min); return WD[d.getDay()] + ' ' + d.getDate() + ' ' + MO[d.getMonth()] + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  window.vssStamp = vssStamp;
  function vssDateMin(min) { if (min == null) return '—'; var d = vssDateAt(min); return WD[d.getDay()] + ' ' + d.getDate() + ' ' + MO[d.getMonth()]; }
  window.vssDateMin = vssDateMin;
  window.vssFmtDate = function (iso) {
    if (!iso) return '—';
    var d = new Date(iso.length <= 10 ? iso + 'T00:00:00' : iso);
    if (isNaN(d)) return iso;
    return WD[d.getDay()] + ' ' + d.getDate() + ' ' + MO[d.getMonth()];
  };
  window.vssMinFromISO = function (iso) { if (!iso) return null; var d = new Date(iso.length <= 10 ? iso + 'T00:00:00' : iso); return isNaN(d) ? null : Math.round((d - BASE) / 60000); };

  var PAL = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948'];
  function vssColor(i) { return PAL[((i % PAL.length) + PAL.length) % PAL.length]; }
  window.vssColor = vssColor;
  window.VSS_PAL = PAL;

  var STAGES = ['Billet', 'Rolled', 'Stacking', 'NDT', 'Bright Bar', 'Heat Treat', 'Dispatch'];
  window.VSS_STAGES = STAGES;
  function isBright(sc) { return /^[PD]/.test(sc || ''); }
  function isAnneal(sc) { return ['RXA', 'PGS', 'PXS', 'PGA'].indexOf(sc || '') >= 0; }
  function hash(str) { var h = 0, i; str = str || ''; for (i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0; return h; }
  function sizeNum(s) { var m = /([\d.]+)/.exec(String(s || '')); return m ? parseFloat(m[1]) : 40; }
  window.vssSizeNum = sizeNum;

  // ---- static derived fields per order ----
  function vssDerive() {
    if (V._derived) return V;
    var sizeMap = {};
    V.rolling.forEach(function (c) { if (c.sizeR && !(c.sizeR in sizeMap)) sizeMap[c.sizeR] = c; });
    V.orders.forEach(function (o, i) {
      o._i = i;
      o.pdCount = o.matType === 'ZBLB' ? 2 : 3;                              // BLB=2, BRB=3
      o.allocStatus = (o.billetStock && o.billetStock > 0) ? 'Stock-allocated' : 'To-cast';
      o.jobWork = (hash(o.so) % 16 === 0);
      o.ndt = (o.inspection || '').toUpperCase() === 'NDT';                  // real inspection route
      var pre = (/^[A-Za-z]+/.exec(o.so || '') || [''])[0].toUpperCase();
      o.orderType = /SA$/.test(pre) ? 'Sample' : /^EX/.test(pre) ? 'Export' : 'Domestic';
      o.rddMin = o.rdd ? Math.round((new Date(o.rdd + 'T00:00:00') - BASE) / 60000) : null;
      o.stackingFIFO = (o.rddMin != null && o.rddMin < AS_OF_MIN) ? 'Urgent' : 'Normal';
      var c = sizeMap[o.rolledSize] || null;                                 // informational: current rolling cycle token
      o.token = c ? c.token : null; o.cycle = c ? c.cyclePhase : null; o.tentRollISO = c ? c.startISO : null;
    });
    V._derived = true;
    return V;
  }
  window.vssDerive = vssDerive;

  // ---- ORDER-LEVEL FORWARD SCHEDULER ----
  function vssPlan() {
    if (V._plan) return V._plan;
    vssDerive();
    var buf = 45, free = {}, lastKey = {}, bookings = [];
    // Bright-bar lines from config: size range + supply conditions + MT/hr
    var bb = V.bbsCfg.lines.map(function (l, i) {
      var r = /([\d.]+)\s*-\s*([\d.]+)/.exec(l.range || ''), draw = /Draw/i.test(l.machine), hrs = draw ? 16 : 24;
      return { name: draw ? 'Drawing DL' : 'Peeling PL-' + (i + 1), min: r ? +r[1] : 0, max: r ? +r[2] : 999,
               conds: (l.process || '').split(/[,\s]+/).filter(Boolean), rateHr: (l.capDay || 20) / hrs, draw: draw };
    });
    var furn = []; for (var f = 1; f <= V.htCfg.furnaces; f++) furn.push('Furnace F' + f);
    function ndtProd(sz) { return sz < 26 ? 2.43 : sz < 36 ? 4.5 : sz < 51 ? 7.91 : sz < 66 ? 11.92 : 15.32; }
    function ndtRange(sz) { return sz < 26 ? 1 : sz < 36 ? 2 : sz < 51 ? 3 : sz < 66 ? 4 : 5; }
    function htMin(cond) { var t = V.htCfg.types.filter(function (x) { return x.cond === cond; })[0]; return ((t ? t.cycleHr : 40) + (t ? t.coolHr : 12)) * 60; }
    function pickLine(o) {
      var sz = sizeNum(o.peelSize || o.rolledSize), c = o.supplyCond;
      var cand = bb.filter(function (l) { return l.conds.indexOf(c) >= 0 && sz >= l.min && sz <= l.max; });
      if (!cand.length) cand = bb.filter(function (l) { return l.conds.indexOf(c) >= 0; });
      if (!cand.length) cand = bb.filter(function (l) { return /^D/.test(c) ? l.draw : !l.draw; });
      if (!cand.length) cand = bb;
      cand.sort(function (a, b) { return (free[a.name] || 0) - (free[b.name] || 0); });   // least-loaded first -> balance
      return cand[0];
    }
    // ---- Rolling-mill capacity, straight from the sheet (Rolling Plan + Roll Set) ----
    // Bdgt Prdty/Day is SIZE-WISE (968; 605 for 23-29 mm; 550 for 58 mm), quoted on INPUT tonnage over 22 productive
    // hours. The sheet's own cycle stamps spread it over the 24 h clock (2 h/day non-productive), i.e.
    // duration = input MT x 24 / budget; finish = 90% of input (yield measured from the 30 real cycles).
    var rollBdgt = {}; V.rolling.forEach(function (c) { if (c.budgetPrdty) rollBdgt[c.size] = c.budgetPrdty; });
    var inQ = 0, finQ = 0; V.rolling.forEach(function (c) { inQ += c.inputQty || 0; finQ += c.finishQty || 0; });
    var ROLL_YIELD = inQ > 0 ? finQ / inQ : 0.9, ROLL_HRS = (V.rolling[0] && V.rolling[0].prodHours) || 22;
    function rollBudget(sz) { return rollBdgt[sz] || (sz >= 23 && sz <= 29 ? 605 : 968); }
    function rollRunMin(q, sz) { return (q / ROLL_YIELD) * 24 / rollBudget(sz) * 60; }
    // Roll Set: 8 size-mix feeders -> changeover by TYPE: size-to-size within a feeder 25 min, feeder-to-feeder 1.5 h,
    // BDM (input billet section 160/200) change 4 h. Sizes 39.5-46.69 mm have no feeder row in the sheet -> nearest feeder.
    var RC = V.rollset.changeover || { bdmHr: 4, feederHr: 1.5, sizeMin: 25 };
    var feeders = V.rollset.feeders.map(function (f) { var r = /([\d.]+)\s*-\s*([\d.]+)/.exec(f.range || ''); return { no: f.no, min: r ? +r[1] : 0, max: r ? +r[2] : 999, billet: f.billet }; });
    function feederOf(sz) {
      var i, best = null, bd = 1e9;
      for (i = 0; i < feeders.length; i++) if (sz >= feeders[i].min && sz <= feeders[i].max) return feeders[i];
      feeders.forEach(function (f) { var d = sz < f.min ? f.min - sz : sz - f.max; if (d < bd) { bd = d; best = f; } });
      return best;
    }
    // Sequence: delivery-date priority at the plant's planning grain — RDD WEEK (Mon-Sun; overdue orders form one
    // urgent block), then DESCENDING SIZE within the week (rolling-cycle rule). Each size becomes one run, so the mill
    // pays one changeover per size / feeder / billet-section switch instead of one per order.
    function rddWeek(o) { if (o.rddMin == null) return 1e9; if (o.rddMin < 0) return -1; return Math.floor((o.rddMin + 2 * 1440) / 10080); }   // BASE is Wed 1 Jul: +2 d aligns weeks to Mon 29 Jun
    var seqOrders = V.orders.slice().sort(function (a, b) {
      var wa = rddWeek(a), wb = rddWeek(b); if (wa !== wb) return wa - wb;
      var d = sizeNum(b.rolledSize) - sizeNum(a.rolledSize); if (d) return d;
      return a.so < b.so ? -1 : 1;
    });
    seqOrders.forEach(function (o, seq) {
      var qty = o.qty || 0, t = 0, first = null, last = 0, route = [], ends = {};
      function book(machine, stage, dur, contend) {
        var s = contend === false ? t : Math.max(t, free[machine] || 0), e = s + Math.max(Math.round(dur), 10);
        if (contend !== false) free[machine] = e;
        bookings.push({ machine: machine, stage: stage, so: o.so, oi: o._i, customer: o.customer, grade: o.grade, size: o.rolledSize, cond: o.supplyCond, qty: qty, start: s, end: e });
        if (first === null) first = s; last = Math.max(last, e); t = e + buf; route.push(stage); ends[stage] = e; return e;
      }
      o.planSeq = seq + 1;
      if (o.allocStatus !== 'Stock-allocated') book('Caster (SMS)', 'Billet', qty / 36 * 60);          // open stock first
      // Rolling: changeover by type vs the previous run on the mill, then run time at the size's budget productivity
      var sz = sizeNum(o.rolledSize), fd = feederOf(sz), pv = lastKey['Rolling Mill'];
      var chgType = !pv ? '' : pv.billet !== fd.billet ? 'BDM' : pv.no !== fd.no ? 'Feeder' : pv.size !== sz ? 'Size' : '';
      var chg = chgType === 'BDM' ? RC.bdmHr * 60 : chgType === 'Feeder' ? RC.feederHr * 60 : chgType === 'Size' ? RC.sizeMin : 0;
      lastKey['Rolling Mill'] = { size: sz, no: fd.no, billet: fd.billet };
      o.rollChangeover = chg; o.rollChgType = chgType; o.rollFeeder = fd.no; o.rollBudget = rollBudget(sz);
      o.rollRunMin = Math.round(rollRunMin(qty, sz));
      book('Rolling Mill', 'Rolled', chg + o.rollRunMin);
      book('Stacking Yard', 'Stacking', 180, false);
      if (o.ndt) { var c2 = (lastKey['NDT Line'] && lastKey['NDT Line'] !== ndtRange(sz)) ? 60 : 0; lastKey['NDT Line'] = ndtRange(sz); book('NDT Line', 'NDT', c2 + qty / ndtProd(sz) * 60); }
      if (isBright(o.supplyCond)) { var L = pickLine(o); o.bbLine = L.name; book(L.name, 'Bright Bar', qty / L.rateHr * 60); }
      if (isAnneal(o.supplyCond)) {
        var n = Math.max(1, Math.ceil(qty / V.htCfg.furnaceMT)), cyc = htMin(o.supplyCond), rem = qty, mx = 0, t0 = t;
        for (var k = 0; k < n; k++) {
          furn.sort(function (a, b) { return (free[a] || 0) - (free[b] || 0); });                    // least-loaded furnace
          var fm = furn[0], cq = Math.min(V.htCfg.furnaceMT, rem); rem -= cq;
          var s = Math.max(t0, free[fm] || 0), e = s + cyc; free[fm] = e;
          bookings.push({ machine: fm, stage: 'Heat Treat', so: o.so, oi: o._i, customer: o.customer, grade: o.grade, size: o.rolledSize, cond: o.supplyCond, qty: cq, start: s, end: e });
          mx = Math.max(mx, e);
        }
        route.push('Heat Treat'); ends['Heat Treat'] = mx; last = Math.max(last, mx); t = mx + buf;
      }
      route.push('Dispatch'); ends['Dispatch'] = last + 60;
      o.route = route; o.stageEnds = ends; o.planStartMin = first; o.planEndMin = last; o.expDispMin = last + 60;
      var idx = 0; route.forEach(function (st) { if (ends[st] != null && ends[st] <= AS_OF_MIN) idx++; });
      o.stageIndex = idx; o.stageNow = idx >= route.length ? 'Dispatched' : route[idx];
      o.late = (o.rddMin != null && o.rddMin < AS_OF_MIN && idx < route.length) ? 'Overdue'
             : (o.rddMin != null && o.expDispMin > o.rddMin) ? 'At risk' : 'On track';
    });
    var load = {}, horizon = 0;
    bookings.forEach(function (b) {
      var L = load[b.machine] = load[b.machine] || { machine: b.machine, mins: 0, mt: 0, n: 0, orders: {} };
      L.mins += b.end - b.start; L.mt += b.qty; L.n++; L.orders[b.so] = 1; horizon = Math.max(horizon, b.end);
    });
    Object.keys(load).forEach(function (k) { load[k].orderCount = Object.keys(load[k].orders).length; });
    var machines = ['Caster (SMS)', 'Rolling Mill', 'NDT Line'].concat(bb.map(function (l) { return l.name; }))
      .concat(furn.slice().sort(function (a, b) { return a < b ? -1 : 1; }));   // F1..F6 in lane order (furn itself is kept least-loaded-sorted)
    var rchg = { Size: 0, Feeder: 0, BDM: 0, mins: 0 };
    seqOrders.forEach(function (o) { if (o.rollChgType) { rchg[o.rollChgType]++; rchg.mins += o.rollChangeover; } });
    V._plan = { orders: seqOrders, bookings: bookings, load: load, horizonMin: horizon, machines: machines, yard: 'Stacking Yard',
                roll: { yield: ROLL_YIELD, prodHours: ROLL_HRS, budgets: rollBdgt, rc: RC, chg: rchg } };
    return V._plan;
  }
  window.vssPlan = vssPlan;

  // Gantt feed from the plan: lanes = machines, bars = order bookings coloured per order.
  window.vssSchedule = function () {
    var P = vssPlan(), colorOf = {};
    P.orders.forEach(function (o, i) { colorOf[o.so] = vssColor(i); });
    var bars = P.bookings.filter(function (b) { return b.machine !== P.yard; }).map(function (b) {
      return { unit: b.machine, start: b.start, dur: b.end - b.start, cls: colorOf[b.so], so: b.so,
               tip: b.so + ' · ' + b.customer + ' · ' + b.stage + ' · ' + b.qty.toFixed(1) + ' MT · ' + vssStamp(b.start) + ' → ' + vssStamp(b.end) };
    });
    return { units: P.machines, bars: bars, colorOf: colorOf };
  };

  window.vssBilletBuckets = function () {
    vssDerive();
    var alloc = 0, un = 0, nok = 0;
    V.orders.forEach(function (o) {
      var q = o.billetStock || 0;
      if (q > 0) { alloc += q; if (hash(o.so) % 23 === 0) un += Math.round(q * 0.3 * 10) / 10; if (hash(o.so) % 37 === 0) nok += Math.round(q * 0.2 * 10) / 10; }
    });
    return { allocated: Math.round(alloc), unallocated: Math.round(un), notOkay: Math.round(nok) };
  };

  window.vssMOQGap = function () {
    vssDerive();
    return V.casting.map(function (h) {
      var moq = V.smsCfg.moq[h.supplyCond] || 0, q = h.ihQty || 0;
      return Object.assign({}, h, { moq: moq, gap: moq > 0 ? Math.max(0, moq - q) : 0, moqOk: moq === 0 || q >= moq });
    });
  };

  // APS-style multi-day gantt renderer. bars: [{unit,start,dur,cls,tip}]. opts: laneW, startMin, endMin, laneTitle, batchTag.
  window.vssRenderGantt = function (el, units, bars, opts) {
    opts = opts || {};
    var laneW = opts.laneW || 172;
    var byUnit = {}; units.forEach(function (u) { byUnit[u] = []; });
    var endMax = 0, startMin = opts.startMin != null ? opts.startMin : 0;
    bars.forEach(function (b) { if (byUnit[b.unit]) { byUnit[b.unit].push(b); endMax = Math.max(endMax, b.start + b.dur); } });
    var total = opts.endMin != null ? opts.endMin : Math.ceil((endMax + 60) / 1440) * 1440;
    var span = Math.max(1440, total - startMin);
    var gW = el.clientWidth || 1400;
    var px = Math.max(0.008, Math.min(1.2, (gW - laneW - 40) / span));   // low floor so a 60-90 day plan fits in one view
    var trackW = span * px;
    function X(m) { return (m - startMin) * px; }
    var step = span > 20 * 1440 ? 1440 : 360;                     // long horizons: day lines only
    function grid() {
      var h = '', m;
      for (m = Math.ceil(startMin / step) * step; m <= total; m += step) { var day = (m % 1440 === 0); h += '<div class="g-grid' + (day ? ' day' : '') + '" style="left:' + X(m) + 'px"></div>'; }
      return h;
    }
    var mids = [], mm;
    for (mm = Math.ceil((startMin + 1) / 1440) * 1440; mm < total; mm += 1440) mids.push(mm);
    var bounds = [startMin].concat(mids).concat([total]);
    var labelEvery = Math.max(1, Math.ceil(bounds.length / 16));
    var head = '';
    for (var k = 0; k < bounds.length - 1; k++) { if (k % labelEvery) continue; var c = (bounds[k] + bounds[k + 1]) / 2, di = vssDayLabel(bounds[k]); head += '<div class="g-day" style="left:' + X(c) + 'px">' + di.wd + '<span class="dm">' + di.dm + '</span></div>'; }
    var laneStyle = 'width:' + laneW + 'px';
    var html = '<div class="g-row head"><div class="g-lane head-lane" style="' + laneStyle + '">' + (opts.laneTitle || 'Machine') + '</div><div class="g-track" style="min-width:' + trackW + 'px">' + grid() + head + '</div></div>';
    units.forEach(function (u) {
      var segs = byUnit[u], t = grid(), isB = opts.batchTag && /Furnace/.test(u);
      segs.forEach(function (s) {
        if (s.start >= total || s.start + s.dur <= startMin) return;
        var st = Math.max(s.start, startMin), d = Math.min(s.start + s.dur, total) - st;
        t += '<div class="g-bar" style="left:' + X(st) + 'px;width:' + Math.max(d * px, 2) + 'px;background:' + s.cls + '" title="' + (s.tip || '').replace(/"/g, '&quot;') + '"></div>';
      });
      html += '<div class="g-row"><div class="g-lane" style="' + laneStyle + '">' + u + (isB ? '<span class="eqp-b">' + opts.batchTag + '</span>' : '') + '</div><div class="g-track" style="min-width:' + trackW + 'px">' + t + '</div></div>';
    });
    el.innerHTML = html;
    return { px: px, total: total, startMin: startMin };
  };

  // Demand planning (o9-B): next 4 weeks = MTO already-scheduled (by planned rolling week) + MTS forecast.
  window.vssForecast = function () {
    vssPlan();
    var weeks = [], w;
    for (w = 0; w < 4; w++) weeks.push({ idx: w + 1, start: vssDateAt(w * 7 * 1440), end: vssDateAt((w + 1) * 7 * 1440), s: w * 7 * 1440, e: (w + 1) * 7 * 1440, mto: 0, mts: 0, byCat: {} });
    V.orders.forEach(function (o) {
      var m = o.stageEnds && o.stageEnds['Rolled'] != null ? o.stageEnds['Rolled'] : null; if (m == null) return;
      for (var i = 0; i < 4; i++) if (m >= weeks[i].s && m < weeks[i].e) { weeks[i].mto += (o.qty || 0); weeks[i].byCat[o.category] = (weeks[i].byCat[o.category] || 0) + (o.qty || 0); break; }
    });
    var MTS = [
      { sku: 'MTS-C40-40R', grade: 'C40', cat: 'CS', size: '40R', base: 130 },
      { sku: 'MTS-20MC5-20R', grade: '20MnCr5', cat: 'CRMN', size: '20R', base: 95 },
      { sku: 'MTS-8620-30R', grade: 'SAE8620H', cat: 'NICRMO', size: '30R', base: 80 },
      { sku: 'MTS-16MC5-25R', grade: '16MnCr5', cat: 'CRMN', size: '25R', base: 70 },
      { sku: 'MTS-C45-50R', grade: 'C45', cat: 'CS', size: '50R', base: 110 },
      { sku: 'MTS-SCM420-34R', grade: 'SCM420', cat: 'CRMO', size: '34R', base: 60 },
      { sku: 'MTS-42CM4-56R', grade: '42CrMo4', cat: 'CRMO', size: '56R', base: 90 },
      { sku: 'MTS-EN19-45R', grade: 'EN19', cat: 'CRMO', size: '45R', base: 75 }
    ];
    MTS.forEach(function (m, i) { m.w = []; for (var k = 0; k < 4; k++) { var q = Math.round(m.base * (0.8 + ((i * 7 + k * 17) % 40) / 100)); m.w.push(q); weeks[k].mts += q; weeks[k].byCat[m.cat] = (weeks[k].byCat[m.cat] || 0) + q; } });
    weeks.forEach(function (wk) { wk.mto = Math.round(wk.mto); wk.total = wk.mto + wk.mts; });
    return { weeks: weeks, mts: MTS };
  };

  // MTS buffer (o9-A2 "no SKU stock-out"): per stock SKU, opening stock vs weekly demand ->
  // cover in weeks, projected stock W1-W4 (no replenishment), replenishment need, stock-out alarm.
  window.vssMTSCover = function () {
    var F = vssForecast(), LEAD = 2;                      // weeks of cover needed (rolling -> dispatch lead time)
    var FAC = [4.6, 0.7, 2.6, 1.4, 5.2, 3.1, 0.9, 4.3];   // seeded opening stock (x avg weekly demand) -> mix of OK / Replenish / Stock-out; swap for real stock
    return F.mts.map(function (m, i) {
      var tot = m.w.reduce(function (a, b) { return a + b; }, 0), avg = tot / 4;
      var opening = Math.round(avg * FAC[i % FAC.length]);
      var proj = [], s = opening, outWeek = null;
      m.w.forEach(function (q, k) { s -= q; proj.push(Math.round(s)); if (s < 0 && outWeek == null) outWeek = k + 1; });
      var cover = avg ? opening / avg : 99;
      var status = (outWeek != null && outWeek <= LEAD) ? 'Stock-out' : (outWeek != null || cover < LEAD) ? 'Replenish' : 'OK';
      var replenish = Math.max(0, Math.round(tot + avg - opening));   // produce over W1-W4 to end with 1 week safety
      return { sku: m.sku, grade: m.grade, cat: m.cat, size: m.size, w: m.w, opening: opening, avg: Math.round(avg), cover: cover,
               proj: proj, outWeek: outWeek, status: status, replenish: replenish, produceBy: outWeek != null ? 'W' + Math.max(1, outWeek - 1) : (cover < LEAD ? 'W1' : '—'), lead: LEAD };
    });
  };

  vssPlan();   // run the scheduler once at load so every page sees start/end, stages and bookings
})();
