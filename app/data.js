// data.js — the household itself: the categories money moves through, the
// budget the family set for each, its savings goals and regular bills, and
// the seed ledger (September to November 2026) the site opens with before
// anything is stored. The figures are one household's real-shaped month:
// two salaries in, rent out on the 1st, the weekly shop, the small leaks.

export const CATEGORIES = [
  { id: 'salary', name: 'Salary', kind: 'income', color: '#15803d' },
  { id: 'side', name: 'Side income', kind: 'income', color: '#65a30d' },
  { id: 'housing', name: 'Housing', kind: 'expense', color: '#3b82f6' },
  { id: 'groceries', name: 'Groceries', kind: 'expense', color: '#22c55e' },
  { id: 'dining', name: 'Dining out', kind: 'expense', color: '#f59e0b' },
  { id: 'transport', name: 'Transport', kind: 'expense', color: '#06b6d4' },
  { id: 'utilities', name: 'Utilities', kind: 'expense', color: '#6366f1' },
  { id: 'health', name: 'Health', kind: 'expense', color: '#ef4444' },
  { id: 'kids', name: 'Kids', kind: 'expense', color: '#f97316' },
  { id: 'fun', name: 'Fun', kind: 'expense', color: '#a855f7' },
  { id: 'subscriptions', name: 'Subscriptions', kind: 'expense', color: '#64748b' },
  { id: 'other', name: 'Other', kind: 'expense', color: '#78716c' },
];

export function categoryById(id) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}

export const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => c.kind === 'expense');
export const INCOME_CATEGORIES = CATEGORIES.filter((c) => c.kind === 'income');

// The monthly budget the family agreed for each expense category (USD).
const SEED_BUDGETS = {
  housing: 1950, groceries: 700, dining: 160, transport: 260, utilities: 320,
  health: 200, kids: 260, fun: 120, subscriptions: 60, other: 150,
};

const SEED_GOALS = [
  { id: 'g1', name: 'Emergency fund', target: 10000, saved: 6420, note: 'Six months of essentials, kept in the savings account.' },
  { id: 'g2', name: 'Coast trip — spring break', target: 2400, saved: 1150, note: 'Five days in April; the rental deposit is due in February.' },
  { id: 'g3', name: 'A laptop for Maya', target: 1200, saved: 860, note: 'The current one is six years old and very loud.' },
];

// Regular bills, by the day of the month each falls due. The amount is the
// last bill paid, so the Overview can show what is about to leave.
const SEED_BILLS = [
  { id: 'b1', name: 'Rent — 14 Maple Street', amount: 1850.00, dueDay: 1, cat: 'housing' },
  { id: 'b2', name: 'Electric — City Power', amount: 96.40, dueDay: 28, cat: 'utilities' },
  { id: 'b3', name: 'Internet — Fiber 300', amount: 59.99, dueDay: 9, cat: 'utilities' },
  { id: 'b4', name: 'Phone — two lines', amount: 88.00, dueDay: 18, cat: 'utilities' },
  { id: 'b5', name: 'Car insurance', amount: 142.00, dueDay: 6, cat: 'transport' },
];

