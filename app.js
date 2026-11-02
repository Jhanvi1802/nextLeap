/* ============================================================
   app.js — UI shell: mock sign-in, navigation, chat, sources, settings
   The answering logic lives in engine.js; this file only presents it.
   Nothing here makes a network request. Settings persist in
   localStorage, wrapped in try/catch so private mode degrades cleanly.
   ============================================================ */
(function () {
  'use strict';

  var E = window.Engine;
  var KEY = 'mff.settings.v1';

  var DEFAULTS = {
    name: '',
    defaultPlan: 'regular',
    citation: 'title',
    theme: 'system',
    compact: false
  };
  var S = load();

  function load() {
    var out = {};
    for (var k in DEFAULTS) if (DEFAULTS.hasOwnProperty(k)) out[k] = DEFAULTS[k];
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var p = JSON.parse(raw);
        for (var j in DEFAULTS) if (DEFAULTS.hasOwnProperty(j) && p[j] !== undefined) out[j] = p[j];
      }
    } catch (e) { /* private mode or blocked storage — defaults are fine */ }
    return out;
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
  }

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  /* ---------------- theme ---------------- */
  function applyTheme() {
    var r = document.documentElement;
    if (S.theme === 'system') r.removeAttribute('data-theme');
    else r.setAttribute('data-theme', S.theme);
    document.body.style.fontSize = S.compact ? '14px' : '';
  }
  applyTheme();

  /* ---------------- sign in ---------------- */
  /* The brief forbids collecting email / phone / PAN. The name box is
     guarded by the same PII detector the assistant uses, so the rule is
     enforced at the door, not just in conversation. */
  function startSession(name) {
    S.name = name || '';
    save();
    $('signin').style.display = 'none';
    $('app').classList.add('on');
    var who = S.name ? S.name : 'there';
    $('greet').textContent = 'Hi ' + who;
    $('avatar').textContent = (S.name ? S.name.trim().charAt(0) : 'G').toUpperCase();
    $('avatar').title = S.name ? ('Signed in as ' + S.name) : 'Signed in as guest';
    buildSources();
    buildSettings();
  }

  $('btnStart').addEventListener('click', function () {
    var v = $('dname').value.trim();
    var err = $('autherr');
    var bad = v ? E.detectPII(v) : null;
    if (bad) {
      err.textContent = 'That looks like a ' + bad + '. This prototype never takes one — use a first name, or continue as guest.';
      err.hidden = false;
      return;
    }
    err.hidden = true;
    startSession(v);
  });
  $('btnGuest').addEventListener('click', function () { startSession(''); });
  $('dname').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); $('btnStart').click(); }
  });

  /* ---------------- navigation ---------------- */
  var tabs = document.querySelectorAll('.tab');
  Array.prototype.forEach.call(tabs, function (t) {
    t.addEventListener('click', function () {
      Array.prototype.forEach.call(tabs, function (x) { x.classList.remove('on'); });
      t.classList.add('on');
      ['chat', 'sources', 'settings'].forEach(function (s) {
        $('s-' + s).classList.toggle('on', s === t.dataset.screen);
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
  $('avatar').addEventListener('click', function () {
    document.querySelector('.tab[data-screen="settings"]').click();
  });

  /* ---------------- chat ---------------- */
  var TAGS = {
    fact: 'Fact · cited',
    clarify: 'Needs one more detail',
    out_of_scope: 'Outside my sources',
    refusal_advice: 'Refused · advice',
    refusal_performance: 'Refused · performance',
    refusal_pii: 'Blocked · personal data'
  };

  function render(res) {
    var cls = 'card';
    if (res.kind === 'refusal_pii') cls += ' pii';
    else if (res.kind.indexOf('refusal') === 0) cls += ' refuse';

    var card = el('div', cls);
    card.appendChild(el('span', 'tag', TAGS[res.kind] || res.kind));
    card.appendChild(el('p', 'atext', res.text));

    var cite = el('div', 'cite');
    cite.appendChild(el('span', 'lbl', 'Source: '));
    var a = el('a', null, S.citation === 'url' ? res.source.u : res.source.t);
    a.href = res.source.u;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    cite.appendChild(a);
    card.appendChild(cite);

    card.appendChild(el('div', 'stamp', 'Last updated from sources: ' + res.asOn));
    $('log').appendChild(card);
    card.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }

  function ask(text) {
    if (!text || !text.trim()) return;
    $('log').appendChild(el('div', 'msg u', text));
    render(E.ask(text, { defaultPlan: S.defaultPlan }));
  }

  $('form').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = $('q').value;
    $('q').value = '';
    ask(v);
  });
  ['examples', 'refusals'].forEach(function (id) {
    $(id).addEventListener('click', function (e) {
      var b = e.target.closest('.chip');
      if (b) ask(b.textContent);
    });
  });

  /* ---------------- sources screen ---------------- */
  function publisherOf(url) {
    if (url.indexOf('axismf.com') > -1) return 'Axis Mutual Fund (AMC)';
    if (url.indexOf('sebi.gov.in') > -1) return 'SEBI (regulator)';
    if (url.indexOf('amfiindia.com') > -1 || url.indexOf('mutualfundssahihai.com') > -1) return 'AMFI (industry body)';
    return 'Registrars (CAMS / KFintech / MF Central)';
  }
  function buildSources() {
    var host = $('srclist');
    if (host.childNodes.length) return;
    var ids = Object.keys(window.SOURCES);
    $('srccount').textContent = String(ids.length);

    var groups = {};
    ids.forEach(function (id) {
      var g = publisherOf(window.SOURCES[id].u);
      (groups[g] = groups[g] || []).push(id);
    });
    ['Axis Mutual Fund (AMC)', 'SEBI (regulator)', 'AMFI (industry body)', 'Registrars (CAMS / KFintech / MF Central)']
    .forEach(function (g) {
      if (!groups[g]) return;
      var box = el('div', 'srcgroup');
      box.appendChild(el('h3', null, g + ' · ' + groups[g].length));
      groups[g].forEach(function (id) {
        var s = window.SOURCES[id];
        var a = el('a', 'srcitem');
        a.href = s.u; a.target = '_blank'; a.rel = 'noopener noreferrer';
        a.appendChild(el('div', 'sid', id));
        a.appendChild(el('div', 'st', s.t));
        a.appendChild(el('div', 'su', s.u));
        box.appendChild(a);
      });
      host.appendChild(box);
    });
  }

  /* ---------------- settings screen ---------------- */
  function section(title) {
    var s = el('section', 'sec');
    s.appendChild(el('h3', null, title));
    return s;
  }
  function row(title, desc, ctl) {
    var r = el('div', 'row');
    var m = el('div', 'meta');
    m.appendChild(el('div', 'rt', title));
    if (desc) m.appendChild(el('div', 'rd', desc));
    r.appendChild(m);
    if (ctl) { var c = el('div', 'ctl'); c.appendChild(ctl); r.appendChild(c); }
    return r;
  }
  function segment(options, current, onPick) {
    var wrap = el('div', 'seg');
    options.forEach(function (o) {
      var b = el('button', current === o.v ? 'on' : '', o.t);
      b.type = 'button';
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(wrap.children, function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        onPick(o.v);
      });
      wrap.appendChild(b);
    });
    return wrap;
  }
  function toggle(on, locked, onFlip) {
    var b = el('button', 'sw' + (on ? ' on' : '') + (locked ? ' lock' : ''));
    b.type = 'button';
    b.setAttribute('role', 'switch');
    b.setAttribute('aria-checked', on ? 'true' : 'false');
    if (locked) { b.disabled = true; b.title = 'Always on — this defines the product'; }
    else b.addEventListener('click', function () {
      var now = !b.classList.contains('on');
      b.classList.toggle('on', now);
      b.setAttribute('aria-checked', now ? 'true' : 'false');
      onFlip(now);
    });
    return b;
  }

  function buildSettings() {
    var host = $('setbody');
    host.innerHTML = '';

    /* --- Answering --- */
    var a = section('Answering');
    a.appendChild(row(
      'Default plan',
      'Which plan to quote when you don’t say. Regular and Direct have different expense ratios — Axis Large Cap is 1.76% regular vs 0.92% direct.',
      segment([{ t: 'Regular', v: 'regular' }, { t: 'Direct', v: 'direct' }], S.defaultPlan,
        function (v) { S.defaultPlan = v; save(); })
    ));
    a.appendChild(row(
      'Citation style',
      'Show the page title, or the full URL, next to every answer.',
      segment([{ t: 'Title', v: 'title' }, { t: 'Full URL', v: 'url' }], S.citation,
        function (v) { S.citation = v; save(); })
    ));
    a.appendChild(row('Answer length', 'Capped at 3 sentences. Fixed by the product spec.', el('span', 'lockchip', '3 max')));
    a.appendChild(row('Show source date', 'Every answer ends with the source page’s own as-on date.', el('span', 'lockchip', 'Always')));
    host.appendChild(a);

    /* --- Safety --- */
    var sf = section('Safety — always on');
    [
      ['Facts-only mode', 'No recommendations, rankings or suitability. Buy/sell/hold/"which is better" questions are refused.'],
      ['No performance claims', 'Returns, CAGR, XIRR, NAV history and projections are refused and pointed at the official factsheet.'],
      ['Personal data blocking', 'PAN, Aadhaar, phone, email, folio and OTP patterns are blocked before anything is read, and never echoed back.'],
      ['Source-grounded answers only', 'No reply is produced without exactly one citation from the indexed corpus — refusals included.']
    ].forEach(function (p) { sf.appendChild(row(p[0], p[1], toggle(true, true))); });
    host.appendChild(sf);

    /* --- Appearance --- */
    var ap = section('Appearance');
    ap.appendChild(row('Theme', 'Follow your device, or pick one.',
      segment([{ t: 'System', v: 'system' }, { t: 'Light', v: 'light' }, { t: 'Dark', v: 'dark' }], S.theme,
        function (v) { S.theme = v; save(); applyTheme(); })));
    ap.appendChild(row('Compact text', 'Slightly smaller type for denser reading.',
      toggle(S.compact, false, function (v) { S.compact = v; save(); applyTheme(); })));
    host.appendChild(ap);

    /* --- Privacy --- */
    var pv = section('Privacy & data');
    pv.appendChild(row('Account', S.name ? ('Signed in as ' + S.name + ' — a display name only, stored in this browser.') : 'Signed in as guest. No account exists.', el('span', 'lockchip', S.name ? 'Local' : 'Guest')));
    pv.appendChild(row('Network calls', 'None. The corpus and the engine ship with the page; your question never leaves the browser.', el('span', 'lockchip', 'Zero')));
    pv.appendChild(row('What is stored', 'Your display name and these settings, in localStorage. No conversation history is persisted.', el('span', 'lockchip', 'Local only')));
    var clr = el('button', 'btn ghost', 'Clear conversation');
    clr.type = 'button';
    clr.style.width = 'auto'; clr.style.margin = '0'; clr.style.padding = '8px 14px'; clr.style.fontSize = '13px';
    clr.addEventListener('click', function () {
      $('log').innerHTML = '';
      document.querySelector('.tab[data-screen="chat"]').click();
    });
    pv.appendChild(row('Clear conversation', 'Wipe the current thread from the screen.', clr));
    var rst = el('button', 'btn ghost', 'Reset settings');
    rst.type = 'button';
    rst.style.width = 'auto'; rst.style.margin = '0'; rst.style.padding = '8px 14px'; rst.style.fontSize = '13px';
    rst.addEventListener('click', function () {
      try { localStorage.removeItem(KEY); } catch (e) {}
      S = load(); applyTheme(); buildSettings();
    });
    pv.appendChild(row('Reset settings', 'Restore every option on this page to its default.', rst));
    host.appendChild(pv);

    /* --- Corpus --- */
    var cp = section('Corpus');
    var n = Object.keys(window.SOURCES).length;
    cp.appendChild(row('Indexed sources', n + ' official pages — Axis Mutual Fund, SEBI, AMFI and the registrars. No blogs or aggregators.', el('span', 'lockchip', n + ' pages')));
    cp.appendChild(row('Schemes in scope', 'Axis Large Cap, Axis Flexi Cap, Axis ELSS Tax Saver and Axis Mid Cap — each in Regular and Direct plans.', el('span', 'lockchip', '4 schemes')));
    cp.appendChild(row('Figures as on', 'Scheme figures were read from the official pages on this date and are stated with every answer.', el('span', 'lockchip', window.META.schemeFactsAsOn)));
    var br = el('button', 'btn ghost', 'Browse all sources');
    br.type = 'button';
    br.style.width = 'auto'; br.style.margin = '0'; br.style.padding = '8px 14px'; br.style.fontSize = '13px';
    br.addEventListener('click', function () { document.querySelector('.tab[data-screen="sources"]').click(); });
    cp.appendChild(row('Source list', 'Open every indexed page and check any figure yourself.', br));
    host.appendChild(cp);

    /* --- About --- */
    var ab = section('About');
    var txt = el('div', 'about');
    txt.innerHTML =
      '<b>Mutual Fund Facts</b> — a facts-only FAQ assistant. Built as a product case study for ' +
      '<b>Groww</b>; the indexed corpus is <b>Axis Mutual Fund</b> plus SEBI, AMFI and registrar pages.' +
      '<br><br><b>Disclaimer.</b> This is a student case-study prototype built for a product-management ' +
      'assignment. It is <b>not</b> affiliated with, endorsed by, or an official product of Groww or Axis ' +
      'Mutual Fund. It provides published facts only and does <b>not</b> constitute investment advice, a ' +
      'recommendation, or an offer to buy or sell any security. Figures are reproduced from official pages ' +
      'on the dates shown and change over time — always confirm on the linked source before acting. Mutual ' +
      'fund investments are subject to market risks; read all scheme related documents carefully.';
    ab.appendChild(txt);
    ab.appendChild(row('Version', 'Corpus compiled ' + window.META.compiledOn + '.', el('span', 'lockchip', 'v1.0')));
    host.appendChild(ab);
  }
})();
