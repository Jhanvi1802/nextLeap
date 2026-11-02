# Mutual Fund Facts - a facts-only FAQ assistant

A small retrieval-grounded FAQ assistant that answers **factual** questions about
mutual fund schemes - expense ratio, exit load, minimum SIP, ELSS lock-in,
riskometer, benchmark, how to download a capital-gains statement - using **only
official public pages**. Every answer carries exactly one source link. It gives no
advice, quotes no returns, and accepts no personal data.

**Live prototype:** https://jhanvi1802.github.io/nextLeap/
**Product:** Groww | **Corpus AMC:** Axis Mutual Fund | **Sources:** 23 official pages

> Nothing to install. Open the link, continue as guest, and ask one of the three
> example questions - or press a refusal chip to see the safety behaviour.

---

## Table of contents

1. [Scope](#1-scope)
2. [Setup](#2-setup)
3. [How it works](#3-how-it-works)
4. [Known limits](#4-known-limits)
5. [Source list (23 URLs)](#5-source-list)
6. [Sample Q&A](#6-sample-qa)
7. [Disclaimer](#7-disclaimer)

---

## 1. Scope

### Product

**Groww.** The brief asks you to pick one product and keep it across milestones.
This assistant is framed as a help surface a Groww user would meet when comparing
schemes - Groww has the largest retail mutual-fund user base in India, which
matches the brief's stated audience ("retail users comparing schemes").

Note the brief asks for two different things: a **product** (the app you build as)
and an **AMC** (whose schemes form the corpus). They are not the same. The product
is Groww; the corpus is Axis Mutual Fund.

### AMC and schemes

**Axis Mutual Fund**, four schemes across the categories the brief names:

| Scheme | SEBI category | Why included |
|---|---|---|
| Axis Large Cap Fund | Large Cap | the brief's large-cap slot |
| Axis Flexi Cap Fund | Flexi Cap | the brief's flexi-cap slot |
| Axis ELSS Tax Saver Fund | ELSS | the brief's ELSS slot; carries the 3-year lock-in |
| Axis Mid Cap Fund | Mid Cap | the only one with a **tiered** exit load, so the assistant has to handle a non-trivial answer |

Each scheme is indexed in both **Regular** and **Direct** plans, because their
expense ratios differ materially and that is the single most common confusion.

**Why Axis and not HDFC or SBI.** HDFC's site returns `403` to automated requests,
so its figures could not be independently verified - citing numbers I could not
read would defeat the point. SBI publishes mainly PDFs, where a fact is hard to
pin to a stable anchor. Axis exposes per-scheme HTML pages carrying an explicit
"As On" date next to each figure, which makes every citation checkable by a
reader in one click.

### Facts in scope

expense ratio (TER) | exit load | minimum SIP | minimum lumpsum | ELSS lock-in |
riskometer | benchmark | AUM | inception date | fund managers | SEBI category |
how to download a capital-gains statement | how to get a consolidated account
statement | where to find the factsheet, SID and KIM | direct vs regular plan

### Explicitly out of scope

Returns, CAGR, XIRR, NAV history, projections, scheme comparison, suitability,
and anything requiring personal data.

---

## 2. Setup

No build step, no dependencies, no API key. The whole assistant runs in the
browser and nothing you type leaves the page.

```bash
# 1. clone
git clone <this-repo>
cd mf-faq-assistant

# 2. open it - either works
start index.html                      # Windows
python -m http.server 8000            # or serve, then visit localhost:8000
```

```bash
# run the automated conformance checks (needs Node)
node tests/eval.js

# regenerate sample-qa.md straight from the engine
node tools/gen-sample-qa.js
```

### Files

| File | What it is |
|---|---|
| `index.html` | markup and design system - sign-in, app shell, three screens |
| `app.js` | UI shell: mock sign-in, navigation, chat rendering, settings |
| `corpus.js` | the 23-source corpus and the verified scheme fact table |
| `engine.js` | routing, PII/advice/performance gates, retrieval, composition |
| `prompts/system-prompt.md` | the instruction set the engine implements |
| `tests/eval.js` | 237 automated checks |
| `tools/gen-sample-qa.js` | regenerates `sample-qa.md` from the live engine |
| `sources.csv` | the 23 URLs, with what each one is used for |

### Product surfaces

Three screens behind a prototype sign-in.

**Sign-in.** No account, no password, no network call. You enter an optional
display name or continue as guest.

> **The brief bans collecting email and phone as PII - but a normal sign-in asks
> for exactly those.** So the name field is guarded by the *same* PII detector the
> assistant uses: type an email, phone or PAN into it and sign-in is refused. The
> constraint is enforced at the door, not only in conversation. Four tests assert
> this, including that no `input[type=password]` or `input[type=email]` exists
> anywhere in the app.

**Ask.** The assistant itself - welcome line, three example questions, the
facts-only note, and three chips that deliberately trigger the refusal paths so a
reviewer can see the safety behaviour without having to guess at phrasing.
Answers are colour-coded by outcome: green for a cited fact, amber for a refusal,
red for blocked personal data.

**Sources.** All 23 indexed pages, grouped by publisher (AMC / SEBI / AMFI /
registrars), each a live link. Anyone can check any figure in one click.

**Settings.** Two options change behaviour, four are locked on:

| Group | Setting | Effect |
|---|---|---|
| Answering | Default plan - Regular / Direct | which TER is quoted when you don't specify; Axis Large Cap is 1.76% regular vs 0.92% direct |
| Answering | Citation style - Title / Full URL | how the source is displayed |
| Answering | Answer length | Source date | locked - 3 sentences, always dated |
| **Safety** | Facts-only mode | **locked on** - no recommendations or rankings |
| **Safety** | No performance claims | **locked on** - no returns, CAGR, projections |
| **Safety** | Personal data blocking | **locked on** - PAN/Aadhaar/phone/email/folio/OTP |
| **Safety** | Source-grounded answers only | **locked on** - no reply without a citation |
| Appearance | Theme - System / Light / Dark | full dark mode |
| Appearance | Compact text | denser type |
| Privacy | Account | Network calls | What is stored | states plainly that nothing leaves the browser |
| Privacy | Clear conversation | Reset settings | both functional |
| Corpus | Sources | Schemes | Figures as on | 23 pages, 4 schemes, 26 Oct 2026 |
| About | Version and the full disclaimer | |

The four safety switches render as disabled, permanently on. They are shown rather
than hidden so it is obvious they are product guarantees, not preferences a user
can turn off.

---

## 3. How it works

Six stages, in order. The order matters - see the note on the performance gate.

```
query
  |
  +-1- PII gate ............ PAN / Aadhaar / phone / email / folio / OTP
  | -> blocked before anything is read or stored
  +-2- Advice gate ......... should I / which is better / is X good / best fund
  | -> refused, with an AMFI education link
  +-3- Performance gate .... returns / CAGR / XIRR / NAV history / projections
  | -> refused, pointed at the official factsheet
  +-4- Slot filling ........ resolve { scheme, plan, topic }
  +-5- Retrieval ........... score the corpus, select ONE passage
  +-6- Composition ......... <=3 sentences + exactly 1 citation + as-on date
```

**Every exit path returns a citation**, including all three refusal paths. There is
no branch in `engine.js` that can produce an answer without a source link.

### Three design decisions worth flagging

**The performance gate runs after the statement check, not before.** "How do I
download my *capital gains* statement?" contains the word *gains*, which a naive
returns-filter would refuse. It is a document request, not a performance question.
`detectPerformance()` returns `null` when the query mentions *statement*. This is
asserted in the test suite.

**PII is never echoed.** The refusal names the *category* detected ("that message
contains a PAN") and never the value. Two tests assert the PAN and phone number do
not appear in the response text.

**The engine is deterministic, not generative.** Answers are composed from
retrieved corpus fields rather than written by an LLM at request time. In a
regulated domain a hallucinated expense ratio is a compliance incident, not a
clumsy sentence. The retrieval, routing and refusal logic - the parts this
milestone tests - are identical either way, and
[`prompts/system-prompt.md`](prompts/system-prompt.md) is the contract either
implementation must satisfy. It is written as a drop-in LLM system prompt.

### Testing

`node tests/eval.js` runs **237 checks**: that every answer across 35 queries is
<=3 sentences, carries exactly one citation, that the citation URL exists in
`sources.csv`, that advice/performance/PII questions are refused, that PII is not
echoed, and that all 16 verified figures are reported correctly.

---

## 4. Known limits

Honest list. Several of these are properties of the source pages, not of the code.

1. **The figures are a snapshot, not a live feed.** Scheme facts were read on
   **26 Oct 2026** and are baked into `corpus.js`. Expense ratios change monthly.
   Every answer states its as-on date and links the page so a reader can check the
   current value; the app does not re-fetch.

2. **The Axis scheme pages contradict themselves on minimum SIP.** The structured
   "Minimum Investment Amount" table says **₹100**, while the *Invest Now* widget
   and the marketing copy on the same page say **₹1,000**. The assistant cites the
   structured table and says so. This is a real disclosure inconsistency on the
   source, and a reader comparing the answer against the page will see both numbers.

3. **The Axis Mid Cap page shows three different TERs.** 0.81% "As On Oct 26, 2026",
   0.57% "as on 31st January, 2026", and a footnote citing 31 July 2025. The
   assistant takes the most recently dated figure.

4. **Growth option only.** IDCW variants are not indexed; their TERs differ slightly.

5. **Retrieval is lexical, not semantic.** Unusual phrasings fall through to a
   clarifying question rather than a wrong answer - a deliberate trade, but it does
   mean paraphrases like "how much do they charge me yearly" may need rewording.

6. **One AMC, four schemes.** Nothing outside that returns a fact. Asking about an
   HDFC or SBI scheme produces an out-of-scope response, not an answer.

7. **The riskometer is cached.** SEBI requires it to be reviewed periodically. The
   answer says so and links the page rather than presenting it as permanent.

8. **Registrar pages need your PAN - on their site, never here.** CAMS, KFintech and
   MF Central ask for PAN and a registered email to release a capital-gains
   statement. The assistant explains the process and links out; it never collects
   any of it.

9. **English only**, and tuned to Indian retail phrasing.

---

## 5. Source list

23 official pages. All verified reachable (HTTP 200) on 27 Oct 2026. No
third-party aggregators, no blogs. Machine-readable copy: [`sources.csv`](sources.csv).

| # | Publisher | Title | URL |
|---|---|---|---|
| S01 | Axis MF | Axis Large Cap Fund - Regular Plan | https://www.axismf.com/mutual-funds/equity-funds/axis-large-cap-fund/ef-gp/regular |
| S02 | Axis MF | Axis Large Cap Fund - Direct Plan | https://www.axismf.com/mutual-funds/equity-funds/axis-large-cap-fund/ef-dg/direct |
| S03 | Axis MF | Axis Flexi Cap Fund - Regular Plan | https://www.axismf.com/mutual-funds/equity-funds/axis-flexi-cap-fund/ml-gp/regular |
| S04 | Axis MF | Axis Flexi Cap Fund - Direct Plan | https://www.axismf.com/mutual-funds/equity-funds/axis-flexi-cap-fund/ml-dg/direct |
| S05 | Axis MF | Axis ELSS Tax Saver Fund - Regular Plan | https://www.axismf.com/mutual-funds/equity-funds/axis-elss-tax-saver-fund/ts-gp/regular |
| S06 | Axis MF | Axis ELSS Tax Saver Fund - Direct Plan | https://www.axismf.com/mutual-funds/equity-funds/axis-elss-tax-saver-fund/ts-dg/direct |
| S07 | Axis MF | Axis Mid Cap Fund - Regular Plan | https://www.axismf.com/mutual-funds/equity-funds/axis-mid-cap-fund/mc-gp/regular |
| S08 | Axis MF | Axis Mid Cap Fund - Direct Plan | https://www.axismf.com/mutual-funds/equity-funds/axis-mid-cap-fund/mc-dg/direct |
| S09 | Axis MF | Equity Funds (scheme listing) | https://www.axismf.com/mutual-funds/equity-funds |
| S10 | Axis MF | Downloads - factsheets, KIM & forms | https://transact.axismf.com/downloads |
| S11 | Axis MF | Statutory Disclosures (SID / SAI / addenda) | https://www.axismf.com/statutory-disclosures |
| S12 | AMFI | AMFI home | https://www.amfiindia.com/ |
| S13 | AMFI | Mutual Fund basics | https://www.amfiindia.com/mutual-fund |
| S14 | AMFI | Understanding Mutual Funds (investor booklet, PDF) | https://www.amfiindia.com/uploads/AMFI_Understanding_Mutual_Funds_IAP_Booklet_Final_Website_version_860a5b77aa.pdf |
| S15 | AMFI | Mutual Funds Sahi Hai - investor education | https://www.mutualfundssahihai.com/en |
| S16 | AMFI | Mutual Funds Sahi Hai - Investor FAQs | https://www.mutualfundssahihai.com/en/faqs |
| S17 | SEBI | Understanding the Riskometer | https://investor.sebi.gov.in/riskometer.html |
| S18 | SEBI | Categorization & Rationalization of MF Schemes, 6 Oct 2017 (PDF) | https://sebi.gov.in/sebi_data/attachdocs/oct-2017/1509103633344.pdf |
| S19 | SEBI | Mutual Funds - circulars and regulations | https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListing=yes&sid=1&ssid=6&smid=0 |
| S20 | CAMS | Mutual Fund Statements (hub) | https://www.camsonline.com/Investors/Statements |
| S21 | CAMS | Capital Gain / Loss Statement | https://www.camsonline.com/Investors/Statements/Capital-Gain&Capital-Loss-statement |
| S22 | KFintech | Capital Gains / Loss Account Statement | https://mfs.kfintech.com/investor/General/CapitalGainsLossAccountStatement |
| S23 | MF Central | Unified investor service portal | https://www.mfcentral.com/ |

---

## 6. Sample Q&A

Ten queries run against the live engine - seven factual, three demonstrating the
refusal paths. Full version with as-on dates and sentence counts:
[`sample-qa.md`](sample-qa.md) (generated by `node tools/gen-sample-qa.js`).

| # | Question | Outcome | Answer | Source |
|---|---|---|---|---|
| 1 | Expense ratio of Axis Flexi Cap Fund? | fact | TER of Axis Flexi Cap Fund - Regular Plan is **1.84%**, as disclosed on the scheme page. (Regular Plan - ask for the Direct Plan if you need that figure.) | [S03](https://www.axismf.com/mutual-funds/equity-funds/axis-flexi-cap-fund/ml-gp/regular) |
| 2 | Expense ratio of Axis Large Cap Fund direct plan? | fact | TER of Axis Large Cap Fund - Direct Plan is **0.92%**, as disclosed on the scheme page. | [S02](https://www.axismf.com/mutual-funds/equity-funds/axis-large-cap-fund/ef-dg/direct) |
| 3 | ELSS lock-in? | fact | Axis ELSS Tax Saver Fund carries a statutory lock-in of **3 years**, so units cannot be redeemed or switched out before that period ends. | [S05](https://www.axismf.com/mutual-funds/equity-funds/axis-elss-tax-saver-fund/ts-gp/regular) |
| 4 | Minimum SIP for Axis ELSS Tax Saver Fund? | fact | The minimum monthly SIP is **₹500**, as listed in the scheme's minimum investment table. | [S05](https://www.axismf.com/mutual-funds/equity-funds/axis-elss-tax-saver-fund/ts-gp/regular) |
| 5 | Exit load of Axis Mid Cap Fund? | fact | Within 3 months of allotment, 10% of the investment is free of load and the remainder carries 1%; after 3 months the exit load is NIL. | [S07](https://www.axismf.com/mutual-funds/equity-funds/axis-mid-cap-fund/mc-gp/regular) |
| 6 | Benchmark of Axis Large Cap Fund? | fact | The benchmark is **BSE 100 TRI**, as stated on the scheme page. | [S01](https://www.axismf.com/mutual-funds/equity-funds/axis-large-cap-fund/ef-gp/regular) |
| 7 | How do I download my capital gains statement? | fact | Requested from the registrar - CAMS, KFintech or MF Central. Select the financial year, enter PAN and registered email; it is emailed to the address on the folio. | [S21](https://www.camsonline.com/Investors/Statements/Capital-Gain&Capital-Loss-statement) |
| 8 | Should I buy Axis Mid Cap Fund? | **refused - advice** | Cannot say what to buy, sell, hold or switch, or which scheme suits you. Redirects to factual questions. | [S16](https://www.mutualfundssahihai.com/en/faqs) |
| 9 | What returns will I get from Axis Flexi Cap Fund? | **refused - performance** | Does not quote, calculate or compare returns, or project gains. Points to the official factsheet. | [S10](https://transact.axismf.com/downloads) |
| 10 | My PAN is ABCDE1234F, what is my balance? | **blocked - PII** | Names the category only, never the value; the PAN is not stored, processed or echoed. | [S15](https://www.mutualfundssahihai.com/en) |

---

## 7. Disclaimer

Shown in the UI as a short always-visible note plus a full footer. Verbatim copy
and all refusal wordings: [`DISCLAIMER.md`](DISCLAIMER.md).

**Short note (under the header):**

> **Facts-only. No investment advice.** I will not recommend schemes, quote
> returns, or take any personal details.

**Full disclaimer (footer):**

> **Disclaimer.** This is a student case-study prototype built for a
> product-management assignment. It is **not** affiliated with, endorsed by, or an
> official product of Groww or Axis Mutual Fund. It provides published facts only
> and does **not** constitute investment advice, a recommendation, or an offer to
> buy or sell any security. Figures are reproduced from official pages on the dates
> shown and change over time - always confirm on the linked source before acting.
> Mutual fund investments are subject to market risks; read all scheme related
> documents carefully.
