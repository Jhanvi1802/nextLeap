/* ============================================================
   corpus.js - the retrieval corpus for the MF FAQ Assistant
 ------------------------------------------------------------
   Product : Groww (assistant is framed as a Groww help surface)
   AMC     : Axis Mutual Fund
   Schemes : Large Cap, Flexi Cap, ELSS Tax Saver, Mid Cap

   RULE: every fact below was read off the official page listed in
   `src` and carries that page's own "As On" date. Nothing here is
   recalled from memory or taken from a third-party aggregator.
   ============================================================ */

var META = {
  product: 'Groww',
  amc: 'Axis Mutual Fund',
  compiledOn: '27 Oct 2026',
  schemeFactsAsOn: '26 Oct 2026'
};

/* ---------- 23 official sources (see sources.csv) ---------- */
var SOURCES = {
  S01: { t: 'Axis Large Cap Fund - Regular Plan, Axis Mutual Fund', u: 'https://www.axismf.com/mutual-funds/equity-funds/axis-large-cap-fund/ef-gp/regular' },
  S02: { t: 'Axis Large Cap Fund - Direct Plan, Axis Mutual Fund', u: 'https://www.axismf.com/mutual-funds/equity-funds/axis-large-cap-fund/ef-dg/direct' },
  S03: { t: 'Axis Flexi Cap Fund - Regular Plan, Axis Mutual Fund', u: 'https://www.axismf.com/mutual-funds/equity-funds/axis-flexi-cap-fund/ml-gp/regular' },
  S04: { t: 'Axis Flexi Cap Fund - Direct Plan, Axis Mutual Fund', u: 'https://www.axismf.com/mutual-funds/equity-funds/axis-flexi-cap-fund/ml-dg/direct' },
  S05: { t: 'Axis ELSS Tax Saver Fund - Regular Plan, Axis Mutual Fund', u: 'https://www.axismf.com/mutual-funds/equity-funds/axis-elss-tax-saver-fund/ts-gp/regular' },
  S06: { t: 'Axis ELSS Tax Saver Fund - Direct Plan, Axis Mutual Fund', u: 'https://www.axismf.com/mutual-funds/equity-funds/axis-elss-tax-saver-fund/ts-dg/direct' },
  S07: { t: 'Axis Mid Cap Fund - Regular Plan, Axis Mutual Fund', u: 'https://www.axismf.com/mutual-funds/equity-funds/axis-mid-cap-fund/mc-gp/regular' },
  S08: { t: 'Axis Mid Cap Fund - Direct Plan, Axis Mutual Fund', u: 'https://www.axismf.com/mutual-funds/equity-funds/axis-mid-cap-fund/mc-dg/direct' },
  S09: { t: 'Equity Funds, Axis Mutual Fund', u: 'https://www.axismf.com/mutual-funds/equity-funds' },
  S10: { t: 'Downloads - factsheets, KIM & forms, Axis Mutual Fund', u: 'https://transact.axismf.com/downloads' },
  S11: { t: 'Statutory Disclosures (SID / SAI / addenda), Axis Mutual Fund', u: 'https://www.axismf.com/statutory-disclosures' },
  S12: { t: 'AMFI - Association of Mutual Funds in India', u: 'https://www.amfiindia.com/' },
  S13: { t: 'Mutual Fund basics, AMFI', u: 'https://www.amfiindia.com/mutual-fund' },
  S14: { t: 'Understanding Mutual Funds (investor booklet), AMFI', u: 'https://www.amfiindia.com/uploads/AMFI_Understanding_Mutual_Funds_IAP_Booklet_Final_Website_version_860a5b77aa.pdf' },
  S15: { t: 'Mutual Funds Sahi Hai - AMFI investor education', u: 'https://www.mutualfundssahihai.com/en' },
  S16: { t: 'Investor FAQs, Mutual Funds Sahi Hai (AMFI)', u: 'https://www.mutualfundssahihai.com/en/faqs' },
  S17: { t: 'Understanding the Riskometer, SEBI Investor Website', u: 'https://investor.sebi.gov.in/riskometer.html' },
  S18: { t: 'Categorization and Rationalization of Mutual Fund Schemes (6 Oct 2017), SEBI', u: 'https://sebi.gov.in/sebi_data/attachdocs/oct-2017/1509103633344.pdf' },
  S19: { t: 'Mutual Funds - circulars and regulations, SEBI', u: 'https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListing=yes&sid=1&ssid=6&smid=0' },
  S20: { t: 'Mutual Fund Statements, CAMS', u: 'https://www.camsonline.com/Investors/Statements' },
  S21: { t: 'Capital Gain / Loss Statement, CAMS', u: 'https://www.camsonline.com/Investors/Statements/Capital-Gain&Capital-Loss-statement' },
  S22: { t: 'Capital Gains / Loss Account Statement, KFintech', u: 'https://mfs.kfintech.com/investor/General/CapitalGainsLossAccountStatement' },
  S23: { t: 'MF Central - unified investor service portal', u: 'https://www.mfcentral.com/' }
};

