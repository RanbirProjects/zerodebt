/* Explore page: insights list/search/filter + server-side calculators */
(function () {
  'use strict';
  var $ = ZD.$, esc = ZD.esc;
  var inr = function (n) { return 'Rs ' + Math.round(n).toLocaleString('en-IN'); };
  var items = [], cat = 'All', q = '';

  function render() {
    var grid = $('#artGrid');
    var list = items.filter(function (a) {
      return (cat === 'All' || a.category === cat) &&
        (!q || (a.title + ' ' + a.summary + ' ' + a.category).toLowerCase().indexOf(q) > -1);
    });
    if (!list.length) { grid.innerHTML = '<div class="empty">No insights match your search.</div>'; return; }
    grid.innerHTML = list.map(function (a, i) {
      return '<article class="card art tilt reveal in" tabindex="0" data-id="' + a.id + '" style="animation:panelIn .5s ' + (i * 60) + 'ms both">' +
        '<div class="meta"><span class="badge">' + esc(a.category) + '</span><span class="form-note">' + a.readTime + ' min read</span></div>' +
        '<div class="ico">' + ZD.ic(a.icon) + '</div><h3>' + esc(a.title) + '</h3><p>' + esc(a.summary.slice(0, 120)) + '...</p>' +
        '<span class="link-arrow">Read key points ' + ZD.ic('arrow') + '</span></article>';
    }).join('');
  }

  function openArticle(id) {
    var a = items.filter(function (x) { return x.id == id; })[0];
    if (!a) return;
    var m = document.createElement('div');
    m.className = 'modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
    m.innerHTML = '<div class="modal-box"><button class="modal-x" aria-label="Close">' + ZD.ic('x') + '</button>' +
      '<span class="badge">' + esc(a.category) + '</span><h3 style="margin-top:.8rem">' + esc(a.title) + '</h3>' +
      '<p>' + esc(a.summary) + '</p><b style="color:var(--navy)">Key points</b><ul class="lead-list">' +
      a.points.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>' +
      '<a class="btn btn-primary" style="margin-top:1.5rem" href="business-enquiry.html">Talk to an expert ' + ZD.ic('arrow', 'arrow') + '</a></div>';
    document.body.appendChild(m);
    requestAnimationFrame(function () { m.classList.add('open'); });
    var close = function () { m.classList.remove('open'); setTimeout(function () { m.remove(); }, 300); document.removeEventListener('keydown', esc2); };
    var esc2 = function (e) { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', esc2);
    m.addEventListener('click', function (e) { if (e.target === m || e.target.closest('.modal-x')) close(); });
  }

  function debounce(fn, ms) { var t; return function () { clearTimeout(t); t = setTimeout(fn, ms); }; }

  function bindRange(id, fmt, onChange) {
    var r = $('#' + id), o = $('#' + id + 'O');
    var upd = function () { o.textContent = fmt(+r.value); ZD.fillRange(r); onChange(); };
    r.addEventListener('input', upd); o.textContent = fmt(+r.value); ZD.fillRange(r);
  }
  var months = function (n) { return n >= 24 ? Math.floor(n / 12) + ' yr ' + (n % 12 ? (n % 12) + ' mo' : '') : n + ' months'; };

  function emiCalc() {
    var url = '/api/calc/emi?amount=' + $('#eAmt').value + '&rate=' + $('#eRate').value + '&months=' + $('#eMon').value;
    ZD.api(url).then(function (d) {
      $('#eEmi').textContent = inr(d.emi);
      $('#ePrin').textContent = inr(d.principal);
      $('#eInt').textContent = inr(d.totalInterest);
      $('#eTot').textContent = inr(d.totalPayable);
      $('#eDonut').style.setProperty('--d', (d.totalInterest / d.totalPayable * 100).toFixed(1) + '%');
    }).catch(function (e) { ZD.toast(e.message, true); });
  }
  function restructureCalc() {
    var url = '/api/calc/restructure?outstanding=' + $('#rOut').value + '&rate=' + $('#rRate').value +
      '&currentMonths=' + $('#rCur').value + '&newMonths=' + $('#rNew').value;
    ZD.api(url).then(function (d) {
      $('#rRelief').textContent = (d.monthlyRelief >= 0 ? '' : '-') + inr(Math.abs(d.monthlyRelief)) + '/mo';
      $('#rCurEmi').textContent = inr(d.currentEmi);
      $('#rNewEmi').textContent = inr(d.newEmi);
      $('#rCurInt').textContent = inr(d.currentInterest);
      $('#rNewInt').textContent = inr(d.newInterest);
      $('#rExtra').textContent = (d.extraInterest >= 0 ? '+' : '-') + inr(Math.abs(d.extraInterest));
    }).catch(function (e) { ZD.toast(e.message, true); });
  }

  document.addEventListener('zd:ready', function () {
    // insights
    ZD.api('/api/insights').then(function (d) {
      items = d.items;
      $('#catChips').innerHTML = d.categories.map(function (c, i) {
        return '<button class="tab' + (i ? '' : ' on') + '" data-cat="' + esc(c) + '">' + esc(c) + '</button>';
      }).join('');
      $('#catChips').addEventListener('click', function (e) {
        var b = e.target.closest('[data-cat]'); if (!b) return;
        cat = b.dataset.cat;
        Array.prototype.forEach.call($('#catChips').children, function (x) { x.classList.toggle('on', x === b); });
        render();
      });
      render();
    }).catch(function () { $('#artGrid').innerHTML = '<div class="empty">Could not load insights. Please refresh.</div>'; });

    $('#artSearch').addEventListener('input', function (e) { q = e.target.value.trim().toLowerCase(); render(); });
    $('#artGrid').addEventListener('click', function (e) { var c = e.target.closest('.art'); if (c) openArticle(c.dataset.id); });
    $('#artGrid').addEventListener('keydown', function (e) { if (e.key === 'Enter') { var c = e.target.closest('.art'); if (c) openArticle(c.dataset.id); } });

    // calculators (debounced server calls)
    var e1 = debounce(emiCalc, 120), r1 = debounce(restructureCalc, 120);
    bindRange('eAmt', inr, e1); bindRange('eRate', function (v) { return v.toFixed(1) + '%'; }, e1); bindRange('eMon', months, e1);
    bindRange('rOut', inr, r1); bindRange('rRate', function (v) { return v.toFixed(1) + '%'; }, r1);
    bindRange('rCur', months, r1); bindRange('rNew', months, r1);
    emiCalc(); restructureCalc();
  });
})();
