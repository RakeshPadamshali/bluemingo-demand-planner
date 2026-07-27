/* When a CRM page is loaded inside the crm.html tab host (an iframe), render content-only
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
    'production-confirmation-mockup-CRM.html': 'confirmation',
    'crm-schedule.html': 'schedule',
    'crm-gantt.html': 'gantt',
    'crm-slitting.html': 'slitting'
  };
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = (a.getAttribute('href') || '').split('#')[0].split('?')[0];
    var id = MAP[href];
    if (id) { try { if (window.parent && window.parent.CRMHost) { e.preventDefault(); window.parent.CRMHost.open(id); } } catch (err) {} }
  }, true);
})();