/* ---------- scheme table: read off S01-S08 on 26 Oct 2026 ---------- */
var SCHEMES = [
  {
    id: 'largecap',
    name: 'Axis Large Cap Fund',
    category: 'Large Cap Fund',
    categoryText: 'an open ended equity scheme predominantly investing in large cap stocks',
    aliases: ['large cap', 'largecap', 'large-cap', 'bluechip', 'blue chip', 'blue-chip', 'axis large'],
    benchmark: 'BSE 100 TRI',
    riskometer: 'Very High',
    exitLoad: 'Nil',
    exitLoadText: 'Axis Large Cap Fund carries no exit load - the scheme page lists Exit Load as NIL.',
    minSip: '₹100',
    minLumpsum: '₹100',
    aum: '₹29,231.05 crore',
    aumAsOn: '30 Sep 2026',
    inception: '5 January 2010',
    managers: 'Shreyash Devalkar, Krishnaa N and Jayesh Sundar',
    ter: { regular: '1.76%', direct: '0.92%' },
    src: { regular: 'S01', direct: 'S02' },
    lockIn: null
  },
  {
    id: 'flexicap',
    name: 'Axis Flexi Cap Fund',
    category: 'Flexi Cap Fund',
    categoryText: 'an open ended equity scheme investing across large cap, mid cap and small cap stocks',
    aliases: ['flexi cap', 'flexicap', 'flexi-cap', 'flexi', 'axis flexi'],
    benchmark: 'NIFTY 500 TRI',
    riskometer: 'Very High',
    exitLoad: 'Nil',
    exitLoadText: 'Axis Flexi Cap Fund carries no exit load - the scheme page lists Exit Load as NIL.',
    minSip: '₹100',
    minLumpsum: '₹100',
    aum: null,
    aumAsOn: null,
    inception: null,
    managers: 'Krishnaa N and Sachin Relekar',
    ter: { regular: '1.84%', direct: '0.85%' },
    src: { regular: 'S03', direct: 'S04' },
    lockIn: null
  },
  {
    id: 'elss',
    name: 'Axis ELSS Tax Saver Fund',
    category: 'ELSS (Equity Linked Savings Scheme)',
    categoryText: 'an open ended equity linked saving scheme with a statutory lock-in of 3 years and a tax benefit',
    aliases: ['elss', 'tax saver', 'taxsaver', 'tax-saver', 'tax saving', 'long term equity', '80c', 'axis elss'],
    benchmark: 'NIFTY 500 TRI',
    riskometer: 'Very High',
    exitLoad: 'Not applicable',
    exitLoadText: 'Axis ELSS Tax Saver Fund shows Exit Load as N/A, because units are already locked in for 3 years and cannot be redeemed earlier.',
    minSip: '₹500',
    minLumpsum: '₹500',
    aum: null,
    aumAsOn: null,
    inception: null,
    managers: null,
    ter: { regular: '1.76%', direct: '1.05%' },
    src: { regular: 'S05', direct: 'S06' },
    lockIn: '3 years'
  },
  {
    id: 'midcap',
    name: 'Axis Mid Cap Fund',
    category: 'Mid Cap Fund',
    categoryText: 'an open ended equity scheme predominantly investing in mid cap stocks',
    aliases: ['mid cap', 'midcap', 'mid-cap', 'axis mid'],
    benchmark: 'BSE Midcap 150 TRI',
    riskometer: 'Very High',
    exitLoad: 'Tiered within 3 months',
    exitLoadText: 'If units are redeemed or switched out within 3 months of allotment, 10% of the investment is free of load and the remainder carries 1%; after 3 months the exit load is NIL.',
    minSip: '₹100',
    minLumpsum: '₹100',
    aum: '₹33,527.80 crore',
    aumAsOn: '30 Sep 2026',
    inception: '18 February 2011',
    managers: null,
    ter: { regular: '1.79%', direct: '0.81%' },
    src: { regular: 'S07', direct: 'S08' },
    lockIn: null
  }
];

