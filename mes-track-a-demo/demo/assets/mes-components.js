/* ============================================================
   Bluemingo MES v2 — shared UI component helpers (demo)
   Depends on mes-shell.js (window.h). Load AFTER mes-shell.js.
   Namespace: MESC
   ============================================================ */
(function (global) {
  'use strict';
  const h = global.h || function (t, a, k) { const e = document.createElement(t); if (a) for (const x in a) { if (x === 'class') e.className = a[x]; else if (x === 'html') e.innerHTML = a[x]; else if (x.startsWith('on') && typeof a[x] === 'function') e.addEventListener(x.slice(2), a[x]); else if (a[x] != null) e.setAttribute(x, a[x]); } (k || []).forEach(c => c != null && e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c)); return e; };
  const icon = (n, cls) => h('i', { class: 'fa-solid ' + n + (cls ? ' ' + cls : '') });

  // ---- status -> badge/dot mapping ----
  const STATUS = {
    green: 'success', ok: 'success', pass: 'success', available: 'success', released: 'success', accept: 'success', completed: 'success', done: 'success', charged: 'success',
    amber: 'warning', warn: 'warning', pending: 'warning', 'in-use': 'warning', hold: 'warning', 'on-hold': 'warning', planned: 'info', cooling: 'info', 'in progress': 'info', running: 'info',
    red: 'danger', fail: 'danger', failed: 'danger', rejected: 'danger', repair: 'danger', blocked: 'danger', denied: 'danger',
    grey: 'neutral', neutral: 'neutral', 'not-started': 'neutral'
  };
  function kindOf(s) { return STATUS[String(s || '').toLowerCase()] || 'neutral'; }

  const MESC = {
    h, icon,

    badge(text, kind, ic) {
      const k = STATUS[kind] ? STATUS[kind] : (kind || 'neutral');
      return h('span', { class: 'badge badge-' + k }, [ic ? icon(ic) : null, text]);
    },
    statusBadge(status, label) { return MESC.badge(label || status, kindOf(status)); },
    dot(status) { const map = { green: 'dot-green', amber: 'dot-amber', red: 'dot-red', blue: 'dot-blue', grey: 'dot-grey' }; return h('span', { class: 'dot ' + (map[status] || 'dot-grey') }); },

    kv(k, v, mono) { return h('div', { class: 'kv' }, [h('span', { class: 'k' }, [k]), (v instanceof Node ? v : h('span', { class: 'v' + (mono ? ' mono' : '') }, [String(v)]))]); },
    kvGrid(pairs) { return h('div', { class: 'kv-grid' }, pairs.map(p => MESC.kv(p[0], p[1], p[2]))); },

    card(opts) {
      opts = opts || {};
      const kids = [];
      if (opts.title) {
        const hdr = h('div', { class: 'bm-card-header' }, [
          opts.step != null ? h('span', { class: 'step-badge' }, [String(opts.step)]) : (opts.icon ? icon(opts.icon, 'hdr-ic') : null),
          h('span', {}, [opts.title]),
          opts.right ? h('span', { class: 'right' }, [].concat(opts.right)) : null
        ]);
        kids.push(hdr);
      }
      const bodyKids = Array.isArray(opts.body) ? opts.body : [opts.body];
      kids.push(h('div', { class: 'bm-card-body' + (opts.tight ? ' tight' : '') }, opts.bodyHtml ? [] : bodyKids.filter(Boolean)));
      const c = h('div', { class: 'bm-card' + (opts.class ? ' ' + opts.class : '') }, kids);
      if (opts.bodyHtml) c.querySelector('.bm-card-body').innerHTML = opts.bodyHtml;
      return c;
    },

    kpi(o) {
      return h('div', { class: 'kpi accent-' + (o.accent || 'primary') }, [
        o.icon ? icon(o.icon, 'kpi-ic') : null,
        h('span', { class: 'kpi-label' }, [o.label]),
        h('span', { class: 'kpi-value' }, [String(o.value), o.unit ? h('small', {}, [' ' + o.unit]) : null]),
        o.sub ? h('span', { class: 'kpi-sub' }, [].concat(o.sub)) : null
      ]);
    },

    table(cols, rows, opts) {
      opts = opts || {};
      const thead = h('thead', {}, [h('tr', {}, cols.map(c => h('th', { class: c.num ? 'num' : '' }, [c.label])))]);
      const tbody = h('tbody', {}, rows.map((r, i) => {
        const tr = h('tr', opts.rowClass ? { class: opts.rowClass(r, i) } : {}, cols.map(c => {
          const v = c.render ? c.render(r, i) : r[c.key];
          return h('td', { class: c.num ? 'num' : (c.cls || '') }, [v instanceof Node ? v : (v == null ? '—' : String(v))]);
        }));
        if (opts.onRow) tr.addEventListener('click', () => opts.onRow(r, i, tr));
        if (opts.onRow) tr.style.cursor = 'pointer';
        return tr;
      }));
      return h('div', { class: 'table-wrap' }, [h('table', { class: 'bm-table' }, [thead, tbody])]);
    },

    alert(kind, title, msg, ic) {
      const icons = { success: 'fa-circle-check', danger: 'fa-circle-exclamation', warning: 'fa-triangle-exclamation', info: 'fa-circle-info' };
      return h('div', { class: 'alert alert-' + kind }, [
        icon(ic || icons[kind] || icons.info),
        h('div', {}, [title ? h('span', { class: 'a-title' }, [title + (msg ? ' — ' : '')]) : null, msg ? h('span', {}, [msg]) : null])
      ]);
    },

    // ---- Tabs: items=[{id,label,icon,count,render:()=>Node}]; opts{active} ----
    tabs(items, opts) {
      opts = opts || {};
      const strip = h('div', { class: 'bm-tabs' });
      const panel = h('div', { class: 'bm-tab-panel' });
      const cache = {};
      function activate(id) {
        strip.querySelectorAll('.bm-tab').forEach(t => t.classList.toggle('active', t.getAttribute('data-id') === id));
        panel.innerHTML = '';
        if (!cache[id]) { const it = items.find(x => x.id === id); cache[id] = it.render ? it.render() : (it.content || h('div')); }
        panel.appendChild(cache[id]);
      }
      items.forEach(it => strip.appendChild(h('div', { class: 'bm-tab', 'data-id': it.id, onclick: () => activate(it.id) },
        [it.icon ? icon(it.icon) : null, h('span', {}, [it.label]), it.count != null ? h('span', { class: 'tab-count' }, [String(it.count)]) : null])));
      const wrap = h('div', {}, [strip, panel]);
      activate(opts.active || items[0].id);
      wrap.activate = activate;
      return wrap;
    },

    // ---- Gantt: lanes=['BOF1',...]; bars=[{lane,start,dur,label,cls}]; opts{pxPerMin,totalMin,tickMin} ----
    gantt(lanes, bars, opts) {
      opts = Object.assign({ pxPerMin: 2, totalMin: 300, tickMin: 30 }, opts || {});
      const trackW = opts.totalMin * opts.pxPerMin;
      const g = h('div', { class: 'gantt' });
      // header row with time ticks
      const headTrack = h('div', { class: 'gantt-track', style: 'min-width:' + trackW + 'px' });
      for (let m = 0; m <= opts.totalMin; m += opts.tickMin) {
        headTrack.appendChild(h('div', { class: 'gantt-tick', style: 'left:' + (m * opts.pxPerMin) + 'px' }, [(m / 60).toFixed(0) + 'h']));
      }
      g.appendChild(h('div', { class: 'gantt-row head' }, [h('div', { class: 'gantt-lane-label' }, ['Unit']), headTrack]));
      // lane rows
      lanes.forEach(lane => {
        const track = h('div', { class: 'gantt-track', style: 'min-width:' + trackW + 'px' });
        for (let m = 0; m <= opts.totalMin; m += opts.tickMin) track.appendChild(h('div', { class: 'gantt-tick', style: 'left:' + (m * opts.pxPerMin) + 'px' }));
        bars.filter(b => b.lane === lane).forEach(b => {
          const bar = h('div', { class: 'gantt-bar ' + (b.cls || ''), style: 'left:' + (b.start * opts.pxPerMin) + 'px; width:' + Math.max(b.dur * opts.pxPerMin - 2, 14) + 'px', title: b.title || b.label }, [b.label || '']);
          if (b.onClick) bar.addEventListener('click', b.onClick);
          track.appendChild(bar);
        });
        g.appendChild(h('div', { class: 'gantt-row' }, [h('div', { class: 'gantt-lane-label' }, [lane]), track]));
      });
      return g;
    },

    // ---- Genealogy tree: node={icon,main,meta,right,children:[]} ----
    tree(nodes) {
      const wrap = h('div', { class: 'tree' });
      (Array.isArray(nodes) ? nodes : [nodes]).forEach(n => wrap.appendChild(treeNode(n)));
      return wrap;
    },

    messageLog(lines) {
      return h('div', { class: 'msg-log' }, lines.map(l => h('div', {}, [
        h('span', { class: 'ts' }, [l.ts + ' ']),
        h('span', { class: l.cls || '' }, [(l.tag ? '[' + l.tag + '] ' : '') + l.text])
      ])));
    },

    // ---- Modal ----
    modal(opts) {
      opts = opts || {};
      const back = h('div', { class: 'modal-backdrop' });
      const close = () => back.remove();
      const m = h('div', { class: 'modal ' + (opts.size || '') }, [
        h('div', { class: 'modal-header' }, [opts.icon ? icon(opts.icon) : null, h('span', {}, [opts.title || '']), h('button', { class: 'close', onclick: close }, [icon('fa-xmark')])]),
        h('div', { class: 'modal-body' }, Array.isArray(opts.body) ? opts.body : [opts.body]),
        opts.footer ? h('div', { class: 'modal-footer' }, [].concat(opts.footer)) : null
      ]);
      back.appendChild(m);
      back.addEventListener('click', e => { if (e.target === back && opts.dismissable !== false) close(); });
      document.body.appendChild(back);
      return { el: back, close };
    },

    toast(msg, kind, ms) { return (global.MESShell ? global.MESShell.toast(msg, kind, ms) : alert(msg)); },

    // small helpers
    pct(v, d) { return (Math.round(v * Math.pow(10, d || 1)) / Math.pow(10, d || 1)); },
    fmt(n) { return (n == null ? '—' : Number(n).toLocaleString('en-IN')); }
  };

  function treeNode(n) {
    const node = h('div', { class: 'node' }, [
      h('span', { class: 'n-ic' }, [icon(n.icon || 'fa-circle-nodes')]),
      h('div', {}, [h('div', { class: 'n-main' }, [n.main || '']), n.meta ? h('div', { class: 'n-meta' }, [n.meta]) : null]),
      n.right ? h('div', { class: 'n-right' }, [].concat(n.right)) : null
    ]);
    if (n.children && n.children.length) {
      return h('div', {}, [node, h('div', { class: 'children' }, n.children.map(treeNode))]);
    }
    return node;
  }

  global.MESC = MESC;
})(window);
