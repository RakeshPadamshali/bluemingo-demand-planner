/* ============================================================
   Bluemingo MES v2 — app shell (Integrated Works demo)
   Renders header + sidebar, handles role switch + active nav.
   Usage on each page:
     <body><script>
       const { body } = MESShell.mount({ active:'scheduling',
         title:'Scheduling & Order Management', crumb:['Planning','SMS-2 / HSM-2'] });
       // render page content into `body`
     </script></body>
   ============================================================ */
(function (global) {
  'use strict';

  // ---- Roles (canonical, also used for nav gating) ----
  const ROLES = [
    { id: 'admin',    name: 'System Admin',        initials: 'SA', plant: 'ALL' },
    { id: 'ppic',     name: 'PPIC Planner',        initials: 'PP', plant: 'ALL' },
    { id: 'operator', name: 'Shift Operator (SMS)', initials: 'SO', plant: 'SMS-2' },
    { id: 'qc',       name: 'QC Inspector',        initials: 'QC', plant: 'ALL' }
  ];

  // ---- Navigation model. `roles` omitted => visible to everyone. ----
  const NAV = [
    { group: 'Overview', items: [
      { id: 'home',        label: 'Home',            icon: 'fa-house',           href: 'index.html' }
    ]},
    { group: 'Planning', items: [
      { id: 'scheduling',  label: 'Scheduling',      icon: 'fa-calendar-days',   href: 'scheduling.html', roles: ['admin','ppic'] }
    ]},
    { group: 'Operations', items: [
      { id: 'operations',  label: 'Operations',      icon: 'fa-industry',        href: 'operations.html', roles: ['admin','ppic','operator'] },
      { id: 'pc',          label: 'Production Conf.', icon: 'fa-clipboard-check', href: 'production-confirmation.html', roles: ['admin','operator'] }
    ]},
    { group: 'Quality', items: [
      { id: 'q-chem',      label: 'Heat Chemistry',  icon: 'fa-vial-circle-check', href: 'quality-chemistry.html',     roles: ['admin','qc','ppic'] },
      { id: 'q-sampling',  label: 'Sampling',        icon: 'fa-vials',            href: 'quality-sampling.html',      roles: ['admin','qc','ppic'] },
      { id: 'q-testing',   label: 'Testing',         icon: 'fa-flask',            href: 'quality-testing.html',       roles: ['admin','qc','ppic'] },
      { id: 'q-inspection',label: 'Inspection',      icon: 'fa-clipboard-check',  href: 'quality-inspection.html',    roles: ['admin','qc','ppic'] },
      { id: 'q-defects',   label: 'Defects',         icon: 'fa-triangle-exclamation', href: 'quality-defects.html',   roles: ['admin','qc','ppic'] },
      { id: 'q-clearance', label: 'Clearance',       icon: 'fa-circle-check',     href: 'quality-clearance.html',     roles: ['admin','qc','ppic'] },
      { id: 'q-ud',        label: 'Usage Decision',  icon: 'fa-gavel',            href: 'quality-usage-decision.html',roles: ['admin','qc','ppic'] },
      { id: 'q-salvage',   label: 'Salvage & NCR',   icon: 'fa-screwdriver-wrench', href: 'quality-salvage.html',     roles: ['admin','qc','ppic'] },
      { id: 'q-cert',      label: 'Certificates',    icon: 'fa-certificate',      href: 'quality-certificate.html',   roles: ['admin','qc','ppic'] }
    ]},
    { group: 'Logistics', items: [
      { id: 'yard',        label: 'Yard · SYMS/CYMS', icon: 'fa-warehouse',      href: 'yard.html', roles: ['admin','ppic','operator'] }
    ]},
    { group: 'Insights', items: [
      { id: 'reports',     label: 'Reports & KPIs',  icon: 'fa-chart-line',      href: 'reports.html' }
    ]},
    { group: 'System', items: [
      { id: 'integration', label: 'Integration',     icon: 'fa-plug',            href: 'integration.html', roles: ['admin'] },
      { id: 'security',    label: 'Security & Access', icon: 'fa-shield-halved', href: 'security.html', roles: ['admin'] }
    ]}
  ];

  const RKEY = 'mes_demo_role';
  function getRole()   { return localStorage.getItem(RKEY) || 'admin'; }
  function setRole(id) { localStorage.setItem(RKEY, id); }
  function role()      { return ROLES.find(r => r.id === getRole()) || ROLES[0]; }
  function canSee(item){ const r = getRole(); return !item.roles || r === 'admin' ? true : item.roles.includes(r); }

  function h(tag, attrs, kids) {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === 'class') e.className = attrs[k];
      else if (k === 'html') e.innerHTML = attrs[k];
      else if (k.startsWith('on') && typeof attrs[k] === 'function') e.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(c => c != null && e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
    return e;
  }

  function buildHeader(active) {
    const r = role();
    const roleSel = h('select', { class: 'role-select', title: 'Switch role (demonstrates access control)',
      onchange: function () { setRole(this.value); location.reload(); } },
      ROLES.map(x => h('option', { value: x.id, selected: x.id === r.id ? 'selected' : null }, [x.name])));

    return h('div', { class: 'bm-header' }, [
      h('button', { class: 'menu-toggle', onclick: () => document.body.classList.toggle('nav-open') }, [icon('fa-bars')]),
      h('div', { class: 'logo' }, [icon('fa-cubes'), 'Bluemingo MES ', h('span', { style: 'opacity:.6;font-weight:400' }, ['v2'])]),
      h('div', { class: 'module-name' }, ['Manufacturing Execution System']),
      h('div', { class: 'spacer' }),
      h('div', { class: 'h-plant' }, [icon('fa-location-dot'), 'Integrated Steel Works']),
      h('div', { class: 'right' }, [
        h('span', { class: 'icon-btn', title: 'Alerts' }, [icon('fa-bell'), h('span', { class: 'dot' })]),
        h('div', { class: 'role-chip' }, [
          h('span', { class: 'avatar' }, [r.initials]),
          roleSel
        ])
      ])
    ]);
  }

  function buildSidebar(active) {
    const nav = h('nav', { class: 'bm-sidebar' });
    NAV.forEach(section => {
      const visible = section.items.filter(it => it.id === 'home' || true); // keep groups; gate per item
      nav.appendChild(h('div', { class: 'nav-label' }, [section.group]));
      section.items.forEach(it => {
        const allowed = canSee(it);
        const a = h('a', {
          class: (it.id === active ? 'active ' : '') + (allowed ? '' : 'denied'),
          href: allowed ? it.href : 'javascript:void(0)',
          title: allowed ? it.label : it.label + ' — no access for this role',
          onclick: allowed ? null : function (e) { e.preventDefault(); MESShell.toast('Permission denied for ' + role().name, 'danger'); }
        }, [ icon(it.icon), h('span', {}, [it.label]), allowed ? null : icon('fa-lock', 'lock') ]);
        nav.appendChild(a);
      });
    });
    return nav;
  }

  function icon(name, cls) { const i = document.createElement('i'); i.className = 'fa-solid ' + name + (cls ? ' ' + cls : ''); return i; }

  function crumbEl(crumb) {
    const parts = Array.isArray(crumb) ? crumb : (crumb ? [crumb] : []);
    const c = h('div', { class: 'crumb' }, [icon('fa-house')]);
    parts.forEach((p, i) => { c.appendChild(icon('fa-chevron-right')); c.appendChild(document.createTextNode(' ' + p + ' ')); });
    return c;
  }

  // ---- Workspace tabs (browser / IDE-style, persisted per session) ----
  const TKEY = 'mes_tabs';
  let _tabHost = null, _active = null;
  function navIndex() { const m = {}; NAV.forEach(s => s.items.forEach(it => { m[it.id] = it; })); return m; }
  function hrefOf(id) { const it = navIndex()[id]; return it ? it.href : 'index.html'; }
  function getTabs() { try { const a = JSON.parse(sessionStorage.getItem(TKEY) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  function setTabs(ids) { try { sessionStorage.setItem(TKEY, JSON.stringify(ids)); } catch (e) {} }
  function dedupe(a) { return a.filter((v, i) => a.indexOf(v) === i); }
  function normalizeTabs(active) {
    const idx = navIndex();
    let tabs = getTabs().filter(id => idx[id]);
    if (!tabs.includes('home')) tabs.unshift('home');
    if (active && idx[active] && !tabs.includes(active)) tabs.push(active);
    tabs = dedupe(tabs);
    setTabs(tabs);
    return tabs;
  }
  function buildTabStrip(active) {
    const idx = navIndex();
    const tabs = normalizeTabs(active);
    const list = h('div', { class: 'ws-tabs-list' });
    tabs.forEach(id => {
      const it = idx[id];
      const isActive = id === active, isHome = id === 'home';
      const closeBtn = isHome ? null : h('span', { class: 'ws-close', title: 'Close tab',
        onclick: function (e) { e.stopPropagation(); closeTab(id, active); } }, [icon('fa-xmark')]);
      list.appendChild(h('div', {
        class: 'ws-tab' + (isActive ? ' active' : '') + (isHome ? ' pinned' : ''), title: it.label,
        onclick: function () { if (!isActive) location.href = it.href; },
        oncontextmenu: function (e) { e.preventDefault(); openTabMenu(e.clientX, e.clientY, id, active, false); }
      }, [ icon(it.icon, 'ws-ic'), h('span', { class: 'ws-label' }, [it.label]), closeBtn ]));
    });
    return h('div', { class: 'ws-tabstrip' }, [
      list,
      h('button', { class: 'ws-menu-btn', title: 'Tab actions',
        onclick: function () { const r = this.getBoundingClientRect(); openTabMenu(r.right - 6, r.bottom + 2, active, active, true); } }, [icon('fa-ellipsis-vertical')])
    ]);
  }
  function rerenderStrip() { if (_tabHost) { _tabHost.innerHTML = ''; _tabHost.appendChild(buildTabStrip(_active)); } }
  function closeTab(id, active) {
    const before = normalizeTabs(active);
    let tabs = before.filter(t => t !== id);
    if (!tabs.includes('home')) tabs.unshift('home');
    setTabs(tabs);
    if (id === active) {
      const i = before.indexOf(id);
      let go = before[i - 1] || before[i + 1] || 'home';
      if (!tabs.includes(go)) go = tabs[tabs.length - 1] || 'home';
      location.href = hrefOf(go);
    } else { rerenderStrip(); }
  }
  function closeOthers(keepId, active) {
    setTabs(dedupe(['home', keepId]));
    if (keepId === active) rerenderStrip(); else location.href = hrefOf(keepId);
  }
  function closeAll(active) {
    setTabs(['home']);
    if (active !== 'home') location.href = 'index.html'; else rerenderStrip();
  }
  function closeRight(fromId, active) {
    const tabs = normalizeTabs(active);
    let kept = tabs.slice(0, tabs.indexOf(fromId) + 1);
    if (!kept.includes('home')) kept.unshift('home');
    setTabs(dedupe(kept));
    if (!getTabs().includes(active)) location.href = hrefOf(fromId); else rerenderStrip();
  }
  function closeAnyTabMenu() { document.querySelectorAll('.ws-tabmenu').forEach(m => m.remove()); }
  function openTabMenu(x, y, id, active, isGlobal) {
    closeAnyTabMenu();
    const tabs = getTabs(), isHome = id === 'home';
    const rightCount = Math.max(0, tabs.length - 1 - tabs.indexOf(id));
    const othersCount = tabs.filter(t => t !== id && t !== 'home').length;
    const rows = [];
    if (!isGlobal && !isHome) rows.push(['Close', 'fa-xmark', function () { closeTab(id, active); }]);
    rows.push(['Close others', 'fa-diagram-next', othersCount ? function () { closeOthers(id, active); } : null]);
    rows.push(['Close tabs to the right', 'fa-arrow-right-long', rightCount ? function () { closeRight(id, active); } : null]);
    rows.push(['Close all', 'fa-trash-can', function () { closeAll(active); }]);
    const menu = h('div', { class: 'ws-tabmenu' }, rows.map(function (r) {
      const dis = !r[2];
      return h('div', { class: 'ws-tabmenu-item' + (dis ? ' disabled' : ''),
        onclick: dis ? null : function () { closeAnyTabMenu(); r[2](); } }, [icon(r[1]), h('span', {}, [r[0]])]);
    }));
    menu.style.left = Math.max(6, Math.min(x, window.innerWidth - 214)) + 'px';
    menu.style.top = Math.min(y, window.innerHeight - 176) + 'px';
    document.body.appendChild(menu);
    setTimeout(function () { document.addEventListener('mousedown', onDown, true); }, 0);
    function onDown(e) { if (!menu.contains(e.target)) { closeAnyTabMenu(); document.removeEventListener('mousedown', onDown, true); } }
  }

  function idByHref(href) { const idx = navIndex(); return Object.keys(idx).find(k => idx[k].href === href); }
  function wireEmbeddedLinks() {
    // Inside the tabbed host: in-content links to other module pages open a parent TAB instead of navigating the frame.
    document.addEventListener('click', function (e) {
      const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!a) return;
      const href = (a.getAttribute('href') || '').split('#')[0].split('?')[0];
      if (!/\.html$/.test(href)) return;
      const id = idByHref(href);
      try { if (id && window.parent && window.parent.MESHost) { e.preventDefault(); window.parent.MESHost.open(id); } } catch (err) {}
    }, true);
  }

  const MESShell = {
    ROLES, NAV, getRole, setRole, role, canSee,
    mount(opts) {
      opts = opts || {};
      document.title = (opts.title ? opts.title + ' · ' : '') + 'Bluemingo MES';
      const embedded = window.self !== window.top;
      const pageActions = h('div', { class: 'actions' });
      const pageBody = h('div', { class: 'page-body' });
      const content = h('main', { class: 'bm-content' + (embedded ? ' bm-embedded' : '') }, [
        h('div', { class: 'page-bar' }, [
          h('h1', {}, [opts.title || '']),
          crumbEl(opts.crumb),
          pageActions
        ]),
        pageBody
      ]);
      if (embedded) {
        // Content-only: the tabbed host (app.html) supplies header / sidebar / tab strip.
        document.body.appendChild(content);
        wireEmbeddedLinks();
      } else {
        const app = h('div', { class: 'bm-app' });
        app.appendChild(buildHeader(opts.active));
        _active = opts.active || 'home';
        _tabHost = h('div', { class: 'ws-tabhost' }, [buildTabStrip(_active)]);
        const contentCol = h('div', { class: 'bm-contentcol' }, [_tabHost, content]);
        app.appendChild(h('div', { class: 'bm-layout' }, [buildSidebar(opts.active), contentCol]));
        document.body.appendChild(app);
      }
      this.body = pageBody; this.actions = pageActions;
      return { body: pageBody, actions: pageActions, role: role() };
    },
    // ---- Tabbed host (app.html): persistent chrome + one iframe per tab (zero-reload switching) ----
    host(opts) {
      opts = opts || {};
      const idx = navIndex();
      const frames = {};
      let active = 'home';
      try { active = new URLSearchParams(location.search).get('tab') || opts.initial || 'home'; } catch (e) {}
      if (!idx[active]) active = 'home';

      const sidebar = h('nav', { class: 'bm-sidebar' });
      const tabHost = h('div', { class: 'ws-tabhost' });
      const stack = h('div', { class: 'bm-framestack' });
      const app = h('div', { class: 'bm-app' }, [
        buildHeader('__host__'),
        h('div', { class: 'bm-layout' }, [ sidebar, h('div', { class: 'bm-contentcol' }, [tabHost, stack]) ])
      ]);
      document.body.appendChild(app);

      function ensureFrame(id) {
        if (frames[id]) return frames[id];
        const f = h('iframe', { class: 'bm-frame', src: idx[id].href, title: idx[id].label });
        f.style.display = 'none';
        stack.appendChild(f); frames[id] = f; return f;
      }
      function activate(id) {
        if (!idx[id]) return;
        if (!canSee(idx[id])) { MESShell.toast('Permission denied for ' + role().name, 'danger'); return; }
        active = id; normalizeTabs(active); ensureFrame(id);
        Object.keys(frames).forEach(function (k) { frames[k].style.display = (k === active ? 'block' : 'none'); });
        try { var af = frames[active]; if (af && af.contentWindow) af.contentWindow.dispatchEvent(new Event('mes:activated')); } catch (e) {}
        try { history.replaceState(null, '', 'app.html?tab=' + id); } catch (e) {}
        document.title = idx[id].label + ' · Bluemingo MES';
        render();
      }
      function closeFrame(id) { if (frames[id]) { frames[id].remove(); delete frames[id]; } }
      function closeTabH(id) {
        const before = normalizeTabs(active);
        let t = before.filter(function (x) { return x !== id; });
        if (!t.includes('home')) t.unshift('home'); setTabs(t); closeFrame(id);
        if (id === active) { const i = before.indexOf(id); let go = before[i - 1] || before[i + 1] || 'home'; if (!t.includes(go)) go = t[t.length - 1] || 'home'; activate(go); }
        else render();
      }
      function closeOthersH(keepId) { setTabs(dedupe(['home', keepId])); Object.keys(frames).forEach(function (k) { if (k !== 'home' && k !== keepId) closeFrame(k); }); activate(keepId); }
      function closeAllH() { setTabs(['home']); Object.keys(frames).forEach(function (k) { if (k !== 'home') closeFrame(k); }); activate('home'); }
      function closeRightH(fromId) { const t = normalizeTabs(active); let kept = dedupe((t.slice(0, t.indexOf(fromId) + 1).includes('home') ? [] : ['home']).concat(t.slice(0, t.indexOf(fromId) + 1))); setTabs(kept); Object.keys(frames).forEach(function (k) { if (!kept.includes(k)) closeFrame(k); }); if (!getTabs().includes(active)) activate(fromId); else render(); }

      function render() { renderSidebar(); renderTabs(); }
      function renderSidebar() {
        const st = sidebar.scrollTop;                     // preserve scroll so lower items don't jump to top
        sidebar.innerHTML = '';
        NAV.forEach(function (section) {
          sidebar.appendChild(h('div', { class: 'nav-label' }, [section.group]));
          section.items.forEach(function (it) {
            const allowed = canSee(it);
            sidebar.appendChild(h('a', {
              class: (it.id === active ? 'active ' : '') + (allowed ? '' : 'denied'),
              href: 'javascript:void(0)', title: allowed ? it.label : it.label + ' — no access for this role',
              onclick: function () { allowed ? activate(it.id) : MESShell.toast('Permission denied for ' + role().name, 'danger'); }
            }, [ icon(it.icon), h('span', {}, [it.label]), allowed ? null : icon('fa-lock', 'lock') ]));
          });
        });
        sidebar.scrollTop = st;
      }
      function renderTabs() {
        tabHost.innerHTML = '';
        const list = h('div', { class: 'ws-tabs-list' });
        normalizeTabs(active).forEach(function (id) {
          const isActive = id === active, isHome = id === 'home';
          list.appendChild(h('div', {
            class: 'ws-tab' + (isActive ? ' active' : '') + (isHome ? ' pinned' : ''), title: idx[id].label,
            onclick: function () { if (!isActive) activate(id); },
            oncontextmenu: function (e) { e.preventDefault(); hmenu(e.clientX, e.clientY, id, false); }
          }, [ icon(idx[id].icon, 'ws-ic'), h('span', { class: 'ws-label' }, [idx[id].label]),
               isHome ? null : h('span', { class: 'ws-close', title: 'Close tab', onclick: function (e) { e.stopPropagation(); closeTabH(id); } }, [icon('fa-xmark')]) ]));
        });
        tabHost.appendChild(h('div', { class: 'ws-tabstrip' }, [ list,
          h('button', { class: 'ws-menu-btn', title: 'Tab actions', onclick: function () { const r = this.getBoundingClientRect(); hmenu(r.right - 6, r.bottom + 2, active, true); } }, [icon('fa-ellipsis-vertical')]) ]));
      }
      function hmenu(x, y, id, isGlobal) {
        closeAnyTabMenu();
        const t = getTabs(), isHome = id === 'home';
        const rightCount = Math.max(0, t.length - 1 - t.indexOf(id));
        const othersCount = t.filter(function (z) { return z !== id && z !== 'home'; }).length;
        const rows = [];
        if (!isGlobal && !isHome) rows.push(['Close', 'fa-xmark', function () { closeTabH(id); }]);
        rows.push(['Close others', 'fa-diagram-next', othersCount ? function () { closeOthersH(id); } : null]);
        rows.push(['Close tabs to the right', 'fa-arrow-right-long', rightCount ? function () { closeRightH(id); } : null]);
        rows.push(['Close all', 'fa-trash-can', function () { closeAllH(); }]);
        const m = h('div', { class: 'ws-tabmenu' }, rows.map(function (r) {
          const dis = !r[2];
          return h('div', { class: 'ws-tabmenu-item' + (dis ? ' disabled' : ''), onclick: dis ? null : function () { closeAnyTabMenu(); r[2](); } }, [icon(r[1]), h('span', {}, [r[0]])]);
        }));
        m.style.left = Math.max(6, Math.min(x, window.innerWidth - 214)) + 'px';
        m.style.top = Math.min(y, window.innerHeight - 176) + 'px';
        document.body.appendChild(m);
        setTimeout(function () { document.addEventListener('mousedown', function od(e) { if (!m.contains(e.target)) { closeAnyTabMenu(); document.removeEventListener('mousedown', od, true); } }, true); }, 0);
      }

      window.MESHost = { open: activate };
      normalizeTabs(active);
      render();
      activate(active);
      return { open: activate };
    },
    toast(msg, kind, ms) {
      let wrap = document.querySelector('.toast-wrap');
      if (!wrap) { wrap = h('div', { class: 'toast-wrap' }); document.body.appendChild(wrap); }
      const icons = { success: 'fa-circle-check', danger: 'fa-circle-exclamation', warning: 'fa-triangle-exclamation', info: 'fa-circle-info' };
      const t = h('div', { class: 'toast ' + (kind || 'info') }, [ icon(icons[kind] || icons.info, 't-ic'), h('span', {}, [msg]) ]);
      wrap.appendChild(t);
      setTimeout(() => { t.style.transition = 'opacity .3s'; t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, ms || 3200);
    }
  };

  global.MESShell = MESShell;
  global.h = global.h || h; // shared element helper
})(window);
