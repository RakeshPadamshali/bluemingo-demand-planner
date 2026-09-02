/* When a VSS page loads inside the vss.html tab host (an iframe), render content-only
   (hide its own header + sidebar) and route in-content links to the host's tabs. */
(function () {
  if (window.self === window.top) return;               // standalone: leave the page untouched
  document.documentElement.className += ' embedded';
  var s = document.createElement('style');
  s.textContent = '.embedded .bm-header,.embedded .bm-sidebar{display:none!important}' +
                  '.embedded .bm-layout{height:100vh!important}' +
                  '.embedded .bm-content{padding-top:12px}';
  (document.head || document.documentElement).appendChild(s);

  var MAP = {
    'vss-dashboard.html': 'dashboard',
    'vss-orders.html': 'orders',
    'vss-forecast.html': 'forecast',
    'vss-casting.html': 'casting',
    'vss-rolling.html': 'rolling',
    'vss-ndt.html': 'ndt',
    'vss-brightbar.html': 'brightbar',
    'vss-heattreat.html': 'heattreat',
    'vss-gantt.html': 'gantt',
    'vss-status.html': 'status',
    'vss-load.html': 'load',
    'vss-booking.html': 'booking'
  };
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = (a.getAttribute('href') || '').split('#')[0].split('?')[0];
    var id = MAP[href];
    if (id) { try { if (window.parent && window.parent.VSSHost) { e.preventDefault(); window.parent.VSSHost.open(id); } } catch (err) {} }
  }, true);
})();