/* ---------- topic vocabulary used by the retriever ---------- */
var TOPICS = {
  expense_ratio: ['expense ratio', 'expense', 'ter', 'total expense', 'charges', 'cost', 'fee', 'fees', 'how much does it cost'],
  exit_load: ['exit load', 'exit', 'load', 'redemption charge', 'redeem charge', 'penalty', 'exit fee'],
  min_sip: ['minimum sip', 'min sip', 'sip amount', 'smallest sip', 'start sip', 'sip start', 'monthly sip', 'minimum investment', 'sip minimum'],
  min_lumpsum: ['lumpsum', 'lump sum', 'one time', 'minimum lumpsum', 'one-time investment'],
  lock_in: ['lock in', 'lock-in', 'lockin', 'locked', 'blocked period', 'how long', 'holding period'],
  riskometer: ['riskometer', 'risk', 'risky', 'risk level', 'how risky'],
  benchmark: ['benchmark', 'index', 'compared against', 'tracks', 'measured against'],
  aum: ['aum', 'assets under management', 'fund size', 'how big'],
  inception: ['inception', 'launched', 'launch date', 'started', 'since when', 'how old'],
  fund_manager: ['fund manager', 'manager', 'managed by', 'who manages'],
  category: ['category', 'type of fund', 'what kind', 'sebi category', 'classification'],
  statement_cg: ['capital gain', 'capital gains', 'capital-gain', 'cg statement', 'tax statement', 'gains statement'],
  statement_acc: ['account statement', 'cas', 'consolidated statement', 'holding statement', 'portfolio statement', 'download statement'],
  factsheet: ['factsheet', 'fact sheet', 'monthly factsheet', 'portfolio disclosure'],
  sid_kim: ['sid', 'kim', 'scheme information document', 'key information memorandum', 'offer document', 'sai'],
  direct_vs_regular: ['direct vs regular', 'regular vs direct', 'difference between direct and regular', 'direct plan', 'regular plan', 'why is direct cheaper']
};

