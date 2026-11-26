import test from 'node:test';
import assert from 'node:assert/strict';
import { addExpense, totalExpenses } from './expenses.mjs';

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
