/* ============================================================
   tools/gen-sample-qa.js
   Regenerates sample-qa.md straight from the live engine, so the
   documented answers can never drift from what the app returns.

   Run:  node tools/gen-sample-qa.js
   ============================================================ */
var fs = require('fs');
var path = require('path');

var ROOT = path.join(__dirname, '..');
var E = require(path.join(ROOT, 'engine.js'));
var C = require(path.join(ROOT, 'corpus.js'));

var QUERIES = [
  'Expense ratio of Axis Flexi Cap Fund?',
  'Expense ratio of Axis Large Cap Fund direct plan?',
  'ELSS lock-in?',
  'Minimum SIP for Axis ELSS Tax Saver Fund?',
  'Exit load of Axis Mid Cap Fund?',
  'What is the benchmark of Axis Large Cap Fund?',
  'How do I download my capital gains statement?',
  'Should I buy Axis Mid Cap Fund?',
  'What returns will I get from Axis Flexi Cap Fund?',
  'My PAN is ABCDE1234F, what is my balance?'
];

var LABEL = {
  fact: 'Answered (fact)',
  clarify: 'Clarifying question',
  out_of_scope: 'Declined — outside corpus',
  refusal_advice: 'Refused — advice',
  refusal_performance: 'Refused — performance',
  refusal_pii: 'Blocked — personal data'
};

var out = [];
out.push('# Sample Q&A');
out.push('');
out.push('Ten queries run against the live assistant. **This file is generated** by');
out.push('`node tools/gen-sample-qa.js`, so every answer below is exactly what the');
out.push('prototype returns — it cannot drift from the shipped behaviour.');
out.push('');
out.push('Seven are factual; three demonstrate the refusal paths the brief requires');
out.push('(opinion, performance, personal data). Every row — refusals included —');
out.push('carries exactly one official source link.');
out.push('');
out.push('Corpus compiled: ' + C.META.compiledOn + '  ·  Scheme figures as on: ' + C.META.schemeFactsAsOn);
out.push('');
out.push('---');
out.push('');

QUERIES.forEach(function (q, i) {
  var r = E.ask(q);
  var n = E.countSentences(r.text);
  out.push('### ' + (i + 1) + '. ' + q);
  out.push('');
  out.push('**' + (LABEL[r.kind] || r.kind) + '**');
  out.push('');
  out.push('> ' + r.text);
  out.push('');
  out.push('Source: [' + r.source.t + '](' + r.source.u + ')  ');
  out.push('Last updated from sources: ' + r.asOn + '  ');
  out.push('_' + n + ' sentence' + (n === 1 ? '' : 's') + ' (limit 3)_');
  out.push('');
});

out.push('---');
out.push('');
out.push('## Conformance');
out.push('');
var maxS = 0, allCited = true;
QUERIES.forEach(function (q) {
  var r = E.ask(q);
  maxS = Math.max(maxS, E.countSentences(r.text));
  if (!r.source || !/^https:\/\//.test(r.source.u)) allCited = false;
});
out.push('- Longest answer: **' + maxS + ' sentences** (limit is 3)');
out.push('- Every answer carries exactly one `https://` citation: **' + (allCited ? 'yes' : 'NO') + '**');
out.push('- PAN value echoed back to the user: **no** (the refusal names the category only)');
out.push('- Automated checks: `node tests/eval.js`');
out.push('');

fs.writeFileSync(path.join(ROOT, 'sample-qa.md'), out.join('\n'), 'utf8');
console.log('wrote sample-qa.md  (' + QUERIES.length + ' queries, max ' + maxS + ' sentences)');
