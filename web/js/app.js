/* Zerodebt Solution - shared site behaviour (header, footer, animations, forms) */
(function () {
  'use strict';

  // ---------------------------------------------------------------- icons
  var P = {
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    handshake: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 15v3M12 9v9M17 5v13"/>',
    scale: '<path d="M12 3v18M5 21h14M5 7h14"/><path d="m5 7-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
    calc: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h.01M16 19h.01"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    pin: '<path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    bank: '<path d="M3 21h18M5 21V10M9 21V10M15 21V10M19 21V10M2 10l10-7 10 7z"/>',
    building: '<rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
    home: '<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/>',
    store: '<path d="m3 9 1-5h16l1 5"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M5 12v8h14v-8"/>',
    car: '<path d="M5 17h14M3 13l2-6h14l2 6v4H3z"/><circle cx="7.5" cy="17" r="1.5"/><circle cx="16.5" cy="17" r="1.5"/>',
    briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
    bolt: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    trend: '<path d="m23 6-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    caret: '<path d="m6 9 6 6 6-6"/>',
    up: '<path d="m18 15-6-6-6 6"/>',
    award: '<circle cx="12" cy="8" r="6"/><path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5"/>',
    refresh: '<path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.5 9a9 9 0 0 1 14.9-3.4L23 10M1 14l4.6 4.4A9 9 0 0 0 20.5 15"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>'
  };
  function ic(name, cls) {
    return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + (P[name] || P.check) + '</svg>';
  }
  function hydrateIcons(root) {
    (root || document).querySelectorAll('[data-icon]').forEach(function (el) {
      if (el.dataset.done) return;
      el.insertAdjacentHTML('afterbegin', ic(el.dataset.icon, el.dataset.cls));
      el.dataset.done = '1';
    });
  }
  window.ZD = window.ZD || {};
  ZD.ic = ic;

  // ---------------------------------------------------------------- helpers
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  ZD.esc = esc;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  ZD.$ = $; ZD.$$ = $$;

  ZD.api = function (url, opts) {
    return fetch(url, opts).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) {
        if (!r.ok) { var e = new Error(d.error || 'Request failed'); e.status = r.status; throw e; }
        return d;
      });
    });
  };

  ZD.toast = function (msg, isErr) {
    var wrap = $('.toast-wrap');
    if (!wrap) { wrap = document.createElement('div'); wrap.className = 'toast-wrap'; document.body.appendChild(wrap); }
    var t = document.createElement('div');
    t.className = 'toast' + (isErr ? ' err' : '');
    t.setAttribute('role', 'status');
    t.textContent = msg;
    wrap.appendChild(t);
    setTimeout(function () { t.classList.add('out'); setTimeout(function () { t.remove(); }, 320); }, 4200);
  };

  // ---------------------------------------------------------------- preloader (home, once per session)
  (function () {
    var pre = $('#preloader');
    if (!pre) return;
    var seen = false;
    try { seen = sessionStorage.getItem('zd_seen') === '1'; sessionStorage.setItem('zd_seen', '1'); } catch (e) { }
    if (seen) { pre.remove(); return; }
    var hide = function () { pre.classList.add('done'); setTimeout(function () { pre.remove(); }, 800); };
    window.addEventListener('load', function () { setTimeout(hide, 1250); });
    setTimeout(hide, 3500);
  })();

  // ---------------------------------------------------------------- header / footer
  var NAV = [
    { t: 'Home', h: 'index.html', k: 'index' },
    { t: 'About Us', h: 'about-us.html', k: 'about-us' },
    { t: 'Our Expertise', h: 'our-expertise.html', k: 'our-expertise' },
    { t: 'Our Clients', h: 'index.html#clients', k: 'clients' },
    { t: 'Explore', h: 'explore.html', k: 'explore' }
  ];
  var page = (location.pathname.split('/').pop() || 'index.html').replace('.html', '') || 'index';
  if (page === '') page = 'index';

  function buildHeader() {
    var host = $('#site-header');
    if (!host) return;
    var links = NAV.map(function (n) {
      var active = (n.k === page) || (n.k === 'index' && page === 'index' && !location.hash);
      return '<a class="nl' + (active ? ' active' : '') + '" data-k="' + n.k + '" href="' + n.h + '">' + n.t + '</a>';
    }).join('');
    host.innerHTML =
      '<header class="site-header" id="siteHeader"><div class="container nav-wrap">' +
      '<a class="brand" href="index.html" aria-label="Zerodebt Solution - Home"><img src="assets/logo.png" alt="Zerodebt Solution Pvt Ltd" width="100" height="50"></a>' +
      '<button class="burger" id="burger" aria-label="Open menu" aria-expanded="false">' + ic('menu') + '</button>' +
      '<nav class="nav" id="nav" aria-label="Main">' + links +
      '<div class="dd" id="dd"><button type="button" aria-haspopup="true" aria-expanded="false">Enquire Here <span class="caret">' + ic('caret') + '</span></button>' +
      '<div class="dd-menu" role="menu">' +
      '<a role="menuitem" href="business-enquiry.html"><span class="di">' + ic('building') + '</span><span><b>Business Enquiry</b><small>Banks, NBFCs &amp; lenders - partner with us</small></span></a>' +
      '<a role="menuitem" href="submit-case.html"><span class="di">' + ic('layers') + '</span><span><b>Submit Loan Portfolio</b><small>Share old loan accounts for recovery</small></span></a>' +
      '<a role="menuitem" href="business-enquiry.html#borrower"><span class="di">' + ic('heart') + '</span><span><b>Borrower Assistance</b><small>Get help resolving an old loan</small></span></a>' +
      '<a role="menuitem" href="track-case.html"><span class="di">' + ic('search') + '</span><span><b>Track Your Request</b><small>Check status with your reference ID</small></span></a>' +
      '<a role="menuitem" href="#" data-open-callback><span class="di">' + ic('phone') + '</span><span><b>Request a Callback</b><small>We will call you back</small></span></a>' +
      '</div></div></nav></div></header>';

    var header = $('#siteHeader'), burger = $('#burger'), nav = $('#nav'), dd = $('#dd');
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 20);
      var tt = $('.to-top'); if (tt) tt.classList.toggle('show', window.scrollY > 700);
      if (page === 'index') {
        var c = $('#clients'), cl = $('[data-k="clients"]'), hm = $('[data-k="index"]');
        if (c && cl && hm) {
          var r = c.getBoundingClientRect(), inC = r.top < window.innerHeight * 0.45 && r.bottom > 120;
          cl.classList.toggle('active', inC); hm.classList.toggle('active', !inC);
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

    burger.addEventListener('click', function () {
      var o = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', o);
      burger.innerHTML = ic(o ? 'x' : 'menu');
    });
    var ddBtn = dd.querySelector('button');
    ddBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var o = dd.classList.toggle('open'); ddBtn.setAttribute('aria-expanded', o);
    });
    document.addEventListener('click', function (e) { if (!dd.contains(e.target)) { dd.classList.remove('open'); ddBtn.setAttribute('aria-expanded', 'false'); } });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { dd.classList.remove('open'); closeModal(); } });
    $$('a', nav).forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); dd.classList.remove('open'); burger.innerHTML = ic('menu'); });
    });
  }

  function buildFooter() {
    var host = $('#site-footer');
    if (!host) return;
    host.innerHTML =
      '<footer class="site-footer"><div class="container">' +
      '<div class="foot-grid">' +
      '<div><a class="foot-logo" href="index.html"><img src="assets/logo.png" alt="Zerodebt Solution Pvt Ltd"></a>' +
      '<p>Analyse. Resolve. Recover. We help lenders recover old loans and help borrowers find a fair, lawful path out of debt.</p>' +
      '<div class="social"><a href="#" data-social="linkedin" aria-label="LinkedIn">in</a><a href="#" data-social="facebook" aria-label="Facebook">f</a><a href="#" data-social="instagram" aria-label="Instagram">ig</a><a href="#" data-social="x" aria-label="X">X</a></div></div>' +
      '<div><h4>Company</h4><ul><li><a href="index.html">Home</a></li><li><a href="about-us.html">About Us</a></li><li><a href="our-expertise.html">Our Expertise</a></li><li><a href="index.html#clients">Our Clients</a></li><li><a href="explore.html">Explore</a></li></ul></div>' +
      '<div><h4>Enquire</h4><ul><li><a href="business-enquiry.html">Business Enquiry</a></li><li><a href="submit-case.html">Submit Loan Portfolio</a></li><li><a href="business-enquiry.html#borrower">Borrower Assistance</a></li><li><a href="track-case.html">Track Your Request</a></li></ul></div>' +
      '<div><h4>Get in touch</h4>' +
      '<div class="contact-li">' + ic('phone') + '<span data-cfg="phone">-</span></div><br>' +
      '<div class="contact-li">' + ic('mail') + '<span data-cfg="email">-</span></div><br>' +
      '<div class="contact-li">' + ic('pin') + '<span data-cfg="address">-</span></div><br>' +
      '<div class="contact-li">' + ic('clock') + '<span data-cfg="hours">-</span></div></div>' +
      '</div>' +
      '<p class="disclaimer">Zerodebt Solution Pvt Ltd follows fair, lawful and respectful recovery practices. We do not use threats, harassment or public shaming. ' +
      'Information on this site is for general guidance and is not legal or financial advice.</p>' +
      '<div class="foot-bottom"><span>&copy; ' + new Date().getFullYear() + ' Zerodebt Solution Pvt Ltd. All rights reserved.</span><span>Towards a Debt-Free Tomorrow</span></div>' +
      '</div></footer>' +
      '<button class="to-top" aria-label="Back to top">' + ic('up') + '</button>' +
      '<button class="fab" data-open-callback aria-label="Request a callback">' + ic('phone') + '<span>Request a Callback</span></button>';
    $('.to-top').addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  ZD.config = {};
  function loadConfig() {
    ZD.api('/api/config').then(function (c) {
      ZD.config = c;
      $$('[data-cfg]').forEach(function (el) { if (c[el.dataset.cfg]) el.textContent = c[el.dataset.cfg]; });
      $$('[data-cfg-href]').forEach(function (el) {
        var k = el.dataset.cfgHref;
        if (k === 'tel' && c.phone) el.href = 'tel:' + c.phone.replace(/[^+\d]/g, '');
        if (k === 'mail' && c.email) el.href = 'mailto:' + c.email;
      });
      $$('[data-social]').forEach(function (a) { var u = c.social && c.social[a.dataset.social]; if (u && u !== '#') { a.href = u; a.target = '_blank'; a.rel = 'noopener'; } });
    }).catch(function () { });
  }

  // ---------------------------------------------------------------- reveal / counters / tilt
  function initReveal() {
    var els = $$('.reveal');
    els.forEach(function (el) { if (el.dataset.d) el.style.transitionDelay = el.dataset.d + 'ms'; });
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (e) { io.observe(e); });
  }
  function initCounters() {
    var els = $$('[data-count]');
    if (!els.length || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.textContent = e.dataset.count; }); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (!x.isIntersecting) return;
        io.unobserve(x.target);
        var el = x.target, to = parseFloat(el.dataset.count), t0 = performance.now(), dur = 1600;
        (function tick(t) {
          var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(to * e).toLocaleString('en-IN');
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.5 });
    els.forEach(function (e) { io.observe(e); });
  }
  function initTilt() {
    if (window.matchMedia('(hover: none)').matches) return;
    $$('.tilt').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(800px) rotateX(' + (-y * 7) + 'deg) rotateY(' + (x * 9) + 'deg) translateY(-6px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  // ---------------------------------------------------------------- tabs / accordion
  function initTabs() {
    $$('[data-tabs]').forEach(function (box) {
      var tabs = $$('.tab', box), panels = $$('.panel', box.parentNode);
      function show(id, push) {
        var found = false;
        tabs.forEach(function (t) { var on = t.dataset.tab === id; if (on) found = true; t.classList.toggle('on', on); t.setAttribute('aria-selected', on); });
        if (!found) return;
        panels.forEach(function (p) { p.classList.toggle('on', p.id === id); });
        if (push && box.dataset.hash) history.replaceState(null, '', '#' + id);
      }
      tabs.forEach(function (t) { t.addEventListener('click', function () { show(t.dataset.tab, true); }); });
      var h = location.hash.slice(1);
      if (box.dataset.hash) {
        if (h) show(h, false);
        window.addEventListener('hashchange', function () { show(location.hash.slice(1), false); });
      }
    });
  }
  function initAccordion() {
    $$('.acc-item').forEach(function (it) {
      var q = $('.acc-q', it), a = $('.acc-a', it);
      q.setAttribute('aria-expanded', 'false');
      q.addEventListener('click', function () {
        var open = !it.classList.contains('open');
        $$('.acc-item', it.parentNode).forEach(function (o) {
          o.classList.remove('open'); $('.acc-a', o).style.maxHeight = null; $('.acc-q', o).setAttribute('aria-expanded', 'false');
        });
        if (open) { it.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; q.setAttribute('aria-expanded', 'true'); }
      });
    });
  }

  // ---------------------------------------------------------------- hero (home)
  function initHero() {
    var cv = $('#heroCanvas');
    if (cv && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      var ctx = cv.getContext('2d'), W, H, dpr = Math.min(2, window.devicePixelRatio || 1), pts = [], mouse = { x: -999, y: -999 }, run = true;
      var resize = function () {
        var r = cv.parentNode.getBoundingClientRect(); W = r.width; H = r.height;
        cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        var n = Math.round(Math.min(90, W * H / 14000)); pts = [];
        for (var i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, g: Math.random() < .25 });
      };
      resize(); window.addEventListener('resize', resize);
      cv.parentNode.addEventListener('mousemove', function (e) { var r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
      cv.parentNode.addEventListener('mouseleave', function () { mouse.x = mouse.y = -999; });
      if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { run = e[0].isIntersecting; if (run) loop(); }).observe(cv);
      var loop = function () {
        if (!run) return;
        ctx.clearRect(0, 0, W, H);
        for (var i = 0; i < pts.length; i++) {
          var p = pts[i]; p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
          var dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) { p.x += dx / d * 1.2; p.y += dy / d * 1.2; }
          ctx.beginPath(); ctx.arc(p.x, p.y, p.g ? 2.4 : 1.7, 0, 6.283);
          ctx.fillStyle = p.g ? 'rgba(126,211,33,.9)' : 'rgba(170,200,255,.75)'; ctx.fill();
          for (var j = i + 1; j < pts.length; j++) {
            var q = pts[j], ax = p.x - q.x, ay = p.y - q.y, dd = ax * ax + ay * ay;
            if (dd < 14000) {
              ctx.strokeStyle = 'rgba(' + (p.g || q.g ? '126,211,33' : '150,185,255') + ',' + (0.22 * (1 - dd / 14000)) + ')';
              ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
            }
          }
        }
        requestAnimationFrame(loop);
      };
      loop();
    }
    var cyc = $$('.cycle span');
    if (cyc.length) {
      var i = 0; setInterval(function () { cyc.forEach(function (c, k) { c.classList.toggle('on', k === i); }); i = (i + 1) % cyc.length; }, 1700);
      cyc[0].classList.add('on'); i = 1;
    }
  }

  // ---------------------------------------------------------------- forms
  var PHONE_RE = /^[6-9]\d{9}$/, EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
  function cleanPhone(v) { return v.replace(/[\s-]/g, '').replace(/^(\+91|91|0)(?=\d{10}$)/, ''); }

  function setErr(field, msg) {
    if (!field) return;
    var w = field.closest('.field') || field.closest('.check');
    if (!w) return;
    w.classList.toggle('bad', !!msg);
    var e = w.querySelector('.err');
    if (!e && msg) { e = document.createElement('div'); e.className = 'err'; w.appendChild(e); }
    if (e) e.textContent = msg || '';
  }

  ZD.bindEnquiryForm = function (form) {
    var type = form.dataset.enquiry;
    form.setAttribute('novalidate', '');
    $$('input,select,textarea', form).forEach(function (f) { f.addEventListener('input', function () { setErr(f, ''); }); });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var d = { type: type }, bad = null;
      $$('input,select,textarea', form).forEach(function (f) {
        if (!f.name) return;
        d[f.name] = f.type === 'checkbox' ? f.checked : f.value.trim();
      });
      function need(name, msg, test) {
        var f = form.elements[name]; if (!f) return;
        var v = d[name], ok = test ? test(v) : (v === true || (v && v.length));
        if (!ok) { setErr(f, msg); bad = bad || f; } else setErr(f, '');
      }
      d.phone = cleanPhone(d.phone || '');
      need('name', 'Please enter your name.', function (v) { return v && v.length >= 2; });
      need('phone', 'Enter a valid 10-digit mobile number.', function (v) { return PHONE_RE.test(v); });
      var emailReq = form.elements.email && form.elements.email.required;
      need('email', 'Enter a valid email address.', function (v) { return v ? EMAIL_RE.test(v) : !emailReq; });
      $$('[required]', form).forEach(function (f) {
        if (['name', 'phone', 'email', 'consent'].indexOf(f.name) > -1) return;
        need(f.name, 'This field is required.');
      });
      need('consent', 'Please tick the consent box.');
      if (bad) { bad.focus(); return; }

      var btn = form.querySelector('[type=submit]'), label = btn.innerHTML;
      btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Sending...';
      ZD.api('/api/enquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) })
        .then(function (res) {
          form.innerHTML =
            '<div class="success"><div class="tick">' + ic('check') + '</div><h3>Thank you, ' + esc(d.name.split(' ')[0]) + '!</h3>' +
            '<p>' + esc(res.message) + '</p>' +
            (type !== 'callback' ? '<div class="refbox">' + esc(res.ref) + '</div><p class="form-note">Save this reference ID. You can track your request any time on the <a class="green" href="track-case.html"><b>Track</b></a> page using this ID and the last 4 digits of your mobile.</p>' : '') +
            '</div>';
          ZD.toast('Request submitted successfully');
        })
        .catch(function (e) { ZD.toast(e.message, true); btn.disabled = false; btn.innerHTML = label; });
    });
  };

  // callback modal (every page)
  var modal;
  function closeModal() { if (modal) modal.classList.remove('open'); }
  function openCallback(ev) {
    if (ev) ev.preventDefault();
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'modal'; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-label', 'Request a callback');
      modal.innerHTML = '<div class="modal-box"><button class="modal-x" aria-label="Close">' + ic('x') + '</button>' +
        '<h3>Request a callback</h3><p>Leave your number and our team will call you back within 24 working hours.</p>' +
        '<form class="form" data-enquiry="callback">' +
        '<div class="field"><label>Your name <i>*</i></label><input name="name" required autocomplete="name"></div>' +
        '<div class="field"><label>Mobile number <i>*</i></label><input name="phone" required inputmode="numeric" autocomplete="tel" placeholder="10-digit mobile"></div>' +
        '<div class="field"><label>Preferred time</label><select name="preferredTime"><option>Any time</option><option>Morning (10 - 1)</option><option>Afternoon (1 - 4)</option><option>Evening (4 - 6:30)</option></select></div>' +
        '<div class="field"><label>How can we help?</label><textarea name="message" maxlength="500" style="min-height:80px"></textarea></div>' +
        '<label class="check"><input type="checkbox" name="consent"><span>I agree to be contacted by Zerodebt Solution regarding my request.</span></label>' +
        '<button class="btn btn-primary" type="submit">Call me back ' + ic('arrow', 'arrow') + '</button></form></div>';
      document.body.appendChild(modal);
      modal.addEventListener('click', function (e) { if (e.target === modal || e.target.closest('.modal-x')) closeModal(); });
      ZD.bindEnquiryForm($('form', modal));
    }
    requestAnimationFrame(function () { modal.classList.add('open'); var f = $('input', modal); if (f) f.focus(); });
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-open-callback]');
    if (t) openCallback(e);
  });

  ZD.fillRange = function (r) { var p = (r.value - r.min) / (r.max - r.min) * 100; r.style.setProperty('--p', p + '%'); };

  // ---------------------------------------------------------------- boot
  function boot() {
    buildHeader(); buildFooter(); hydrateIcons();
    loadConfig(); initReveal(); initCounters(); initTilt(); initTabs(); initAccordion(); initHero();
    $$('form[data-enquiry]').forEach(function (f) { if (!f.closest('.modal')) ZD.bindEnquiryForm(f); });
    $$('input[type=range]').forEach(function (r) { ZD.fillRange(r); r.addEventListener('input', function () { ZD.fillRange(r); }); });
    if (page === 'index' && location.hash === '#clients') setTimeout(function () { var c = $('#clients'); if (c) c.scrollIntoView(); }, 1400);
    document.dispatchEvent(new Event('zd:ready'));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
