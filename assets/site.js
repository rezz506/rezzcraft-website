// RezzCraft site: menu, copy-address buttons, live server status, seasonal strip.
(function () {
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var text = b.getAttribute('data-copy');
      var done = function () { var t = b.textContent; b.textContent = 'Copied!'; setTimeout(function () { b.textContent = t; }, 1600); };
      var fallback = function () {
        var code = b.parentElement.querySelector('code');
        if (!code) return;
        var r = document.createRange(); r.selectNodeContents(code);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else { fallback(); }
    });
  });

  // Live status from the free public status service. If it can't be reached, the plaque still shows the address.
  var els = document.querySelectorAll('.status');
  if (els.length) {
    fetch('https://api.mcsrvstat.us/3/mc.rezzcraft.us', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        els.forEach(function (el) {
          var label = el.querySelector('.label');
          if (d && d.online) {
            el.dataset.state = 'online';
            var n = d.players && typeof d.players.online === 'number' ? d.players.online : null;
            label.textContent = n !== null && n >= 5 ? 'Online · ' + n + ' players' : 'Online now';
          } else {
            el.dataset.state = 'offline';
            label.textContent = 'Restarting, back soon';
          }
        });
      })
      .catch(function () { els.forEach(function (el) { el.querySelector('.label').textContent = 'Open 24/7'; }); });
  }

  // Phone "Play now" bar: only after the first screen, and never while an address box or the footer is visible.
  var bar = document.querySelector('.playbar');
  if (bar && 'IntersectionObserver' in window) {
    var visible = new Set();
    var update = function () { bar.hidden = !(window.scrollY > window.innerHeight * 0.8 && visible.size === 0); };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) visible.add(e.target); else visible.delete(e.target); });
      update();
    });
    document.querySelectorAll('.plaque, .site-foot').forEach(function (p) { io.observe(p); });
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // Seasonal strips hide themselves after their end date (data-until="YYYY-MM-DD").
  document.querySelectorAll('[data-until]').forEach(function (el) {
    var until = new Date(el.getAttribute('data-until') + 'T23:59:59-06:00');
    if (new Date() > until) el.hidden = true;
  });
})();
