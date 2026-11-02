/* ============================================================
   engine.js - routing, retrieval and answer composition
 ------------------------------------------------------------
   Pipeline (mirrors prompts/system-prompt.md):
     1. PII gate - block before anything is read or stored
     2. Advice gate - opinion / recommendation / suitability
     3. Performance gate- returns, CAGR, projections
     4. Slot filling - resolve {scheme, plan, topic} from the query
     5. Retrieval - score the corpus, pick one passage
     6. Composition - <=3 sentences + exactly one citation + as-on date

   Every exit path returns exactly one source link. There is no
   path that produces an answer without a citation.
   ============================================================ */
(function (root) {
  'use strict';

  var C = (typeof require !== 'undefined' && typeof module !== 'undefined')
    ? require('./corpus.js')
    : { META: root.META, SOURCES: root.SOURCES, SCHEMES: root.SCHEMES, TOPICS: root.TOPICS, GENERAL: root.GENERAL, EDU: root.EDU };

  var MAX_SENTENCES = 3;

  /* ---------- helpers ---------- */
  function norm(s) {
    return String(s || '').toLowerCase().replace(/[\'\']/g, "'").replace(/\s+/g, ' ').trim();
  }
  function countSentences(t) {
    var m = String(t).trim().match(/[.!?](\s|$)/g);
    return m ? m.length : 1;
  }
  function src(id) { return C.SOURCES[id]; }

  /* ---------- 1. PII gate ---------------------------------- */
  var PII_RULES = [
    { k: 'PAN',            re: /\b[a-z]{5}[0-9]{4}[a-z]\b/i },
    { k: 'Aadhaar number', re: /\b\d{4}[ -]?\d{4}[ -]?\d{4}\b/ },
    { k: 'email address',  re: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i },
    { k: 'phone number',   re: /(^|[^\d])(\+?91[ -]?)?[6-9]\d{9}([^\d]|$)/ },
    { k: 'OTP',            re: /\botp\b[^\d]{0,12}\d{4,8}\b/i },
    { k: 'account number', re: /\b(a\/c|acc(ount)?|folio)\b[^\d]{0,10}\d{6,}\b/i }
  ];
  function detectPII(q) {
    for (var i = 0; i < PII_RULES.length; i++) {
      if (PII_RULES[i].re.test(q)) return PII_RULES[i].k;
    }
    return null;
  }

  /* ---------- 2. Advice gate ------------------------------- */
  /* Literal phrases. NOTE: a bare 'invest in' is deliberately NOT here -
     "can I invest in X with 100 rupees" is a factual minimums question. */
  var ADVICE = [
    'should i', 'shall i', 'should we', 'do you recommend', 'recommend', 'suggest',
    'which is better', 'which one is better', 'worth investing', 'worth it',
    'safe to invest', 'good time', 'right time', 'must buy',
    'switch to', 'exit now', 'hold or sell', 'buy or sell',
    'suitable for me', 'good for me', 'what should i', 'advise', 'advice', 'opinion',
    'which fund should', 'where should i invest', 'help me choose', 'what do you think'
  ];

  /* Patterns catch the shapes a literal list keeps missing:
       "is axis elss good" -> "is <anything> good"
       "top performing axis fund" -> "<top|best> performing"
       "best scheme for me" -> "<good|best> <fund|scheme>"            */
  var ADVICE_RE = [
    { k: 'is-X-good',        re: /\bis\s+[^?.!]{0,45}\b(good|better|best|safe|worth|suitable|reliable)\b/ },
    { k: 'good-fund',        re: /\b(good|best|better|top|ideal|right)\s+(fund|scheme|option|choice|investment|plan)\b/ },
    { k: 'top-performing',   re: /\b(top|best|highest|strongest)[\s-]*(performing|performer)\b/ },
    { k: 'should-i',         re: /\bshould\s+(i|we)\b/ },
    { k: 'which-fund-to',    re: /\b(which|what)\s+(fund|scheme)\s+(should|to|is)\b/ }
  ];

  function detectAdvice(q) {
    for (var i = 0; i < ADVICE.length; i++) if (q.indexOf(ADVICE[i]) > -1) return ADVICE[i];
    for (var j = 0; j < ADVICE_RE.length; j++) if (ADVICE_RE[j].re.test(q)) return ADVICE_RE[j].k;
    return null;
  }

  /* ---------- 3. Performance gate -------------------------- */
  var PERF = [
    'return', 'returns', 'cagr', 'xirr', 'past performance', 'performance',
    'how much profit', 'how much will i', 'how much can i', 'will i earn', 'will i get',
    'doubled', 'double my', 'growth rate', 'annualised', 'annualized', 'outperform',
    'beat the market', 'how much gain', 'profit',
    'nav history', 'historical nav', 'track record', 'how has it done',
    'perform'   /* stem: covers perform / performed / performing / performance */
  ];
  function detectPerformance(q) {
    /* 'capital gains statement' is a document request, not a performance claim */
    if (q.indexOf('statement') > -1) return null;
    for (var i = 0; i < PERF.length; i++) if (q.indexOf(PERF[i]) > -1) return PERF[i];
    return null;
  }

  /* ---------- 3b. wrong-AMC guard --------------------------
     Without this, "expense ratio of HDFC Flexi Cap?" matches the alias
     "flexi cap" and answers with the AXIS figure under an Axis citation
 - a confidently wrong answer, the worst failure mode for a facts bot.
     Naming any AMC other than Axis must fall out of scope.            */
  var OTHER_AMCS = [
    'hdfc', 'sbi', 'icici', 'nippon', 'kotak', 'mirae', 'parag parikh', 'ppfas',
    'quant', 'uti', 'tata', 'dsp', 'franklin', 'aditya birla', 'birla', 'canara',
    'invesco', 'edelweiss', 'motilal', 'bandhan', 'baroda', 'hsbc', 'navi',
    'jm financial', 'ltmf', 'sundaram', 'whiteoak', 'zerodha', 'groww mutual',
    'union mutual', 'pgim', 'mahindra', 'iti mutual', 'shriram', 'trust mutual',
    'bajaj finserv', 'helios', 'samco', 'nj mutual', 'taurus', 'quantum'
  ];
  function detectOtherAMC(q) {
    for (var i = 0; i < OTHER_AMCS.length; i++) if (q.indexOf(OTHER_AMCS[i]) > -1) return OTHER_AMCS[i];
    return null;
  }

  /* ---------- 4. slot filling ------------------------------ */
  function detectScheme(q) {
    var best = null, bestLen = 0;
    for (var i = 0; i < C.SCHEMES.length; i++) {
      var s = C.SCHEMES[i];
      for (var j = 0; j < s.aliases.length; j++) {
        var a = s.aliases[j];
        if (q.indexOf(a) > -1 && a.length > bestLen) { best = s; bestLen = a.length; }
      }
    }
    return best;
  }
  function detectTopic(q) {
    var best = null, bestLen = 0;
    for (var t in C.TOPICS) {
      if (!Object.prototype.hasOwnProperty.call(C.TOPICS, t)) continue;
      var keys = C.TOPICS[t];
      for (var i = 0; i < keys.length; i++) {
        if (q.indexOf(keys[i]) > -1 && keys[i].length > bestLen) { best = t; bestLen = keys[i].length; }
      }
    }
    return best;
  }
  function detectPlan(q) {
    if (q.indexOf('direct') > -1) return 'direct';
    if (q.indexOf('regular') > -1) return 'regular';
    return null;
  }

  /* ---------- 5/6. scheme-level composition ---------------- */
  var SCHEME_TOPICS = {
    expense_ratio: 1, exit_load: 1, min_sip: 1, min_lumpsum: 1, lock_in: 1,
    riskometer: 1, benchmark: 1, aum: 1, inception: 1, fund_manager: 1, category: 1
  };

  function schemeAnswer(s, topic, explicitPlan, effPlan) {
    var p = effPlan || explicitPlan || 'regular';
    var sid = s.src[p];
    var planWord = (p === 'direct') ? 'Direct Plan' : 'Regular Plan';
    var other = (p === 'direct') ? 'Regular' : 'Direct';
    var planNote = explicitPlan ? '' : ' (' + planWord + ' - ask for the ' + other + ' Plan if you need that figure.)';

    switch (topic) {
      case 'expense_ratio':
        return { text: 'The total expense ratio of ' + s.name + ' - ' + planWord + ' is ' + s.ter[p] + ', as disclosed on the scheme page.' + planNote, sid: sid, asOn: C.META.schemeFactsAsOn };
      case 'exit_load':
        return { text: s.exitLoadText, sid: sid, asOn: C.META.schemeFactsAsOn };
      case 'min_sip':
        return { text: 'The minimum monthly SIP for ' + s.name + ' is ' + s.minSip + ', as listed in the scheme\'s minimum investment table.', sid: sid, asOn: C.META.schemeFactsAsOn };
      case 'min_lumpsum':
        return { text: 'The minimum lumpsum investment for ' + s.name + ' is ' + s.minLumpsum + ', as listed in the scheme\'s minimum investment table.', sid: sid, asOn: C.META.schemeFactsAsOn };
      case 'lock_in':
        return s.lockIn
          ? { text: s.name + ' carries a statutory lock-in of ' + s.lockIn + ', so units cannot be redeemed or switched out before that period ends.', sid: sid, asOn: C.META.schemeFactsAsOn }
          : { text: s.name + ' is an open ended scheme with no lock-in period; only ' + 'ELSS schemes carry the statutory 3-year lock-in.', sid: sid, asOn: C.META.schemeFactsAsOn };
      case 'riskometer':
        return { text: 'The riskometer for ' + s.name + ' is marked ' + s.riskometer + ' on the scheme page. SEBI requires this rating to be reviewed periodically, so check the page for the current reading.', sid: sid, asOn: C.META.schemeFactsAsOn };
      case 'benchmark':
        return { text: 'The benchmark for ' + s.name + ' is ' + s.benchmark + ', as stated on the scheme page.', sid: sid, asOn: C.META.schemeFactsAsOn };
      case 'aum':
        return s.aum
          ? { text: 'The AUM of ' + s.name + ' is ' + s.aum + ' as on ' + s.aumAsOn + ', per the scheme page.', sid: sid, asOn: s.aumAsOn }
          : null;
      case 'inception':
        return s.inception
          ? { text: s.name + ' has been in existence since ' + s.inception + ', per the scheme page.', sid: sid, asOn: C.META.schemeFactsAsOn }
          : null;
      case 'fund_manager':
        return s.managers
          ? { text: s.name + ' is managed by ' + s.managers + ', per the scheme page.', sid: sid, asOn: C.META.schemeFactsAsOn }
          : null;
      case 'category':
        return { text: s.name + ' is categorised as a ' + s.category + ' - ' + s.categoryText + '.', sid: sid, asOn: C.META.schemeFactsAsOn };
      default:
        return null;
    }
  }

  function generalAnswer(topic, q) {
    var best = null, bestScore = 0;
    for (var i = 0; i < C.GENERAL.length; i++) {
      var g = C.GENERAL[i], score = 0;
      if (g.topic === topic) score += 2;
      for (var j = 0; j < g.keys.length; j++) {
        if (q.indexOf(g.keys[j]) > -1) score += 3 + (g.keys[j].length / 100);
      }
      if (score > bestScore) { bestScore = score; best = g; }
    }
    return (best && bestScore >= 2) ? best : null;
  }

  /* ---------- public API ----------------------------------- */
  function ask(rawQuery, opts) {
    var q = norm(rawQuery);
    opts = opts || {};
    /* Settings can change which plan is assumed when the user doesn't say. */
    var prefPlan = (opts.defaultPlan === 'direct') ? 'direct' : 'regular';

    if (!q) {
      return {
        kind: 'clarify',
        text: 'Ask me a factual question about one of the four Axis schemes in scope - for example its expense ratio, exit load, minimum SIP or benchmark.',
        source: C.EDU.scope, asOn: C.META.compiledOn, slots: {}
      };
    }

    /* 1. PII - checked first, and the query is never echoed back */
    var pii = detectPII(rawQuery);
    if (pii) {
      return {
        kind: 'refusal_pii',
        text: 'It looks like that message contains a ' + pii + ', so I have not stored or processed it. Please never share PAN, Aadhaar, folio or account numbers, OTPs, email or phone numbers here. Ask the question without any personal details and I will answer it.',
        source: C.EDU.pii, asOn: C.META.compiledOn, slots: { pii: pii }
      };
    }

    /* 2. Advice */
    var adv = detectAdvice(q);
    if (adv) {
      return {
        kind: 'refusal_advice',
        text: 'I can only share published facts, so I cannot tell you what to buy, sell, hold or switch, or which scheme suits you. Ask me a factual question instead - expense ratio, exit load, minimum SIP, lock-in, riskometer or benchmark. For general investor education, the AMFI link below is a good starting point.',
        source: C.EDU.advice, asOn: C.META.compiledOn, slots: { trigger: adv }
      };
    }

    /* 3. Performance */
    var perf = detectPerformance(q);
    if (perf) {
      return {
        kind: 'refusal_performance',
        text: 'I do not quote, calculate or compare scheme returns, and I cannot project future gains. Past and current performance is published in the official monthly factsheet, linked below. I can still answer factual questions such as expense ratio, exit load, lock-in or benchmark.',
        source: C.EDU.performance, asOn: C.META.compiledOn, slots: { trigger: perf }
      };
    }

    /* 3b. another fund house named - never answer with an Axis figure */
    var amc = detectOtherAMC(q);
    if (amc) {
      return {
        kind: 'out_of_scope',
        text: 'I only hold figures for four Axis Mutual Fund schemes, so I cannot answer for another fund house - and I will not substitute an Axis number in its place. Check that AMC\'s own scheme page, or ask me the same question about Axis Large Cap, Flexi Cap, ELSS Tax Saver or Mid Cap.',
        source: C.EDU.general, asOn: C.META.compiledOn, slots: { otherAMC: amc }
      };
    }

    /* 4. slots */
    var scheme = detectScheme(q);
    var topic = detectTopic(q);
    var plan = detectPlan(q);

    /* 5a. scheme + topic */
    if (scheme && topic && SCHEME_TOPICS[topic]) {
      var effPlan = plan || prefPlan;
      var a = schemeAnswer(scheme, topic, plan, effPlan);
      if (a) {
        return {
          kind: 'fact', text: a.text, source: src(a.sid), asOn: a.asOn,
          slots: { scheme: scheme.name, topic: topic, plan: effPlan }
        };
      }
      return {
        kind: 'out_of_scope',
        text: 'That particular detail is not published on the scheme page I have indexed for ' + scheme.name + '. The official scheme page linked below carries the full set of disclosures.',
        source: src(scheme.src[effPlan]), asOn: C.META.schemeFactsAsOn,
        slots: { scheme: scheme.name, topic: topic }
      };
    }

    /* 5b. general knowledge */
    var g = generalAnswer(topic, q);
    if (g) {
      return {
        kind: 'fact', text: g.answer, source: src(g.src), asOn: g.asOn,
        slots: { topic: g.topic, general: true }
      };
    }

    /* 5c. scheme-specific topic but no scheme named */
    if (topic && SCHEME_TOPICS[topic]) {
      return {
        kind: 'clarify',
        text: 'Which scheme do you mean? I cover Axis Large Cap Fund, Axis Flexi Cap Fund, Axis ELSS Tax Saver Fund and Axis Mid Cap Fund. Name one and I will give you that figure with its source.',
        source: C.EDU.scope, asOn: C.META.compiledOn, slots: { topic: topic }
      };
    }

    /* 5d. scheme named, topic unclear */
    if (scheme) {
      return {
        kind: 'clarify',
        text: 'I have ' + scheme.name + ' in scope - which fact do you need? I can give you its expense ratio, exit load, minimum SIP or lumpsum, benchmark, riskometer or category.',
        source: src(scheme.src.regular), asOn: C.META.schemeFactsAsOn,
        slots: { scheme: scheme.name }
      };
    }

    /* 5e. the AMC is named but nothing else resolved - steer, don't dead-end */
    if (q.indexOf('axis') > -1) {
      return {
        kind: 'clarify',
        text: 'I cover four Axis schemes: Large Cap, Flexi Cap, ELSS Tax Saver and Mid Cap. Name one along with the fact you need - expense ratio, exit load, minimum SIP, lock-in, riskometer or benchmark.',
        source: C.EDU.scope, asOn: C.META.compiledOn, slots: { amc: 'Axis Mutual Fund' }
      };
    }

    /* 6. out of corpus */
    return {
      kind: 'out_of_scope',
      text: 'That is outside the small corpus I was given, which covers four Axis Mutual Fund equity schemes plus SEBI, AMFI and registrar pages. I will not guess at an answer I cannot cite. The AMFI investor education site linked below is the right place for broader questions.',
      source: C.EDU.general, asOn: C.META.compiledOn, slots: {}
    };
  }

  var API = {
    ask: ask,
    countSentences: countSentences,
    detectPII: detectPII,
    MAX_SENTENCES: MAX_SENTENCES
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else root.Engine = API;
})(typeof window !== 'undefined' ? window : globalThis);
