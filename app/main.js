// main.js — the wiring: which page the address asks for, drawing it, and
// answering every click, form and keypress the pages offer. All figures and
// changes go through store.js; this file only routes and renders.

import {
  getState, latestMonth, shiftMonth, addTransaction, updateTransaction,
  deleteTransaction, setBudget, addGoal, addToGoal, deleteGoal,
  resetToSeed, replaceState,
} from './store.js';
import {
  viewOverview, viewTransactions, viewBudgets, viewGoals, viewInsights,
  viewData, mountCharts,
} from './views.js';

const app = document.getElementById('app');

// Screen state that is not part of the books: the month on show, the
// transaction filters, the row being edited, and the armed reset button.
const ui = {
  month: latestMonth(),
  q: '',
  fcat: 'all',
  ftype: 'all',
  editing: null,
  confirmReset: false,
};

const VIEWS = {
  overview: viewOverview,
  transactions: viewTransactions,
  budgets: viewBudgets,
  goals: viewGoals,
  insights: viewInsights,
  data: viewData,
};

function route() {
  const name = location.hash.replace(/^#\/?/, '').split('/')[0];
  return VIEWS[name] ? name : 'overview';
}

function render() {
  const current = route();
  document.querySelectorAll('[data-nav]').forEach((link) => {
    link.classList.toggle('active', link.dataset.nav === current);
  });
  app.innerHTML = VIEWS[current](ui);
  mountCharts(current, ui);
  window.scrollTo(0, 0);
}

// --- downloads and uploads ------------------------------------------------------

function download(filename, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportJson() {
  download('hearthside-backup.json', JSON.stringify(getState(), null, 2), 'application/json');
}

function exportCsv() {
  const quote = (v) => `"${String(v).replaceAll('"', '""')}"`;
  const lines = ['date,description,category,kind,amount'];
  const sorted = [...getState().transactions].sort((a, b) => (a.date < b.date ? -1 : 1));
  for (const t of sorted) lines.push([t.date, quote(t.desc), t.cat, t.type, t.amount.toFixed(2)].join(','));
  download('hearthside-transactions.csv', lines.join('\n'), 'text/csv');
}

function importFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      if (!parsed || !Array.isArray(parsed.transactions) || !parsed.budgets || !Array.isArray(parsed.goals)) {
        throw new Error('not a Hearthside backup');
      }
      replaceState(parsed);
      ui.month = latestMonth();
      ui.editing = null;
      render();
    } catch {
      alert('That file is not a Hearthside Budget backup — nothing was changed.');
    }
  };
  reader.readAsText(file);
}

// --- events -----------------------------------------------------------------------

app.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const { action, id } = button.dataset;
  if (action === 'month-prev') { ui.month = shiftMonth(ui.month, -1); ui.editing = null; }
  if (action === 'month-next') { ui.month = shiftMonth(ui.month, 1); ui.editing = null; }
  if (action === 'edit-tx') { ui.editing = id; render(); return; }
  if (action === 'cancel-edit') { ui.editing = null; }
  if (action === 'del-tx') {
    deleteTransaction(id);
    if (ui.editing === id) ui.editing = null;
  }
  if (action === 'del-goal') deleteGoal(id);
  if (action === 'export-json') { exportJson(); return; }
  if (action === 'export-csv') { exportCsv(); return; }
  if (action === 'reset-arm') { ui.confirmReset = true; render(); return; }
  if (action === 'reset-do') {
    resetToSeed();
    ui.month = latestMonth();
    ui.confirmReset = false;
    ui.editing = null;
  }
  render();
});

app.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.target;
  const data = new FormData(form);

  if (form.id === 'tx-form') {
    const entry = {
      date: String(data.get('date')),
      desc: String(data.get('desc')).trim(),
      cat: String(data.get('cat')),
      amount: Math.round(Number(data.get('amount')) * 100) / 100,
    };
    if (!entry.date || !entry.desc || !(entry.amount > 0)) return;
    if (ui.editing) {
      updateTransaction(ui.editing, entry);
      ui.editing = null;
    } else {
      addTransaction(entry);
      ui.month = entry.date.slice(0, 7);
    }
    render();
    return;
  }
  if (form.classList.contains('budget-form')) {
    const amount = Number(data.get('budget'));
    if (Number.isFinite(amount) && amount >= 0) setBudget(form.dataset.cat, amount);
    render();
    return;
  }
  if (form.classList.contains('goal-add')) {
    const amount = Number(data.get('amount'));
    if (Number.isFinite(amount) && amount > 0) addToGoal(form.dataset.id, amount);
    render();
    return;
  }
  if (form.id === 'goal-form') {
    const name = String(data.get('name')).trim();
    const target = Number(data.get('target'));
    if (name && target > 0) {
      addGoal({ name, target, note: String(data.get('note') ?? '').trim() });
    }
    render();
  }
});

// Typing in the search box re-renders the list but keeps the caret in place.
app.addEventListener('input', (event) => {
  if (event.target.id !== 'tx-search') return;
  ui.q = event.target.value;
  render();
  const search = document.getElementById('tx-search');
  search.focus();
  search.setSelectionRange(search.value.length, search.value.length);
});

app.addEventListener('change', (event) => {
  if (event.target.id === 'tx-fcat') { ui.fcat = event.target.value; render(); }
  if (event.target.id === 'tx-ftype') { ui.ftype = event.target.value; render(); }
  if (event.target.id === 'import-file' && event.target.files[0]) importFile(event.target.files[0]);
});

window.addEventListener('hashchange', render);
window.addEventListener('resize', () => mountCharts(route(), ui));
render();
