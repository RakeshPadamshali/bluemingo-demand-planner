/* Vardhman Special Steels demo — shared helpers over window.VSS (from vss-data.js).
   Times are integer MINUTES from baseDate midnight (2026-07-01). "As of" = mid-plan
   so orders show a realistic spread across stages. */
(function () {
  var V = window.VSS;
  var BASE = new Date(V.meta.baseDate + 'T00:00:00');
  var AS_OF_MIN = 5 * 1440;                     // 2026-07-06 (mid rolling window)
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
  function vssStamp(min) { var d = vssDateAt(min); return WD[d.getDay()] + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  window.vssStamp = vssStamp;
  window.vssFmtDate = function (iso) {
    if (!iso) return '—';
    var d = new Date(iso.length <= 10 ? iso + 'T00:00:00' : iso);
    if (isNaN(d)) return iso;
    return WD[d.getDay()] + ' ' + d.getDate() + ' ' + MO[d.getMonth()];
  };
  window.vssMinFromISO = function (iso) { if (!iso) return null; var d = new Date(iso.length <= 10 ? iso + 'T00:00:00' : iso); return isNaN(d) ? null : Math.round((d - BASE) / 60000); };

  // Validated categorical palette (dataviz), cycled for dense charts.
  var PAL = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948'];
  function vssColor(i) { return PAL[((i % PAL.length) + PAL.length) % PAL.length]; }
  window.vssColor = vssColor;
  window.VSS_PAL = PAL;

  // Full plant stage flow; a per-order route is a subset.
  var STAGES = ['Billet', 'Rolled', 'Stacking', 'NDT', 'Bright Bar', 'Heat Treat', 'Dispatch'];
  window.VSS_STAGES = STAGES;
  function isBright(sc) { return /^[PD]/.test(sc || ''); }                 // P* peeled, D* drawn
  function isAnneal(sc) { return ['RXA', 'PGS', 'PXS', 'PGA'].indexOf(sc || '') >= 0; }
  function routeFor(sc) {
    var r = ['Billet', 'Rolled', 'Stacking', 'NDT'];
    if (isBright(sc)) r.push('Bright Bar');
    if (isAnneal(sc)) r.push('Heat Treat');
    r.push('Dispatch');
    return r;
  }
  function hash(str) { var h = 0, i; str = str || ''; for (i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0; return h; }

  // Derive order fields once (PDs, allocation, job-work, stacking FIFO, token/rolling date, stage progress).
  function vssDerive() {
    if (V._derived) return V;
    var sizeMap = {};
    V.rolling.forEach(function (c) { if (c.sizeR && !(c.sizeR in sizeMap)) sizeMap[c.sizeR] = c; });
    var asOfDate = new Date(V.meta.asOf + 'T00:00:00');
    V.orders.forEach(function (o, i) {
      o.pdCount = o.matType === 'ZBLB' ? 2 : 3;                            // BLB=2, BRB=3
      o.allocStatus = (o.billetStock && o.billetStock > 0) ? 'Stock-allocated' : 'To-cast';
      o.jobWork = (hash(o.so) % 16 === 0);
      o.stackingFIFO = (o.rdd && new Date(o.rdd + 'T00:00:00') < asOfDate) ? 'Urgent' : 'Normal';
      var c = sizeMap[o.rolledSize] || null;
      o.token = c ? c.token : null;
      o.cycle = c ? c.cyclePhase : null;
      o.rollStartMin = c ? c.startMin : null;
      o.rollFinMin = c ? c.finishMin : null;
      o.tentRollISO = c ? c.startISO : null;
      o.route = routeFor(o.supplyCond);
      // stage done-times relative to the rolling cycle (minutes); undefined route stages skipped
      var done = {};
      if (c) {
        done['Billet'] = c.startMin - 120; done['Rolled'] = c.finishMin;
        done['Stacking'] = c.finishMin + 200; done['NDT'] = c.finishMin + 800;
        done['Bright Bar'] = c.finishMin + 2400; done['Heat Treat'] = c.finishMin + 4800;
        done['Dispatch'] = c.finishMin + (isBright(o.supplyCond) ? 3200 : 1400);
      }
      var idx = 0, expMin = null;
      if (c) {
        o.route.forEach(function (st) { if (done[st] != null && done[st] <= AS_OF_MIN) idx++; });
        expMin = done[o.route[o.route.length - 1]];
      }
      o.stageIndex = idx;                       // 0..route.length ; route.length = Dispatched
      o.stageNow = idx >= o.route.length ? 'Dispatched' : o.route[idx];
      o.expDispMin = expMin;
      var rddMin = o.rdd ? Math.round((new Date(o.rdd + 'T00:00:00') - BASE) / 60000) : null;
      o.rddMin = rddMin;
      o.late = (rddMin != null && rddMin < AS_OF_MIN && idx < o.route.length) ? 'Overdue'
             : (expMin != null && rddMin != null && expMin > rddMin) ? 'At risk' : 'On track';
      o._i = i;
    });
    V._derived = true;
    return V;
  }
  window.vssDerive = vssDerive;

  // Machine-sequence schedule for the master Gantt, derived forward from the real
  // rolling cycles: Caster -> Rolling -> NDT -> Bright Bar (peeling/drawing) -> Furnace.
  window.vssSchedule = function () {
    vssDerive();
    var units = ['Caster (SMS)', 'Rolling Mill', 'NDT Line',
      'Peeling PL-1', 'Peeling PL-2', 'Peeling PL-3', 'Peeling PL-4', 'Peeling PL-5', 'Drawing DL',
      'Furnace F1', 'Furnace F2', 'Furnace F3', 'Furnace F4', 'Furnace F5', 'Furnace F6'];
    var buf = 30, bars = [], free = {}, fIdx = 0;
    function ndtProd(sz) { return sz < 26 ? 2.43 : sz < 36 ? 4.5 : sz < 51 ? 7.91 : sz < 66 ? 11.92 : 15.32; }
    function peelLine(sz) {
      if (sz <= 35) return 'Peeling PL-3';
      if (sz <= 55) return 'Peeling PL-2';
      if (sz <= 70) return 'Peeling PL-1';
      return 'Peeling PL-5';
    }
    var cycles = V.rolling.slice().filter(function (c) { return c.startMin != null; })
      .sort(function (a, b) { return a.startMin - b.startMin; });
    cycles.forEach(function (c, i) {
      var col = vssColor(i), rs = c.startMin, rf = c.finishMin, qty = c.finishQty || 100, sz = c.size || 40;
      // Caster heat ending before rolling
      var castDur = Math.min(240, Math.max(60, Math.round((c.inputQty || 100) / 40 * 60)));
      var castStart = Math.max(free['Caster (SMS)'] || 0, rs - castDur - buf);
      bars.push({ unit: 'Caster (SMS)', start: castStart, dur: castDur, cls: col,
        tip: 'Heat · token ' + c.token + ' · ' + (c.inputQty || 0).toFixed(0) + ' MT billets' });
      free['Caster (SMS)'] = castStart + castDur;
      // Rolling (real times)
      bars.push({ unit: 'Rolling Mill', start: rs, dur: Math.max(rf - rs, 20), cls: col,
        tip: 'Token ' + c.token + ' · ' + c.sizeR + ' · ' + qty.toFixed(0) + ' MT · ' + vssStamp(rs) + ' → ' + vssStamp(rf) });
      // NDT after rolling
      var ndtDur = Math.min(900, Math.max(45, Math.round(qty / ndtProd(sz) * 60)));
      var ns = Math.max(free['NDT Line'] || 0, rf + buf);
      bars.push({ unit: 'NDT Line', start: ns, dur: ndtDur, cls: col, tip: 'NDT · ' + c.sizeR + ' · ' + qty.toFixed(0) + ' MT' });
      free['NDT Line'] = ns + ndtDur;
      var down = ns + ndtDur + buf;
      // Bright bar: peel most, draw some
      if (i % 5 === 3) {
        var ds = Math.max(free['Drawing DL'] || 0, down), dDur = Math.min(600, Math.max(90, Math.round(qty / 12 * 60)));
        bars.push({ unit: 'Drawing DL', start: ds, dur: dDur, cls: col, tip: 'Drawing · ' + c.sizeR });
        free['Drawing DL'] = ds + dDur;
      } else if (i % 2 === 0) {
        var pl = peelLine(sz); var ps = Math.max(free[pl] || 0, down), pDur = Math.min(720, Math.max(90, Math.round(qty / 14 * 60)));
        bars.push({ unit: pl, start: ps, dur: pDur, cls: col, tip: pl + ' · ' + c.sizeR + ' · ' + qty.toFixed(0) + ' MT' });
        free[pl] = ps + pDur;
      }
      // Heat treatment for a subset -> a furnace (long anneal cycle)
      if (i % 4 === 1) {
        var fu = 'Furnace F' + ((fIdx % 6) + 1); fIdx++;
        var fs = Math.max(free[fu] || 0, rf + buf), fDur = 40 * 60;
        bars.push({ unit: fu, start: fs, dur: fDur, cls: col, tip: fu + ' · anneal · ' + c.sizeR + ' · 18 MT charge' });
        free[fu] = fs + fDur;
      }
    });
    return { units: units, bars: bars };
  };

  // Plant billet-stock split (Allocated / Un-allocated / Not-Okay).
  window.vssBilletBuckets = function () {
    vssDerive();
    var alloc = 0, un = 0, nok = 0;
    V.orders.forEach(function (o) {
      var q = o.billetStock || 0;
      if (q > 0) { alloc += q; if (hash(o.so) % 23 === 0) un += Math.round(q * 0.3 * 10) / 10; if (hash(o.so) % 37 === 0) nok += Math.round(q * 0.2 * 10) / 10; }
    });
    return { allocated: Math.round(alloc), unallocated: Math.round(un), notOkay: Math.round(nok) };
  };

  // Casting heats with MOQ-gap check (clubbed qty vs the supply-condition MOQ).
  window.vssMOQGap = function () {
    vssDerive();
    return V.casting.map(function (h) {
      var moq = V.smsCfg.moq[h.supplyCond] || 0, q = h.ihQty || 0;
      return Object.assign({}, h, { moq: moq, gap: moq > 0 ? Math.max(0, moq - q) : 0, moqOk: moq === 0 || q >= moq });
    });
  };

  // Render an APS-style multi-day gantt (lanes + day axis + coloured bars) into `el`.
  // bars: [{unit, start, dur, cls(hex), tip}]. Fits the whole span into the visible width.
  window.vssRenderGantt = function (el, units, bars, opts) {
    opts = opts || {};
    var laneW = opts.laneW || 172;
    var byUnit = {}; units.forEach(function (u) { byUnit[u] = []; });
    var endMax = 0, startMin = opts.startMin != null ? opts.startMin : 0;
    bars.forEach(function (b) { if (byUnit[b.unit]) { byUnit[b.unit].push(b); endMax = Math.max(endMax, b.start + b.dur); } });
    var total = Math.ceil((endMax + 60) / 1440) * 1440;
    var span = Math.max(1440, total - startMin);
    var gW = el.clientWidth || 1400;
    var px = Math.max(0.05, Math.min(1.2, (gW - laneW - 40) / span));
    var trackW = span * px;
    function X(m) { return (m - startMin) * px; }
    function grid() {
      var h = '', m;
      for (m = Math.ceil(startMin / 360) * 360; m <= total; m += 360) { var day = (m % 1440 === 0); h += '<div class="g-grid' + (day ? ' day' : '') + '" style="left:' + X(m) + 'px"></div>'; }
      return h;
    }
    var mids = [], mm;
    for (mm = Math.ceil((startMin + 1) / 1440) * 1440; mm < total; mm += 1440) mids.push(mm);
    var bounds = [startMin].concat(mids).concat([total]);
    var head = '';
    for (var k = 0; k < bounds.length - 1; k++) { var c = (bounds[k] + bounds[k + 1]) / 2, di = vssDayLabel(bounds[k]); head += '<div class="g-day" style="left:' + X(c) + 'px">' + di.wd + '<span class="dm">' + di.dm + '</span></div>'; }
    var laneStyle = 'width:' + laneW + 'px';
    var html = '<div class="g-row head"><div class="g-lane head-lane" style="' + laneStyle + '">' + (opts.laneTitle || 'Machine') + '</div><div class="g-track" style="min-width:' + trackW + 'px">' + grid() + head + '</div></div>';
    units.forEach(function (u) {
      var segs = byUnit[u], t = grid(), isB = opts.batchTag && /Furnace/.test(u);
      segs.forEach(function (s) {
        t += '<div class="g-bar" style="left:' + X(s.start) + 'px;width:' + Math.max(s.dur * px, 2) + 'px;background:' + s.cls + '" title="' + (s.tip || '').replace(/"/g, '&quot;') + '"></div>';
      });
      html += '<div class="g-row"><div class="g-lane" style="' + laneStyle + '">' + u + (isB ? '<span class="eqp-b">' + opts.batchTag + '</span>' : '') + '</div><div class="g-track" style="min-width:' + trackW + 'px">' + t + '</div></div>';
    });
    el.innerHTML = html;
    return { px: px, total: total, startMin: startMin };
  };

  // Demand planning (o9-B): next 4 weeks W1-W4 = MTO already-scheduled + MTS make-to-stock forecast.
  window.vssForecast = function () {
    vssDerive();
    var base = new Date(V.meta.baseDate + 'T00:00:00'), weeks = [], w;
    for (w = 0; w < 4; w++) { var st = new Date(base.getTime() + w * 7 * 86400000); weeks.push({ idx: w + 1, start: st, end: new Date(st.getTime() + 7 * 86400000), mto: 0, mts: 0, byCat: {} }); }
    function weekOf(iso) { if (!iso) return -1; var t = new Date(iso.length <= 10 ? iso + 'T00:00:00' : iso).getTime(); for (var i = 0; i < 4; i++) { if (t >= weeks[i].start.getTime() && t < weeks[i].end.getTime()) return i; } return -1; }
    V.orders.forEach(function (o) { var i = weekOf(o.tentRollISO || o.rdd); if (i >= 0) { weeks[i].mto += (o.qty || 0); weeks[i].byCat[o.category] = (weeks[i].byCat[o.category] || 0) + (o.qty || 0); } });
    // MTS = make-to-stock standard grades held to stock (synthesized — not in the MTO order book)
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

  vssDerive();
})();
