/* ============================================================
   tests/eval.js - automated conformance check
   Run:  node tests/eval.js      (from the project root)

   Asserts the constraints the milestone brief sets out:
 - every answer is <= 3 sentences
 - every answer carries exactly one citation, with a real URL
 - every cited URL exists in sources.csv
 - advice / performance / PII questions are refused, with a link
 - refusals never echo the user's PII back
   ============================================================ */
var fs = require('fs');
var path = require('path');

var ROOT = path.join(__dirname, '..');
var E = require(path.join(ROOT, 'engine.js'));
var C = require(path.join(ROOT, 'corpus.js'));

/* ---- the set of URLs declared in sources.csv ---- */
var csv = fs.readFileSync(path.join(ROOT, 'sources.csv'), 'utf8').split(/\r?\n/).slice(1);
var declared = {};
csv.forEach(function (line) {
  var m = line.match(/(https?:\/\/[^,]+)/);
  if (m) declared[m[1].trim()] = true;
});

var pass = 0, fail = 0, notes = [];
function ok(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; notes.push('FAIL  ' + name + (extra ? '  [' + extra + ']' : '')); }
}

/* ---------- universal invariants over a broad query set ---------- */
var ALL_QUERIES = [
  'Expense ratio of Axis Large Cap Fund?',
  'What is the expense ratio of Axis Flexi Cap direct plan?',
  'Axis ELSS Tax Saver expense ratio',
  'Axis Mid Cap fund expense ratio direct',
  'ELSS lock-in?',
  'What is the lock in for Axis ELSS Tax Saver Fund?',
  'Minimum SIP for Axis Large Cap Fund?',
  'Minimum SIP for Axis ELSS Tax Saver Fund?',
  'Exit load of Axis Mid Cap Fund?',
  'Exit load on Axis Flexi Cap Fund',
  'What is the benchmark of Axis Large Cap Fund?',
  'Riskometer of Axis Mid Cap Fund?',
  'How do I download my capital gains statement?',
  'How to get a consolidated account statement?',
  'What is a riskometer?',
  'What is expense ratio?',
  'What is exit load?',
  'What is ELSS?',
  'Difference between direct and regular plan',
  'Where can I find the SID?',
  'Where is the factsheet?',
  'Who manages Axis Large Cap Fund?',
  'AUM of Axis Mid Cap Fund',
  'When was Axis Large Cap Fund launched?',
  'What category is Axis Flexi Cap Fund?',
  'Should I buy Axis ELSS Tax Saver Fund?',
  'Which is better, Axis Large Cap or Axis Mid Cap?',
  'What returns will I get from Axis Flexi Cap Fund?',
  'What is the 3 year CAGR of Axis Mid Cap?',
  'My PAN is ABCDE1234F, what is my balance?',
  'Call me on 9876543210',
  'my email is someone@example.com',
  'What is the weather in Mumbai?',
  'Tell me about Bitcoin',
  ''
];

ALL_QUERIES.forEach(function (q) {
  var r = E.ask(q);
  var label = JSON.stringify(q.slice(0, 44));

  ok('<=3 sentences ' + label, E.countSentences(r.text) <= 3,
     E.countSentences(r.text) + ' sentences');
  ok('has a citation ' + label, !!(r.source && r.source.u && r.source.t));
  ok('citation is a real declared source ' + label,
     !!(r.source && declared[r.source.u]), r.source && r.source.u);
  ok('has an as-on date ' + label, !!r.asOn);
  ok('no advice verbs leaked ' + label,
     !/\byou should (buy|sell|invest)\b/i.test(r.text));
});

/* ---------- routing correctness ---------- */
function kindOf(q) { return E.ask(q).kind; }

ok('advice -> refusal_advice (should I buy)', kindOf('Should I buy Axis ELSS Tax Saver Fund?') === 'refusal_advice');
ok('advice -> refusal_advice (which is better)', kindOf('Which is better, Axis Large Cap or Axis Mid Cap?') === 'refusal_advice');
ok('advice -> refusal_advice (is it safe)', kindOf('Is it safe to invest in Axis Mid Cap Fund?') === 'refusal_advice');
ok('performance -> refusal_performance (returns)', kindOf('What returns will I get from Axis Flexi Cap Fund?') === 'refusal_performance');
ok('performance -> refusal_performance (CAGR)', kindOf('What is the 3 year CAGR of Axis Mid Cap?') === 'refusal_performance');
ok('PII -> refusal_pii (PAN)', kindOf('My PAN is ABCDE1234F') === 'refusal_pii');
ok('PII -> refusal_pii (phone)', kindOf('Call me on 9876543210') === 'refusal_pii');
ok('PII -> refusal_pii (email)', kindOf('my email is someone@example.com') === 'refusal_pii');
ok('PII -> refusal_pii (aadhaar)', kindOf('aadhaar 1234 5678 9012') === 'refusal_pii');
ok('out of corpus -> out_of_scope', kindOf('What is the weather in Mumbai?') === 'out_of_scope');

/* Another fund house must never be answered with an Axis figure.
   Regression guard: "HDFC Flexi Cap" once matched the alias "flexi cap"
   and returned the Axis TER under an Axis citation. */
