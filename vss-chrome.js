/* Injects the standalone header + sidebar into a VSS content page.
   Each page sets window.VSS_PAGE / VSS_TITLE / VSS_ICON before loading this.
   When embedded in vss.html, vss-embed.js hides this chrome and routes links to host tabs. */
(function () {
  var NAV = [
    ['Planning', [['dashboard', 'Dashboard', 'fa-gauge-high'], ['orders', 'Order Book', 'fa-clipboard-list']]],
    ['Production Plan', [['casting', 'Casting · SMS', 'fa-fire-flame-curved'], ['rolling', 'Rolling Mill', 'fa-bars-staggered'],
      ['ndt', 'NDT Line', 'fa-wave-square'], ['brightbar', 'Bright Bar', 'fa-ruler-horizontal'], ['heattreat', 'Heat Treatment', 'fa-temperature-high']]],
    ['Tracking', [['gantt', 'Master Gantt', 'fa-chart-gantt'], ['status', 'Order Status', 'fa-truck-fast']]]
  ];
  var DECOR = ['Machines', 'Grades & Specs', 'Setup'];
  var cur = window.VSS_PAGE || '';
  var layout = document.querySelector('.bm-layout');
  if (!layout) return;

  var h = document.createElement('header'); h.className = 'bm-header';
  h.innerHTML =
    '<div class="logo"><i class="fa-solid fa-industry"></i> Vardhman Special Steels <span class="sub">PPC</span></div>' +
    '<div class="module-name"><i class="fa-solid ' + (window.VSS_ICON || 'fa-diagram-project') + '" style="margin-right:4px;color:var(--accent);"></i>' + (window.VSS_TITLE || 'Production Planning') + '</div>' +
    '<div class="spacer"></div>' +
    '<div class="plant-switch"><button class="active"><i class="fa-solid fa-bars-staggered" style="margin-right:4px"></i>Bars &amp; Rod</button>' +
    '<button><i class="fa-solid fa-grip-lines" style="margin-right:4px"></i>Wire</button>' +
    '<button><i class="fa-solid fa-gears" style="margin-right:4px"></i>Forging</button></div>' +
    '<div class="right"><i class="fa-regular fa-bell"></i><div class="avatar">RP</div></div>';
  document.body.insertBefore(h, layout);

  var side = document.createElement('aside'); side.className = 'bm-sidebar';
  var html = '';
  NAV.forEach(function (sec) {
    html += '<div class="nav-label">' + sec[0] + '</div>';
    sec[1].forEach(function (it) {
      html += '<a href="vss-' + it[0] + '.html" class="' + (it[0] === cur ? 'active' : '') + '"><i class="fa-solid ' + it[2] + '"></i>' + it[1] + '</a>';
    });
  });
  html += '<div class="nav-label">Masters</div>';
  DECOR.forEach(function (d) { html += '<a class="decor"><i class="fa-solid fa-cube"></i>' + d + '</a>'; });
  side.innerHTML = html;
  layout.insertBefore(side, layout.firstChild);
})();