// The seed ledger: [date, description, category, amount] with the sign read
// from the category's kind. November is the month in progress (to the 25th,
// the day this snapshot was taken); September and October are complete.
const SEED_ROWS = [
  // September 2026
  ['2026-09-01', 'Rent — 14 Maple Street', 'housing', 1850.00],
  ['2026-09-02', 'Salary — Daniel (Northwind Studio)', 'salary', 4350.00],
  ['2026-09-02', 'Electric bill — August use', 'utilities', 102.60],
  ['2026-09-03', 'FreshMart — weekly shop', 'groceries', 135.60],
  ['2026-09-05', 'Back-to-school — clothes and bags', 'kids', 112.40],
  ['2026-09-05', 'StreamFlix', 'subscriptions', 15.99],
  ['2026-09-09', 'Internet — Fiber 300', 'utilities', 59.99],
  ['2026-09-10', 'Green Grocer — vegetables and fruit', 'groceries', 88.25],
  ['2026-09-12', 'Music — family plan', 'subscriptions', 11.99],
  ['2026-09-13', 'Salary — Maya (City Clinic)', 'salary', 2980.00],
  ['2026-09-13', 'Water and sewer', 'utilities', 44.10],
  ['2026-09-15', 'Checkup copay — Daniel', 'health', 64.00],
  ['2026-09-17', 'FreshMart — weekly shop', 'groceries', 126.90],
  ['2026-09-18', 'Phone plan — two lines', 'utilities', 88.00],
  ['2026-09-19', 'Cloud storage — 200 GB', 'subscriptions', 9.99],
  ['2026-09-20', 'Fuel — Shell on 5th', 'transport', 47.30],
  ['2026-09-22', 'Market Basket — pantry restock', 'groceries', 99.80],
  ['2026-09-23', 'Workout app — annual, monthly share', 'subscriptions', 12.00],
  ['2026-09-25', 'Renters insurance', 'housing', 32.00],
  ['2026-09-26', 'Bowling — Leo’s birthday', 'fun', 22.00],
  ['2026-09-27', 'Household bits — bulbs, batteries, hooks', 'other', 45.60],
  ['2026-09-28', 'Transit passes — October', 'transport', 68.00],
  ['2026-09-29', 'Dinner — Casa Verde, anniversary', 'dining', 39.80],
  // October 2026
  ['2026-10-01', 'Rent — 14 Maple Street', 'housing', 1850.00],
  ['2026-10-02', 'Salary — Daniel (Northwind Studio)', 'salary', 4350.00],
  ['2026-10-02', 'Electric bill — September use', 'utilities', 88.15],
  ['2026-10-03', 'FreshMart — weekly shop', 'groceries', 128.40],
  ['2026-10-05', 'StreamFlix', 'subscriptions', 15.99],
  ['2026-10-07', 'Fuel — Shell on 5th', 'transport', 46.20],
  ['2026-10-09', 'Internet — Fiber 300', 'utilities', 59.99],
  ['2026-10-10', 'Green Grocer — vegetables and fruit', 'groceries', 91.75],
  ['2026-10-12', 'Music — family plan', 'subscriptions', 11.99],
  ['2026-10-13', 'Salary — Maya (City Clinic)', 'salary', 2980.00],
  ['2026-10-13', 'Water and sewer', 'utilities', 39.80],
  ['2026-10-15', 'Coffee — Blue Door Café', 'dining', 15.20],
  ['2026-10-17', 'FreshMart — weekly shop', 'groceries', 118.20],
  ['2026-10-18', 'Phone plan — two lines', 'utilities', 88.00],
  ['2026-10-19', 'Cloud storage — 200 GB', 'subscriptions', 9.99],
  ['2026-10-20', 'Tutoring — one student', 'side', 180.00],
  ['2026-10-21', 'Pharmacy — prescriptions', 'health', 22.90],
  ['2026-10-22', 'Fuel — Shell on 5th', 'transport', 43.55],
  ['2026-10-23', 'Workout app — annual, monthly share', 'subscriptions', 12.00],
  ['2026-10-24', 'Market Basket — pantry restock', 'groceries', 104.55],
  ['2026-10-25', 'Renters insurance', 'housing', 32.00],
  ['2026-10-25', 'School trip contribution — Sofia', 'kids', 25.00],
  ['2026-10-26', 'School supplies — art materials', 'kids', 29.99],
  ['2026-10-27', 'Family dinner — Sushi Go', 'dining', 47.30],
  ['2026-10-28', 'Transit passes — November', 'transport', 68.00],
  ['2026-10-30', 'Light bulbs and a door seal', 'other', 21.30],
  // November 2026, to the 25th
  ['2026-11-01', 'Rent — 14 Maple Street', 'housing', 1850.00],
  ['2026-11-02', 'Salary — Daniel (Northwind Studio)', 'salary', 4350.00],
  ['2026-11-02', 'Electric bill — October use', 'utilities', 96.40],
  ['2026-11-03', 'FreshMart — weekly shop', 'groceries', 132.18],
  ['2026-11-03', 'Coffee — Blue Door Café', 'dining', 12.40],
  ['2026-11-04', 'Fuel — Shell on 5th', 'transport', 48.60],
  ['2026-11-05', 'StreamFlix', 'subscriptions', 15.99],
  ['2026-11-06', 'Pharmacy — prescriptions', 'health', 27.45],
  ['2026-11-07', 'Green Grocer — vegetables and fruit', 'groceries', 86.30],
  ['2026-11-08', 'Noodle House — family dinner', 'dining', 42.75],
  ['2026-11-08', 'Bus fares — week pass top-up', 'transport', 17.50],
  ['2026-11-09', 'Internet — Fiber 300', 'utilities', 59.99],
  ['2026-11-10', 'School supplies — notebooks, pens', 'kids', 38.20],
  ['2026-11-10', 'Bookshop — two paperbacks', 'fun', 24.99],
  ['2026-11-11', 'Fuel — Shell on 5th', 'transport', 44.10],
  ['2026-11-12', 'Bakery — bread and pastries', 'groceries', 16.85],
  ['2026-11-12', 'Music — family plan', 'subscriptions', 11.99],
  ['2026-11-13', 'Salary — Maya (City Clinic)', 'salary', 2980.00],
  ['2026-11-13', 'Water and sewer', 'utilities', 41.25],
  ['2026-11-14', 'FreshMart — weekly shop', 'groceries', 121.66],
  ['2026-11-15', 'Dentist — copay, Sofia', 'health', 60.00],
  ['2026-11-16', 'Soccer league fee — Leo', 'kids', 75.00],
  ['2026-11-16', 'Pharmacy — vitamins and first aid', 'health', 18.75],
  ['2026-11-17', 'Cinema — family movie night', 'fun', 36.00],
  ['2026-11-18', 'Phone plan — two lines', 'utilities', 88.00],
  ['2026-11-18', 'Birthday gift — Maya’s sister', 'other', 30.00],
  ['2026-11-19', 'Tutoring — two students', 'side', 240.00],
  ['2026-11-19', 'Cloud storage — 200 GB', 'subscriptions', 9.99],
  ['2026-11-20', 'Market Basket — pantry restock', 'groceries', 98.44],
  ['2026-11-21', 'Pizza — Tony’s, kids’ night', 'dining', 38.50],
  ['2026-11-21', 'Fuel — Shell on 5th', 'transport', 41.85],
  ['2026-11-22', 'Transit passes — December', 'transport', 68.00],
  ['2026-11-23', 'Workout app — annual, monthly share', 'subscriptions', 12.00],
  ['2026-11-23', 'Shoes — Sofia, school pair', 'kids', 49.99],
  ['2026-11-24', 'FreshMart — weekly shop', 'groceries', 110.27],
  ['2026-11-25', 'Hardware store — faucet repair kit', 'other', 54.90],
  ['2026-11-25', 'Renters insurance', 'housing', 32.00],
];

// The state the site opens with on a device that has stored nothing yet.
export function buildSeedState() {
  return {
    transactions: SEED_ROWS.map(([date, desc, cat, amount], i) => ({
      id: `t${i + 1}`,
      date,
      desc,
      cat,
      type: categoryById(cat).kind === 'income' ? 'in' : 'out',
      amount,
    })),
    budgets: { ...SEED_BUDGETS },
    goals: SEED_GOALS.map((g) => ({ ...g })),
    bills: SEED_BILLS.map((b) => ({ ...b })),
  };
}