['Expense ratio of HDFC Flexi Cap Fund?',
 'SBI Bluechip minimum SIP?',
 'What is the exit load on ICICI Prudential Mid Cap?',
 'Nippon India Large Cap benchmark',
 'Kotak Flexi Cap riskometer'].forEach(function (q) {
  var r = E.ask(q);
  ok('wrong-AMC declined: ' + JSON.stringify(q.slice(0, 34)), r.kind === 'out_of_scope', r.kind);
  ok('wrong-AMC quotes no Axis number: ' + JSON.stringify(q.slice(0, 28)),
     !/\d+\.\d+%/.test(r.text), r.text.slice(0, 50));
});
ok('"performed" is treated as a performance question',
   E.ask('How has Axis Large Cap performed?').kind === 'refusal_performance');

/* the trap: "capital gains statement" must NOT trip the performance gate */
ok('capital gains STATEMENT is a fact, not a perf refusal',
   kindOf('How do I download my capital gains statement?') === 'fact',
   kindOf('How do I download my capital gains statement?'));

/* PII must never be echoed back to the user */
var piiEcho = E.ask('My PAN is ABCDE1234F, what is my balance?');
ok('PII refusal does not echo the PAN', piiEcho.text.indexOf('ABCDE1234F') === -1);
var phoneEcho = E.ask('Call me on 9876543210');
ok('PII refusal does not echo the phone number', phoneEcho.text.indexOf('9876543210') === -1);

/* ---------- factual accuracy against the verified table ---------- */
function textOf(q) { return E.ask(q).text; }

ok('Large Cap regular TER = 1.76%', textOf('Expense ratio of Axis Large Cap Fund?').indexOf('1.76%') > -1);
ok('Large Cap direct TER = 0.92%', textOf('Expense ratio of Axis Large Cap Fund direct plan?').indexOf('0.92%') > -1);
ok('Flexi Cap regular TER = 1.84%', textOf('Expense ratio of Axis Flexi Cap Fund?').indexOf('1.84%') > -1);
ok('Flexi Cap direct TER = 0.85%', textOf('Axis Flexi Cap Fund direct plan expense ratio').indexOf('0.85%') > -1);
ok('ELSS regular TER = 1.76%', textOf('Axis ELSS Tax Saver Fund expense ratio').indexOf('1.76%') > -1);
ok('ELSS direct TER = 1.05%', textOf('Axis ELSS Tax Saver Fund direct expense ratio').indexOf('1.05%') > -1);
ok('Mid Cap regular TER = 1.79%', textOf('Axis Mid Cap Fund expense ratio').indexOf('1.79%') > -1);
ok('Mid Cap direct TER = 0.81%', textOf('Axis Mid Cap Fund direct plan expense ratio').indexOf('0.81%') > -1);
ok('ELSS min SIP = Rs 500', textOf('Minimum SIP for Axis ELSS Tax Saver Fund?').indexOf('500') > -1);
ok('Large Cap min SIP = Rs 100', textOf('Minimum SIP for Axis Large Cap Fund?').indexOf('100') > -1);
ok('ELSS lock-in = 3 years', textOf('ELSS lock-in?').indexOf('3 years') > -1);
ok('Large Cap benchmark = BSE 100 TRI', textOf('Benchmark of Axis Large Cap Fund?').indexOf('BSE 100 TRI') > -1);
ok('Mid Cap benchmark = BSE Midcap 150 TRI', textOf('Benchmark of Axis Mid Cap Fund?').indexOf('BSE Midcap 150 TRI') > -1);
ok('Mid Cap exit load mentions 3 months', textOf('Exit load of Axis Mid Cap Fund?').indexOf('3 months') > -1);
ok('Flexi Cap exit load is nil', /nil/i.test(textOf('Exit load of Axis Flexi Cap Fund?')));
ok('Riskometer reported as Very High', textOf('Riskometer of Axis Mid Cap Fund?').indexOf('Very High') > -1);

/* ---------- corpus integrity ---------- */
var srcIds = Object.keys(C.SOURCES);
ok('corpus has 15-25 sources (brief requires 15-25)', srcIds.length >= 15 && srcIds.length <= 25, srcIds.length + ' sources');
srcIds.forEach(function (id) {
  ok('source ' + id + ' is declared in sources.csv', !!declared[C.SOURCES[id].u], C.SOURCES[id].u);
});
ok('4 schemes in scope (brief allows 3-5)', C.SCHEMES.length >= 3 && C.SCHEMES.length <= 5, C.SCHEMES.length + ' schemes');

/* every scheme must have both plan TERs and both source ids */
C.SCHEMES.forEach(function (s) {
  ok(s.name + ' has regular + direct TER', !!(s.ter.regular && s.ter.direct));
  ok(s.name + ' has regular + direct sources', !!(C.SOURCES[s.src.regular] && C.SOURCES[s.src.direct]));
});

/* ---------- report ---------- */
console.log('');
notes.forEach(function (n) { console.log(n); });
console.log('');
console.log('  ' + pass + ' passed, ' + fail + ' failed, ' + (pass + fail) + ' checks total');
console.log('');
process.exit(fail === 0 ? 0 : 1);
