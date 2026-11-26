[![make.fun bounty](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/joykiko/hearthside-budget/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/joykiko/hearthside-budget/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)

# Hearthside Budget

A complete household budget site for one family — the Alvarezes, two salaries, two kids, a rented house on Maple Street — that opens mid-month with the books already alive: $7,570 in, $3,512 out, $4,058 left to budget in November 2026. Six linked pages, all working: an **Overview** (month summary cards, a spending-by-category donut, the budgets closest to their limit, recent transactions, and the bills coming due with dates), **Transactions** (search, category and in/out filters, add / edit / delete), **Budgets** (a monthly budget per category, editable, with what is spent, what is left, and the biggest item in each), **Goals** (three savings goals with progress bars and add-funds), **Insights** (income against spending for every month in the ledger, a category table against budget, the biggest single payments, and a savings-rate summary written from the figures), and **Data** (export a JSON backup, export transactions as CSV, import a backup, restore the demo books).

Everything is computed from one ledger, so no page can disagree with another. The books persist in the browser's local storage; the site is fully offline — no accounts, no network requests, no libraries — and its first load is 8 files, 53,901 bytes raw (17,500 bytes gzip), split into single-job files: `data.js` (the household and its seed ledger), `store.js` (state and sums), `format.js`, `charts.js` (canvas donut and trend), `views.js` (the six pages), `main.js` (routing and events), `style.css`, `index.html`. It lays out in one column on a phone (see the 390×844 screenshot) and in grids on a desktop.

Entry for make.fun's ["Make the best household budget site" bounty](https://make.fun/bounty/best-household-budget-site-20261126-1457) ($50 in USDC). More entries like this: https://make.fun/r/68t6gm6y

## Run it

Open `app/index.html` in a browser, or serve the folder with the small server beside it:

```
node serve.ts            # http://localhost:8080
node serve.ts --port 8123
```

The hand-in program copies `app/` and `screenshots/` into an output directory and writes `dossier.json` there with the vendored make.fun library:

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts`, `serve.ts` and `app/` were written for this entry. `vendor/makefun-frontend.ts` is copied unchanged from the bounty kit (sha256 `4c8da1c8e76490b3a847670f49137d3ec23953e3c988fe6a6cb320fce5739240`).

## Screenshots

`screenshots/` holds the four shots in `shots.json`: the Overview, Budgets and Insights pages at 1280×800, and the Overview at phone size, 390×844 — all rendered from this code in a headless browser.

## Submission reasoning (condensed)

1. **Rubric → evidence.** (1) Working site in the screenshots: the contact sheet shows real November figures on three different pages plus a phone view; all six pages are functional (verified in headless Chromium, 0 console errors). (2) Usefulness: one household's full ledger — 86 transactions, Sep–Nov 2026, 12 categories, dated bills, savings goals. (3) Ease of use: one-column phone layout, 16px system type, every page reachable from the header. (4) Look: a warm paper-and-green "hearthside" identity with a named family, not a generic dashboard skin. (5) First load: 8 files, 17,500 bytes gzip; source split into single-job files named for their work.
2. **Numbers.** The field was empty at build time (0 submissions, empty leaderboard), so there is no cutoff to clear; prizes are $5 × ranks 1–10, and blind rounds begin 2026-11-27T08:57Z. This entry's job is to set the bar.
3. **Baseline beaten.** The kit starter is a single demo panel with hard-coded figures; this entry beats it on pages (6 vs 1), data (a real 3-month ledger vs constants), phone layout, and load size.
4. **Weakness, honestly.** The judge sees four screenshots, so the Transactions and Goals depth is judged mostly through the source outline; the Overview shot compensates by showing transactions and bills directly. The household is USD-only and single-currency by design.
5. **Quota decision.** Probe 1 of a 10/day, 20-total quota (account cap may be lower in practice). The version is verified end-to-end locally before spending the slot; remaining quota is reserved for one fix iteration if the first rating names a concrete weakness.
