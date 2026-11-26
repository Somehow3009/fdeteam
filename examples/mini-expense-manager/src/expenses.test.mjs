import test from 'node:test';
import assert from 'node:assert/strict';
import { addExpense, totalExpenses, filterExpensesByDateRange, expensesToCsv } from './expenses.mjs';

test('adds a validated expense immutably and totals amounts', () => {
  const initial = [];
  const next = addExpense(initial, { description: ' Lunch ', amount: 12.5, date: '2026-11-26' });
  assert.deepEqual(initial, []);
  assert.equal(next[0].description, 'Lunch');
  assert.equal(totalExpenses(next), 12.5);
});

test('rejects non-positive amounts', () => {
  assert.throws(() => addExpense([], { description: 'Invalid', amount: 0, date: '2026-11-26' }), RangeError);
});

test('filters dates inclusively and permits a single boundary', () => {
  const expenses = ['2026-04-01', '2026-04-15', '2026-04-30'].map(date => ({ date, description: 'Meal', amount: 3 }));
  assert.deepEqual(filterExpensesByDateRange(expenses, { startDate: '2026-04-15', endDate: '2026-04-30' }), expenses.slice(1));
  assert.deepEqual(filterExpensesByDateRange(expenses, { endDate: '2026-04-01' }), expenses.slice(0, 1));
  assert.throws(() => filterExpensesByDateRange(expenses, { startDate: '2026-04-20', endDate: '2026-04-10' }), RangeError);
  assert.throws(() => filterExpensesByDateRange(expenses, { startDate: '2026-02-30' }), TypeError);
});

test('exports escaped CSV with header for empty results and formula neutralization', () => {
  assert.equal(expensesToCsv([]), 'date,description,amount');
  assert.equal(expensesToCsv([{ date: '2026-04-01', description: 'Lunch, "team"', amount: 12 }, { date: '2026-04-02', description: '=1+1', amount: 4 }]), 'date,description,amount\r\n2026-04-01,"Lunch, ""team""",12\r\n2026-04-02,\'=1+1,4');
});
