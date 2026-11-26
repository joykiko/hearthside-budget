// format.js — turning numbers and dates into the words the site shows.
// Nothing here touches state; every function is a pure conversion.

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const usdWhole = new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD', maximumFractionDigits: 0,
});

// $1,234.56 — for tables and transaction rows, where cents matter.
export function money(amount) {
  return usd.format(amount);
}

// $1,235 — for cards and chart labels, where whole dollars read faster.
export function moneyWhole(amount) {
  return usdWhole.format(amount);
}

// '2026-11' -> 'November 2026'
export function monthLabel(monthKey) {
  const [year, month] = monthKey.split('-').map(Number);
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

// '2026-11-04' -> 'Tue 4 Nov'
export function shortDate(isoDate) {
  const date = new Date(`${isoDate}T12:00:00`);
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
  return `${weekday} ${date.getDate()} ${MONTH_NAMES[date.getMonth()].slice(0, 3)}`;
}

// '2026-11-04' -> '4 November 2026'
export function longDate(isoDate) {
  const date = new Date(`${isoDate}T12:00:00`);
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

// A share as a whole percent: pct(320, 800) -> '40%'
export function pct(part, whole) {
  if (!whole) return '0%';
  return `${Math.round((part / whole) * 100)}%`;
}

// A ratio clamped to the 0..1 a progress bar can draw.
export function ratio(part, whole) {
  if (!whole) return 0;
  return Math.min(1, Math.max(0, part / whole));
}
