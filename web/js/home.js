/* Home page: loan-type marquee */
(function () {
  var loans = [
    ['user', 'Personal loans'], ['card', 'Credit cards'], ['car', 'Auto loans'], ['home', 'Home loans'],
    ['briefcase', 'Business loans'], ['store', 'MSME loans'], ['users', 'Microfinance'], ['doc', 'Education loans'],
    ['target', 'Gold loans'], ['bolt', 'Digital / BNPL loans'], ['layers', 'Loan against property'], ['globe', 'Consumer durable loans']
  ];
  document.addEventListener('zd:ready', function () {
    var t = document.getElementById('loanMarquee');
    if (!t) return;
    var html = loans.map(function (l) { return '<span>' + ZD.ic(l[0]) + l[1] + '</span>'; }).join('');
    t.innerHTML = html + html; // duplicated for seamless loop
  });
})();
