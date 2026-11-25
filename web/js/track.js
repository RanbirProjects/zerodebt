/* Track page */
(function () {
  'use strict';
  var $ = ZD.$, esc = ZD.esc;
  var MSG = {
    'Received': 'We have received your request. A team member will review it shortly.',
    'Under Review': 'Our team is reviewing the details you shared.',
    'Contacted': 'We have reached out to you. Please check your phone or email.',
    'In Progress': 'Your request is being actively worked on.',
    'Resolved': 'Your request has been resolved. Thank you for choosing Zerodebt Solution.',
    'Closed': 'This request is closed. Contact us if you need anything further.'
  };
  var TYPES = { business: 'Business enquiry', case: 'Portfolio submission', borrower: 'Borrower assistance', callback: 'Callback request' };
  function fmt(s) { try { return new Date(s).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }); } catch (e) { return s; } }

  document.addEventListener('zd:ready', function () {
    var form = $('#trackForm');
    var p = new URLSearchParams(location.search);
    if (p.get('ref')) $('#tRef').value = p.get('ref');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ref = $('#tRef').value.trim(), last = $('#tLast').value.trim();
      if (!ref || !/^\d{4}$/.test(last)) { ZD.toast('Enter the reference ID and exactly 4 digits.', true); return; }
      var btn = form.querySelector('button'); btn.disabled = true;
      ZD.api('/api/track?ref=' + encodeURIComponent(ref) + '&last4=' + encodeURIComponent(last))
        .then(function (d) {
          $('#rRef').textContent = d.ref; $('#rType').textContent = TYPES[d.type] || d.type;
          $('#rCreated').textContent = fmt(d.createdAt); $('#rUpdated').textContent = fmt(d.updatedAt);
          var idx = d.steps.indexOf(d.status);
          $('#stepper').innerHTML = '<div class="fill" id="fill"></div>' + d.steps.map(function (s, i) {
            return '<div class="st ' + (i < idx ? 'done' : i === idx ? 'cur' : '') + '"><i>' + (i < idx ? ZD.ic('check') : i + 1) + '</i>' + esc(s) + '</div>';
          }).join('');
          $('#stMsg').innerHTML = ZD.ic('clock') + '<div><b>' + esc(d.status) + '.</b> ' + esc(MSG[d.status] || '') + '</div>';
          $('#trackResult').style.display = 'block';
          setTimeout(function () { var f = $('#fill'); if (f) f.style.width = (idx / (d.steps.length - 1) * 90) + '%'; }, 50);
        })
        .catch(function (err) { $('#trackResult').style.display = 'none'; ZD.toast(err.message, true); })
        .then(function () { btn.disabled = false; });
    });
  });
})();
