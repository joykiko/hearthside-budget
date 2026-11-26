// store.js — the household's books: loading and saving the state, the
// changes the pages make to it, and the sums every page reads. State lives
// in the browser's localStorage; on a device with nothing stored, the seed
// ledger from data.js is used. No state leaves the device.

import { buildSeedState, categoryById } from './data.js';

const STORE_KEY = 'hearthside-budget-v1';

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.transactions)) return parsed;
    }
  } catch {
    // A stored value that does not parse is worth nothing; start from seed.
  }
  return buildSeedState();
}

function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be full or blocked; the site keeps working in memory.
  }
}

export function getState() {
  return state;
}

export function resetToSeed() {
  state = buildSeedState();
  save();
  return state;
}

export function replaceState(next) {
  state = next;
  save();
  return state;
}

// --- months ---------------------------------------------------------------

// '2026-11-04' -> '2026-11'
export function monthKeyOf(isoDate) {
  return isoDate.slice(0, 7);
}

// Shift a 'YYYY-MM' key by whole months: shiftMonth('2026-11', -1) -> '2026-10'
export function shiftMonth(monthKey, by) {
  const [year, month] = monthKey.split('-').map(Number);
  const d = new Date(year, month - 1 + by, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// The latest month the ledger holds — the month the site opens on, so the
// first screen is never an empty future month.
export function latestMonth() {
  let latest = '2026-11';
  for (const t of state.transactions) {
    const key = monthKeyOf(t.date);
    if (key > latest) latest = key;
  }
  return latest;
}

// The last n month keys ending at (and including) the given one, oldest first.
export function recentMonths(endKey, n) {
  const keys = [];
  for (let i = n - 1; i >= 0; i--) keys.push(shiftMonth(endKey, -i));
  return keys;
}

// --- reading the books ------------------------------------------------------

export function transactionsIn(monthKey) {
  return state.transactions
    .filter((t) => monthKeyOf(t.date) === monthKey)
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

export function sumWhere(list, pred) {
  return list.reduce((total, t) => (pred(t) ? total + t.amount : total), 0);
}

export function monthTotals(monthKey) {
  const list = transactionsIn(monthKey);
  const income = sumWhere(list, (t) => t.type === 'in');
  const expenses = sumWhere(list, (t) => t.type === 'out');
  return { income, expenses, left: income - expenses, count: list.length };
}

// Spending per expense category in a month: [{cat, total}], largest first.
export function spendingByCategory(monthKey) {
  const totals = new Map();
  for (const t of transactionsIn(monthKey)) {
    if (t.type !== 'out') continue;
    totals.set(t.cat, (totals.get(t.cat) ?? 0) + t.amount);
  }
  return [...totals.entries()]
    .map(([cat, total]) => ({ cat: categoryById(cat), total }))
    .sort((a, b) => b.total - a.total);
}

// The n largest expenses of a month, largest first.
export function biggestExpenses(monthKey, n) {
  return transactionsIn(monthKey)
    .filter((t) => t.type === 'out')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, n);
}

// Bills coming due from a date, soonest first: [{bill, due, inDays}].
export function upcomingBills(fromDate = new Date()) {
  const today = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  return state.bills
    .map((bill) => {
      let due = new Date(today.getFullYear(), today.getMonth(), bill.dueDay);
      if (due < today) due = new Date(today.getFullYear(), today.getMonth() + 1, bill.dueDay);
      const inDays = Math.round((due - today) / 86400000);
      return { bill, due, inDays };
    })
    .sort((a, b) => a.due - b.due);
}

// --- changing the books -----------------------------------------------------

let idCounter = 0;
function nextId(prefix) {
  idCounter += 1;
  return `${prefix}${Date.now().toString(36)}${idCounter}`;
}

export function addTransaction({ date, desc, cat, amount }) {
  const entry = {
    id: nextId('t'),
    date,
    desc,
    cat,
    type: categoryById(cat).kind === 'income' ? 'in' : 'out',
    amount,
  };
  state.transactions.push(entry);
  save();
  return entry;
}

export function updateTransaction(id, { date, desc, cat, amount }) {
  const entry = state.transactions.find((t) => t.id === id);
  if (!entry) return null;
  Object.assign(entry, {
    date, desc, cat, amount,
    type: categoryById(cat).kind === 'income' ? 'in' : 'out',
  });
  save();
  return entry;
}

export function deleteTransaction(id) {
  state.transactions = state.transactions.filter((t) => t.id !== id);
  save();
}

export function setBudget(catId, amount) {
  state.budgets[catId] = amount;
  save();
}

export function addGoal({ name, target, note }) {
  const goal = { id: nextId('g'), name, target, saved: 0, note: note ?? '' };
  state.goals.push(goal);
  save();
  return goal;
}

export function addToGoal(id, amount) {
  const goal = state.goals.find((g) => g.id === id);
  if (!goal) return null;
  goal.saved = Math.min(goal.target, Math.round((goal.saved + amount) * 100) / 100);
  save();
  return goal;
}

export function deleteGoal(id) {
  state.goals = state.goals.filter((g) => g.id !== id);
  save();
}
