/* Admin console */
(function () {
  'use strict';
  var $ = ZD.$, esc = ZD.esc, token = '', items = [], statuses = [];
  try { token = sessionStorage.getItem('zd_admin') || ''; } catch (e) { }

  function auth() { return { Authorization: 'Bearer ' + token }; }
  function fmt(s) { try { return new Date(s).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }); } catch (e) { return s; } }
  var TYPES = { business: 'Business', case: 'Portfolio', borrower: 'Borrower', callback: 'Callback' };

  function show(on) { $('#loginBox').style.display = on ? 'none' : ''; $('#dash').style.display = on ? '' : 'none'; }

  function load() {
    ZD.api('/api/admin/enquiries', { headers: auth() }).then(function (d) {
      items = d.items; statuses = d.statuses; show(true);
      var fs = $('#fStatus');
      if (fs.options.length < 2) statuses.forEach(function (s) { fs.add(new Option(s, s)); });
      render();
    }).catch(function (e) {
      if (e.status === 401) { token = ''; try { sessionStorage.removeItem('zd_admin'); } catch (x) { } show(false); }
      else ZD.toast(e.message, true);
    });
  }

  function render() {
    var q = $('#fSearch').value.trim().toLowerCase(), t = $('#fType').value, s = $('#fStatus').value;
    var counts = { total: items.length, 'new': 0 };
    items.forEach(function (i) { if (i.status === 'Received') counts['new']++; });
    $('#mini').innerHTML =
      '<div class="mini"><b>' + counts.total + '</b><span>Total requests</span></div>' +
      '<div class="mini"><b>' + counts['new'] + '</b><span>New (Received)</span></div>' +
      Object.keys(TYPES).map(function (k) {
        return '<div class="mini"><b>' + items.filter(function (i) { return i.type === k; }).length + '</b><span>' + TYPES[k] + '</span></div>';
      }).join('');

    var list = items.filter(function (i) {
      if (t && i.type !== t) return false;
      if (s && i.status !== s) return false;
      return !q || JSON.stringify(i).toLowerCase().indexOf(q) > -1;
    });
    $('#rows').innerHTML = list.length ? list.map(function (i) {
      var det = [i.organisation, i.designation, i.serviceInterest, i.portfolioType, i.portfolioSize, i.accounts && (i.accounts + ' accounts'),
        i.loanType, i.lenderName, i.outstandingAmount && ('Rs ' + i.outstandingAmount), i.preferredTime].filter(Boolean).map(esc).join(' &bull; ');
      return '<tr><td><b>' + esc(i.ref) + '</b><div class="sub">' + esc(fmt(i.createdAt)) + '</div></td>' +
        '<td><span class="badge navy">' + esc(TYPES[i.type] || i.type) + '</span></td>' +
        '<td><b>' + esc(i.name) + '</b><div class="sub">' + esc(i.phone) + '</div><div class="sub">' + esc(i.email) + '</div></td>' +
        '<td style="max-width:360px">' + det + (i.message ? '<div class="sub" style="margin-top:.4rem">' + esc(i.message) + '</div>' : '') +
        (i.note ? '<div class="sub" style="margin-top:.4rem"><b>Note:</b> ' + esc(i.note) + '</div>' : '') + '</td>' +
        '<td><select class="status-sel" data-ref="' + esc(i.ref) + '">' + statuses.map(function (x) {
          return '<option' + (x === i.status ? ' selected' : '') + '>' + esc(x) + '</option>';
        }).join('') + '</select></td></tr>';
    }).join('') : '<tr><td colspan="5" style="text-align:center;padding:2.5rem;color:var(--muted)">No requests found.</td></tr>';
  }

  document.addEventListener('zd:ready', function () {
    $('#loginForm').addEventListener('submit', function (e) {
      e.preventDefault();
      ZD.api('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: $('#pw').value }) })
        .then(function (d) { token = d.token; try { sessionStorage.setItem('zd_admin', token); } catch (x) { } $('#pw').value = ''; load(); })
        .catch(function (err) { ZD.toast(err.message, true); });
    });
    $('#logoutBtn').addEventListener('click', function () { token = ''; try { sessionStorage.removeItem('zd_admin'); } catch (x) { } show(false); });
    ['fSearch', 'fType', 'fStatus'].forEach(function (id) { $('#' + id).addEventListener('input', render); });

    $('#rows').addEventListener('change', function (e) {
      var sel = e.target.closest('.status-sel'); if (!sel) return;
      var note = window.prompt('Optional note for this update (shown only to admins):', '') || '';
      ZD.api('/api/admin/status', { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, auth()), body: JSON.stringify({ ref: sel.dataset.ref, status: sel.value, note: note }) })
        .then(function () { ZD.toast('Status updated'); load(); })
        .catch(function (err) { ZD.toast(err.message, true); load(); });
    });

    $('#exportBtn').addEventListener('click', function () {
      fetch('/api/admin/export', { headers: auth() }).then(function (r) { if (!r.ok) throw new Error('Export failed'); return r.blob(); })
        .then(function (b) { var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'zerodebt-enquiries.csv'; document.body.appendChild(a); a.click(); a.remove(); })
        .catch(function (err) { ZD.toast(err.message, true); });
    });

    if (token) load(); else show(false);
  });
})();