/* ---------- general (non-scheme-specific) facts ---------- */
var GENERAL = [
  {
    id: 'g_elss_lockin',
    topic: 'lock_in',
    keys: ['elss lock in', 'elss lock-in', 'tax saver lock in', '80c lock in', 'elss how long', 'elss 3 years'],
    answer: 'ELSS is an open ended equity linked savings scheme that carries a statutory lock-in of 3 years, which is the shortest lock-in among Section 80C options. Units cannot be redeemed or switched out before that period ends.',
    src: 'S18', asOn: '6 Oct 2017'
  },
  {
    id: 'g_what_elss',
    topic: 'category',
    keys: ['what is elss', 'elss meaning', 'what does elss stand for', 'equity linked savings'],
    answer: 'ELSS stands for Equity Linked Savings Scheme - an open ended equity scheme that invests at least 80% in equity and carries a statutory 3-year lock-in, defined under SEBI\'s scheme categorization framework.',
    src: 'S18', asOn: '6 Oct 2017'
  },
  {
    id: 'g_riskometer',
    topic: 'riskometer',
    keys: ['what is riskometer', 'riskometer meaning', 'how is risk measured', 'risk levels', 'riskometer levels'],
    answer: 'The Riskometer is the standard tool used across the mutual fund industry to depict a scheme\'s risk level, running from Low to Very High. SEBI states that risk levels are reviewed periodically and updated as market conditions change.',
    src: 'S17', asOn: 'accessed 27 Oct 2026'
  },
  {
    id: 'g_expense_ratio',
    topic: 'expense_ratio',
    keys: ['what is expense ratio', 'expense ratio meaning', 'what is ter', 'what does expense ratio mean'],
    answer: 'The expense ratio is the recurring annual cost of running a scheme, expressed as a percentage of its assets and already reflected in the NAV. AMFI\'s investor booklet explains the components, and SEBI caps the total expense ratio.',
    src: 'S14', asOn: 'accessed 27 Oct 2026'
  },
  {
    id: 'g_exit_load',
    topic: 'exit_load',
    keys: ['what is exit load', 'exit load meaning', 'how does exit load work'],
    answer: 'An exit load is a charge deducted from the NAV when units are redeemed within a defined period of being allotted. AMFI\'s investor booklet works through an example of how the deduction is applied.',
    src: 'S14', asOn: 'accessed 27 Oct 2026'
  },
  {
    id: 'g_direct_regular',
    topic: 'direct_vs_regular',
    keys: ['direct vs regular', 'regular vs direct', 'difference between direct and regular plan', 'why is direct cheaper', 'what is direct plan'],
    answer: 'A Direct Plan is bought straight from the AMC and carries no distributor commission, so its expense ratio is lower than the Regular Plan of the same scheme. Both plans hold the identical portfolio - only the expense ratio and therefore the NAV differ.',
    src: 'S09', asOn: 'accessed 27 Oct 2026'
  },
  {
    id: 'g_cg_statement',
    topic: 'statement_cg',
    keys: ['capital gains statement', 'how to download capital gain statement', 'capital gain loss statement', 'tax statement for mutual fund', 'cg statement download'],
    answer: 'A capital gain / loss statement is requested from the registrar: CAMS serves some AMCs and KFintech serves others, and MF Central covers both in one place. You select the financial year, enter your PAN and registered email, and the statement is emailed to the address already on your folio.',
    src: 'S21', asOn: 'accessed 27 Oct 2026'
  },
  {
    id: 'g_acc_statement',
    topic: 'statement_acc',
    keys: ['account statement', 'consolidated account statement', 'cas download', 'how to get my statement', 'holding statement'],
    answer: 'A Consolidated Account Statement covering all your mutual fund holdings can be requested from CAMS, KFintech or MF Central using your PAN and registered email. Axis Mutual Fund also lists statement-related forms on its downloads page.',
    src: 'S20', asOn: 'accessed 27 Oct 2026'
  },
  {
    id: 'g_factsheet',
    topic: 'factsheet',
    keys: ['factsheet', 'monthly factsheet', 'where to find factsheet', 'portfolio disclosure', 'fund performance'],
    answer: 'Axis Mutual Fund publishes its monthly factsheet and portfolio disclosures on its downloads page, which is the official source for scheme-level data including performance. This assistant does not reproduce or compare returns.',
    src: 'S10', asOn: 'accessed 27 Oct 2026'
  },
  {
    id: 'g_sid_kim',
    topic: 'sid_kim',
    keys: ['sid', 'kim', 'scheme information document', 'key information memorandum', 'offer document', 'where to find sid'],
    answer: 'The Scheme Information Document (SID), Statement of Additional Information (SAI) and scheme addenda are published on Axis Mutual Fund\'s statutory disclosures page. The KIM is a short summary of the SID and is bundled with the application form.',
    src: 'S11', asOn: 'accessed 27 Oct 2026'
  },
  {
    id: 'g_what_mf',
    topic: 'category',
    keys: ['what is a mutual fund', 'mutual fund meaning', 'how do mutual funds work'],
    answer: 'A mutual fund pools money from many investors and invests it in securities according to a stated objective, with each investor holding units that represent a share of the pool. AMFI\'s investor pages set out the structure and the roles of the AMC, trustee and registrar.',
    src: 'S13', asOn: 'accessed 27 Oct 2026'
  },
  {
    id: 'g_sebi_categories',
    topic: 'category',
    keys: ['sebi categories', 'fund categories', 'large cap definition', 'flexi cap definition', 'mid cap definition', 'what is flexi cap', 'what is large cap'],
    answer: 'SEBI\'s 2017 categorization circular defines the equity scheme categories - including Large Cap, Mid Cap, Flexi Cap and ELSS - and requires scheme names to stay true to label. The circular sets the minimum equity allocation that each category must hold.',
    src: 'S18', asOn: '6 Oct 2017'
  }
];

/* ---------- educational links used when refusing ---------- */
var EDU = {
  advice: { t: 'Investor FAQs, Mutual Funds Sahi Hai (AMFI)', u: 'https://www.mutualfundssahihai.com/en/faqs' },
  performance: { t: 'Downloads - monthly factsheet, Axis Mutual Fund', u: 'https://transact.axismf.com/downloads' },
  pii: { t: 'Mutual Funds Sahi Hai - AMFI investor education', u: 'https://www.mutualfundssahihai.com/en' },
  scope: { t: 'Equity Funds, Axis Mutual Fund', u: 'https://www.axismf.com/mutual-funds/equity-funds' },
  general: { t: 'Mutual Funds Sahi Hai - AMFI investor education', u: 'https://www.mutualfundssahihai.com/en' }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { META: META, SOURCES: SOURCES, SCHEMES: SCHEMES, TOPICS: TOPICS, GENERAL: GENERAL, EDU: EDU };
}
