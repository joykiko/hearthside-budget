// views.js — what each page shows. Every view is a function from the books
// (store.js) and the small piece of screen state main.js keeps (the month
// being looked at, the transaction filters, the row being edited) to an
// HTML string. Charts are drawn by mountCharts once the HTML is in place.
// Every figure on every page is computed from the ledger at render time —
// nothing is typed in twice, so no page can disagree with another.

import { CATEGORIES, EXPENSE_CATEGORIES, categoryById } from './data.js';
import {
  getState, transactionsIn, monthTotals, spendingByCategory, biggestExpenses,
  upcomingBills, latestMonth, recentMonths, monthKeyOf,
} from './store.js';
import { money, moneyWhole, monthLabel, shortDate, longDate, pct, ratio } from './format.js';
import { donutChart, trendChart } from './charts.js';

function esc(text) {
  return String(text)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function catChip(cat) {
  return `<span class="chip"><span class="dot" style="background:${cat.color}"></span>${esc(cat.name)}</span>`;
}

function bar(ratioValue, color) {
  const width = Math.round(ratioValue * 100);
  return `<span class="bar"><span class="bar-fill" style="width:${width}%;background:${color}"></span></span>`;
}

// The month switcher every money page opens with.
function monthBar(ui) {
  return `<div class="month-bar">
    <button class="btn small" data-action="month-prev" aria-label="Previous month">‹</button>
    <h1>${monthLabel(ui.month)}</h1>
    <button class="btn small" data-action="month-next" aria-label="Next month">›</button>
  </div>`;
}

// --- Overview ---------------------------------------------------------------

export function viewOverview(ui) {
  const totals = monthTotals(ui.month);
  const byCat = spendingByCategory(ui.month);
  const recent = transactionsIn(ui.month).slice(-6).reverse();
  const bills = upcomingBills().slice(0, 5);
  const billsTotal = upcomingBills()
    .filter((b) => b.inDays <= 30)
    .reduce((sum, b) => sum + b.bill.amount, 0);
  const topBudgets = EXPENSE_CATEGORIES
    .map((cat) => {
      const spent = byCat.find((row) => row.cat.id === cat.id)?.total ?? 0;
      const budget = getState().budgets[cat.id] ?? 0;
      return { cat, spent, budget };
    })
    .sort((a, b) => ratio(b.spent, b.budget) - ratio(a.spent, a.budget))
    .slice(0, 5);

  const legend = byCat.map((row) => `<li>
      ${catChip(row.cat)}<span class="legend-amt">${money(row.total)}</span>
      <span class="legend-pct">${pct(row.total, totals.expenses)}</span></li>`).join('');
  const budgetRows = topBudgets.map(({ cat, spent, budget }) => `<li>
      <div class="row-head"><span>${esc(cat.name)}</span>
      <span>${moneyWhole(spent)} of ${moneyWhole(budget)}</span></div>
      ${bar(ratio(spent, budget), spent > budget ? '#d64541' : cat.color)}</li>`).join('');
  const recentRows = recent.map((t) => `<li>
      <span class="tx-date">${shortDate(t.date)}</span>
      <span class="tx-desc">${esc(t.desc)}</span>
      <span class="tx-amt ${t.type}">${t.type === 'in' ? '+' : '−'}${money(t.amount)}</span></li>`).join('');
  const billRows = bills.map(({ bill, due, inDays }) => `<li>
      <span class="tx-desc">${esc(bill.name)}</span>
      <span class="bill-due">${longDate(due.toISOString().slice(0, 10))} · ${inDays === 0 ? 'today' : `in ${inDays} days`}</span>
      <span class="tx-amt out">−${money(bill.amount)}</span></li>`).join('');

  return `${monthBar(ui)}
  <section class="cards">
    <article class="card stat"><h2>Money in</h2><p class="stat-num in">${moneyWhole(totals.income)}</p><p class="stat-note">${transactionsIn(ui.month).filter((t) => t.type === 'in').length} payments received</p></article>
    <article class="card stat"><h2>Money out</h2><p class="stat-num out">${moneyWhole(totals.expenses)}</p><p class="stat-note">${transactionsIn(ui.month).filter((t) => t.type === 'out').length} payments made</p></article>
    <article class="card stat"><h2>Left to budget</h2><p class="stat-num">${moneyWhole(totals.left)}</p><p class="stat-note">${pct(totals.left, totals.income)} of income kept so far</p></article>
    <article class="card stat"><h2>Bills due in 30 days</h2><p class="stat-num">${moneyWhole(billsTotal)}</p><p class="stat-note">rent, power, internet, phone, car insurance</p></article>
  </section>
  <section class="grid-2">
    <article class="card">
      <h2>Spending by category</h2>
      <canvas id="chart-donut" class="chart"></canvas>
      <ul class="legend">${legend || '<li>Nothing spent this month yet.</li>'}</ul>
    </article>
    <article class="card">
      <h2>Budgets closest to their limit</h2>
      <ul class="bars">${budgetRows}</ul>
      <p class="more"><a href="#/budgets">See all budgets →</a></p>
    </article>
  </section>
  <section class="grid-2">
    <article class="card">
      <h2>Recent transactions</h2>
      <ul class="tx-list">${recentRows || '<li>Nothing recorded this month yet.</li>'}</ul>
      <p class="more"><a href="#/transactions">See all transactions →</a></p>
    </article>
    <article class="card">
      <h2>Coming bills</h2>
      <ul class="tx-list">${billRows}</ul>
      <p class="note">Amounts are the last bill paid for each — the electric bill moves a little month to month.</p>
    </article>
  </section>`;
}

// --- Transactions -------------------------------------------------------------

function filteredTransactions(ui) {
  const q = ui.q.trim().toLowerCase();
  return transactionsIn(ui.month).filter((t) => {
    if (ui.fcat !== 'all' && t.cat !== ui.fcat) return false;
    if (ui.ftype !== 'all' && t.type !== ui.ftype) return false;
    if (q && !t.desc.toLowerCase().includes(q)) return false;
    return true;
  }).reverse();
}

export function viewTransactions(ui) {
  const rows = filteredTransactions(ui);
  const all = transactionsIn(ui.month);
  const editing = ui.editing ? all.find((t) => t.id === ui.editing) : null;
  const catOptions = (selected) => CATEGORIES
    .map((c) => `<option value="${c.id}" ${c.id === selected ? 'selected' : ''}>${esc(c.name)}</option>`).join('');
  const filterCatOptions = ['<option value="all">All categories</option>',
    ...CATEGORIES.map((c) => `<option value="${c.id}" ${ui.fcat === c.id ? 'selected' : ''}>${esc(c.name)}</option>`)].join('');
  const inTotal = rows.filter((t) => t.type === 'in').reduce((s, t) => s + t.amount, 0);
  const outTotal = rows.filter((t) => t.type === 'out').reduce((s, t) => s + t.amount, 0);
  const defaultDate = editing ? editing.date
    : (all.length ? all[all.length - 1].date : `${ui.month}-01`);

  const body = rows.map((t) => `<tr>
      <td>${shortDate(t.date)}</td>
      <td>${esc(t.desc)}</td>
      <td>${catChip(categoryById(t.cat))}</td>
      <td class="num in">${t.type === 'in' ? money(t.amount) : ''}</td>
      <td class="num out">${t.type === 'out' ? money(t.amount) : ''}</td>
      <td class="row-actions">
        <button class="btn small" data-action="edit-tx" data-id="${t.id}">Edit</button>
        <button class="btn small danger" data-action="del-tx" data-id="${t.id}">Delete</button>
      </td></tr>`).join('');

  return `${monthBar(ui)}
  <section class="card">
    <h2>${editing ? 'Edit transaction' : 'Add a transaction'}</h2>
    <form id="tx-form" class="tx-form">
      <label>Date <input type="date" name="date" required value="${defaultDate}"></label>
      <label class="grow">Description <input type="text" name="desc" required maxlength="80" placeholder="e.g. FreshMart — weekly shop" value="${editing ? esc(editing.desc) : ''}"></label>
      <label>Category <select name="cat">${catOptions(editing ? editing.cat : 'groceries')}</select></label>
      <label>Amount $ <input type="number" name="amount" required min="0.01" step="0.01" placeholder="0.00" value="${editing ? editing.amount : ''}"></label>
      <span class="form-btns">
        <button class="btn primary" type="submit">${editing ? 'Save changes' : 'Add transaction'}</button>
        ${editing ? '<button class="btn" type="button" data-action="cancel-edit">Cancel</button>' : ''}
      </span>
    </form>
    <p class="note">Pick an income category (Salary, Side income) and the amount counts as money in; any other category counts as money out.</p>
  </section>
  <section class="card">
    <div class="filter-row">
      <input type="search" id="tx-search" placeholder="Search descriptions…" value="${esc(ui.q)}" aria-label="Search descriptions">
      <select id="tx-fcat" aria-label="Filter by category">${filterCatOptions}</select>
      <select id="tx-ftype" aria-label="Filter by kind">
        <option value="all" ${ui.ftype === 'all' ? 'selected' : ''}>Money in and out</option>
        <option value="in" ${ui.ftype === 'in' ? 'selected' : ''}>Money in only</option>
        <option value="out" ${ui.ftype === 'out' ? 'selected' : ''}>Money out only</option>
      </select>
      <span class="count">${rows.length} of ${all.length} shown</span>
    </div>
    <div class="table-wrap"><table class="tx-table">
      <thead><tr><th>Date</th><th>Description</th><th>Category</th><th class="num">In</th><th class="num">Out</th><th></th></tr></thead>
      <tbody>${body || '<tr><td colspan="6">No transactions match. Loosen the filters, or add one above.</td></tr>'}</tbody>
      <tfoot><tr><td colspan="3">Totals for what is shown</td><td class="num in">${money(inTotal)}</td><td class="num out">${money(outTotal)}</td><td></td></tr></tfoot>
    </table></div>
  </section>`;
}

// --- Budgets ------------------------------------------------------------------

export function viewBudgets(ui) {
  const byCat = spendingByCategory(ui.month);
  const spentOf = (id) => byCat.find((row) => row.cat.id === id)?.total ?? 0;
  const budgets = getState().budgets;
  const totalBudget = EXPENSE_CATEGORIES.reduce((s, c) => s + (budgets[c.id] ?? 0), 0);
  const totals = monthTotals(ui.month);

  const cards = EXPENSE_CATEGORIES.map((cat) => {
    const spent = spentOf(cat.id);
    const budget = budgets[cat.id] ?? 0;
    const left = budget - spent;
    const biggest = transactionsIn(ui.month)
      .filter((t) => t.cat === cat.id && t.type === 'out')
      .sort((a, b) => b.amount - a.amount)[0];
    return `<article class="card budget-card">
      <div class="row-head"><h2>${catChip(cat)}</h2><span class="budget-pct">${pct(spent, budget)} used</span></div>
      ${bar(ratio(spent, budget), spent > budget ? '#d64541' : cat.color)}
      <p class="budget-nums"><strong>${money(spent)}</strong> spent · ${left >= 0 ? `${money(left)} left` : `<span class="over">${money(-left)} over</span>`}</p>
      <form class="budget-form" data-cat="${cat.id}">
        <label>Monthly budget $ <input type="number" name="budget" min="0" step="1" value="${budget}"></label>
        <button class="btn small" type="submit">Save</button>
      </form>
      <p class="note">${biggest ? `Biggest this month: ${esc(biggest.desc)} — ${money(biggest.amount)}` : 'Nothing spent in this category this month.'}</p>
    </article>`;
  }).join('');

  return `${monthBar(ui)}
  <p class="lede">The plan for the month is <strong>${moneyWhole(totalBudget)}</strong> across ${EXPENSE_CATEGORIES.length} categories;
  ${moneyWhole(totals.expenses)} is spent, so the household is at ${pct(totals.expenses, totalBudget)} of plan.
  A budget is a promise the family made in September — change one and every page hereafter uses the new figure.</p>
  <section class="budget-grid">${cards}</section>`;
}

// --- Goals --------------------------------------------------------------------

export function viewGoals() {
  const goals = getState().goals;
  const totalSaved = goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const cards = goals.map((g) => `<article class="card goal-card">
      <div class="row-head"><h2>${esc(g.name)}</h2><span class="budget-pct">${pct(g.saved, g.target)}</span></div>
      ${bar(ratio(g.saved, g.target), '#2e9e5b')}
      <p class="budget-nums"><strong>${money(g.saved)}</strong> of ${money(g.target)} · ${money(g.target - g.saved)} to go</p>
      <p class="note">${esc(g.note)}</p>
      <form class="goal-add" data-id="${g.id}">
        <label>Add $ <input type="number" name="amount" min="1" step="1" value="50"></label>
        <button class="btn small primary" type="submit">Add funds</button>
        <button class="btn small danger" type="button" data-action="del-goal" data-id="${g.id}">Remove</button>
      </form>
    </article>`).join('');

  return `<div class="month-bar"><h1>Savings goals</h1></div>
  <p class="lede">Together the family has put aside <strong>${moneyWhole(totalSaved)}</strong> of the ${moneyWhole(totalTarget)} these goals ask for.
  Adding funds here is the plan's side of the bargain: it marks money as spoken for, so the Overview's “left to budget” is not spent twice.</p>
  <section class="budget-grid">${cards || '<article class="card"><p>No goals yet. Start one below.</p></article>'}</section>
  <section class="card">
    <h2>Start a new goal</h2>
    <form id="goal-form" class="tx-form">
      <label class="grow">Name <input type="text" name="name" required maxlength="60" placeholder="e.g. A bike for Leo"></label>
      <label>Target $ <input type="number" name="target" required min="1" step="1" placeholder="500"></label>
      <label class="grow">Why <input type="text" name="note" maxlength="90" placeholder="One line on what it is for"></label>
      <span class="form-btns"><button class="btn primary" type="submit">Start goal</button></span>
    </form>
  </section>`;
}

// --- Insights -------------------------------------------------------------------

export function viewInsights(ui) {
  const totals = monthTotals(ui.month);
  const byCat = spendingByCategory(ui.month);
  const biggest = biggestExpenses(ui.month, 5);
  const monthKeys = [...new Set(getState().transactions.map((t) => monthKeyOf(t.date)))]
    .filter((k) => k <= ui.month).sort().slice(-6);
  const trend = monthKeys.map((k) => {
    const t = monthTotals(k);
    return { key: k, label: monthLabel(k).slice(0, 3), income: t.income, expenses: t.expenses };
  });
  const top = byCat[0];
  const kept = totals.income ? Math.round((totals.left / totals.income) * 100) : 0;

  const catRows = byCat.map((row) => {
    const budget = getState().budgets[row.cat.id] ?? 0;
    const diff = budget - row.total;
    return `<tr><td>${catChip(row.cat)}</td><td class="num">${money(row.total)}</td>
      <td class="num">${pct(row.total, totals.expenses)}</td><td class="num">${moneyWhole(budget)}</td>
      <td class="num ${diff < 0 ? 'over' : ''}">${diff >= 0 ? `${moneyWhole(diff)} under` : `${moneyWhole(-diff)} over`}</td></tr>`;
  }).join('');
  const bigRows = biggest.map((t) => `<li>
      <span class="tx-date">${shortDate(t.date)}</span>
      <span class="tx-desc">${esc(t.desc)}</span>
      <span class="tx-amt out">−${money(t.amount)}</span></li>`).join('');

  return `${monthBar(ui)}
  <section class="card">
    <h2>Money in and out, month by month</h2>
    <canvas id="chart-trend" class="chart"></canvas>
    <p class="legend-inline"><span class="dot" style="background:#2e9e5b"></span> Money in
    <span class="dot" style="background:#d96f32"></span> Money out</p>
    <p class="note">${top ? `${esc(top.cat.name)} took ${pct(top.total, totals.expenses)} of ${monthLabel(ui.month)}'s spending — ${money(top.total)} of ${money(totals.expenses)}.` : 'Nothing spent this month.'}
    The household kept ${money(totals.left)} of the ${money(totals.income)} that came in — a savings rate of ${kept}% for the month.</p>
  </section>
  <section class="grid-2">
    <article class="card">
      <h2>Where the money went</h2>
      <div class="table-wrap"><table class="tx-table">
        <thead><tr><th>Category</th><th class="num">Spent</th><th class="num">Share</th><th class="num">Budget</th><th class="num">Against budget</th></tr></thead>
        <tbody>${catRows || '<tr><td colspan="5">Nothing spent this month.</td></tr>'}</tbody>
      </table></div>
    </article>
    <article class="card">
      <h2>Biggest single payments</h2>
      <ul class="tx-list">${bigRows || '<li>Nothing spent this month.</li>'}</ul>
      <p class="note">One line each, largest first — the fastest way to see whether a month's story is the rent, a repair, or a run of small things.</p>
    </article>
  </section>`;
}

// --- Data -----------------------------------------------------------------------

export function viewData(ui) {
  const s = getState();
  return `<div class="month-bar"><h1>Your data</h1></div>
  <section class="card">
    <h2>Stored on this device, nowhere else</h2>
    <p>The books hold <strong>${s.transactions.length} transactions</strong>, ${Object.keys(s.budgets).length} category budgets,
    ${s.goals.length} savings goals and ${s.bills.length} regular bills. They are kept in this browser's local storage
    under the key <code>hearthside-budget-v1</code>; the site has no account and sends nothing anywhere — it works
    with the network unplugged, and the figures leave only when you export them.</p>
    <div class="data-actions">
      <button class="btn primary" data-action="export-json">Export a backup (.json)</button>
      <button class="btn" data-action="export-csv">Export transactions (.csv)</button>
      <label class="btn file-btn">Import a backup <input type="file" id="import-file" accept=".json,application/json" hidden></label>
      ${ui.confirmReset
        ? '<button class="btn danger" data-action="reset-do">Click again to erase and restore the demo books</button>'
        : '<button class="btn" data-action="reset-arm">Restore the demo books…</button>'}
    </div>
    <p class="note">Importing replaces the books with the backup's contents. Restoring the demo books erases every
    change made on this device and brings back the Alvarez family's September-to-November ledger exactly as it shipped.</p>
  </section>`;
}

// --- chart mounting ---------------------------------------------------------------

export function mountCharts(route, ui) {
  if (route === 'overview') {
    const canvas = document.getElementById('chart-donut');
    if (canvas) {
      const totals = monthTotals(ui.month);
      const slices = spendingByCategory(ui.month).map((row) => ({ value: row.total, color: row.cat.color }));
      donutChart(canvas, slices, moneyWhole(totals.expenses), 'spent this month');
    }
  }
  if (route === 'insights') {
    const canvas = document.getElementById('chart-trend');
    if (canvas) {
      const monthKeys = [...new Set(getState().transactions.map((t) => monthKeyOf(t.date)))]
        .filter((k) => k <= ui.month).sort().slice(-6);
      const months = monthKeys.map((k) => {
        const t = monthTotals(k);
        return { label: monthLabel(k).slice(0, 3), income: t.income, expenses: t.expenses };
      });
      trendChart(canvas, months);
    }
  }
}
