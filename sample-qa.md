# Sample Q&A

Ten queries run against the live assistant. **This file is generated** by
`node tools/gen-sample-qa.js`, so every answer below is exactly what the
prototype returns — it cannot drift from the shipped behaviour.

Seven are factual; three demonstrate the refusal paths the brief requires
(opinion, performance, personal data). Every row — refusals included —
carries exactly one official source link.

Corpus compiled: 27 Oct 2026  ·  Scheme figures as on: 26 Oct 2026

---

### 1. Expense ratio of Axis Flexi Cap Fund?

**Answered (fact)**

> The total expense ratio of Axis Flexi Cap Fund – Regular Plan is 1.84%, as disclosed on the scheme page. (Regular Plan — ask for the Direct Plan if you need that figure.)

Source: [Axis Flexi Cap Fund – Regular Plan, Axis Mutual Fund](https://www.axismf.com/mutual-funds/equity-funds/axis-flexi-cap-fund/ml-gp/regular)  
Last updated from sources: 26 Oct 2026  
_1 sentence (limit 3)_

### 2. Expense ratio of Axis Large Cap Fund direct plan?

**Answered (fact)**

> The total expense ratio of Axis Large Cap Fund – Direct Plan is 0.92%, as disclosed on the scheme page.

Source: [Axis Large Cap Fund – Direct Plan, Axis Mutual Fund](https://www.axismf.com/mutual-funds/equity-funds/axis-large-cap-fund/ef-dg/direct)  
Last updated from sources: 26 Oct 2026  
_1 sentence (limit 3)_

### 3. ELSS lock-in?

**Answered (fact)**

> Axis ELSS Tax Saver Fund carries a statutory lock-in of 3 years, so units cannot be redeemed or switched out before that period ends.

Source: [Axis ELSS Tax Saver Fund – Regular Plan, Axis Mutual Fund](https://www.axismf.com/mutual-funds/equity-funds/axis-elss-tax-saver-fund/ts-gp/regular)  
Last updated from sources: 26 Oct 2026  
_1 sentence (limit 3)_

### 4. Minimum SIP for Axis ELSS Tax Saver Fund?

**Answered (fact)**

> The minimum monthly SIP for Axis ELSS Tax Saver Fund is ₹500, as listed in the scheme’s minimum investment table.

Source: [Axis ELSS Tax Saver Fund – Regular Plan, Axis Mutual Fund](https://www.axismf.com/mutual-funds/equity-funds/axis-elss-tax-saver-fund/ts-gp/regular)  
Last updated from sources: 26 Oct 2026  
_1 sentence (limit 3)_

### 5. Exit load of Axis Mid Cap Fund?

**Answered (fact)**

> If units are redeemed or switched out within 3 months of allotment, 10% of the investment is free of load and the remainder carries 1%; after 3 months the exit load is NIL.

Source: [Axis Mid Cap Fund – Regular Plan, Axis Mutual Fund](https://www.axismf.com/mutual-funds/equity-funds/axis-mid-cap-fund/mc-gp/regular)  
Last updated from sources: 26 Oct 2026  
_1 sentence (limit 3)_

### 6. What is the benchmark of Axis Large Cap Fund?

**Answered (fact)**

> The benchmark for Axis Large Cap Fund is BSE 100 TRI, as stated on the scheme page.

Source: [Axis Large Cap Fund – Regular Plan, Axis Mutual Fund](https://www.axismf.com/mutual-funds/equity-funds/axis-large-cap-fund/ef-gp/regular)  
Last updated from sources: 26 Oct 2026  
_1 sentence (limit 3)_

### 7. How do I download my capital gains statement?

**Answered (fact)**

> A capital gain / loss statement is requested from the registrar: CAMS serves some AMCs and KFintech serves others, and MF Central covers both in one place. You select the financial year, enter your PAN and registered email, and the statement is emailed to the address already on your folio.

Source: [Capital Gain / Loss Statement, CAMS](https://www.camsonline.com/Investors/Statements/Capital-Gain&Capital-Loss-statement)  
Last updated from sources: accessed 27 Oct 2026  
_2 sentences (limit 3)_

### 8. Should I buy Axis Mid Cap Fund?

**Refused — advice**

> I can only share published facts, so I cannot tell you what to buy, sell, hold or switch, or which scheme suits you. Ask me a factual question instead — expense ratio, exit load, minimum SIP, lock-in, riskometer or benchmark. For general investor education, the AMFI link below is a good starting point.

Source: [Investor FAQs, Mutual Funds Sahi Hai (AMFI)](https://www.mutualfundssahihai.com/en/faqs)  
Last updated from sources: 27 Oct 2026  
_3 sentences (limit 3)_

### 9. What returns will I get from Axis Flexi Cap Fund?

**Refused — performance**

> I do not quote, calculate or compare scheme returns, and I cannot project future gains. Past and current performance is published in the official monthly factsheet, linked below. I can still answer factual questions such as expense ratio, exit load, lock-in or benchmark.

Source: [Downloads – monthly factsheet, Axis Mutual Fund](https://transact.axismf.com/downloads)  
Last updated from sources: 27 Oct 2026  
_3 sentences (limit 3)_

### 10. My PAN is ABCDE1234F, what is my balance?

**Blocked — personal data**

> It looks like that message contains a PAN, so I have not stored or processed it. Please never share PAN, Aadhaar, folio or account numbers, OTPs, email or phone numbers here. Ask the question without any personal details and I will answer it.

Source: [Mutual Funds Sahi Hai – AMFI investor education](https://www.mutualfundssahihai.com/en)  
Last updated from sources: 27 Oct 2026  
_3 sentences (limit 3)_

---

## Conformance

- Longest answer: **3 sentences** (limit is 3)
- Every answer carries exactly one `https://` citation: **yes**
- PAN value echoed back to the user: **no** (the refusal names the category only)
- Automated checks: `node tests/eval.js`
