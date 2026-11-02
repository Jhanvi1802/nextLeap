# Disclaimer snippet

The exact text shown in the prototype UI. It appears in two places: a short
always-visible note directly under the header, and the full disclaimer in the
page footer.

---

## 1. Short note (always visible, under the header)

> **Facts-only. No investment advice.** I will not recommend schemes, quote
> returns, or take any personal details.

---

## 2. Full disclaimer (page footer)

> **Disclaimer.** This is a student case-study prototype built for a
> product-management assignment. It is **not** affiliated with, endorsed by, or an
> official product of Groww or Axis Mutual Fund. It provides published facts only
> and does **not** constitute investment advice, a recommendation, or an offer to
> buy or sell any security. Figures are reproduced from official pages on the dates
> shown and change over time - always confirm on the linked source before acting.
> Mutual fund investments are subject to market risks; read all scheme related
> documents carefully.

---

## 3. In-conversation refusal lines

These are the user-facing refusals, reproduced verbatim from `engine.js`.

**Opinion / recommendation / suitability**

> I can only share published facts, so I cannot tell you what to buy, sell, hold or
> switch, or which scheme suits you. Ask me a factual question instead - expense
> ratio, exit load, minimum SIP, lock-in, riskometer or benchmark. For general
> investor education, the AMFI link below is a good starting point.

**Performance, returns or projections**

> I do not quote, calculate or compare scheme returns, and I cannot project future
> gains. Past and current performance is published in the official monthly
> factsheet, linked below. I can still answer factual questions such as expense
> ratio, exit load, lock-in or benchmark.

**Personal data detected** (`<category>` is the type found - never the value)

> It looks like that message contains a `<category>`, so I have not stored or
> processed it. Please never share PAN, Aadhaar, folio or account numbers, OTPs,
> email or phone numbers here. Ask the question without any personal details and I
> will answer it.

**Outside the indexed corpus**

> That is outside the small corpus I was given, which covers four Axis Mutual Fund
> equity schemes plus SEBI, AMFI and registrar pages. I will not guess at an answer
> I cannot cite. The AMFI investor education site linked below is the right place
> for broader questions.

---

## Why the "not affiliated" line is there

The brief asks you to build as a chosen product (Groww). A prototype that looks
like an official Groww or Axis surface, while quoting live fee figures, could be
mistaken for the real thing if the link is shared on. Naming the relationship
plainly costs one sentence and removes that risk.
