import { addExpense, filterExpensesByDateRange, expensesToCsv, totalExpenses } from './expenses.mjs';

let expenses = [
  { description: 'Coffee', amount: 4.5, date: '2026-04-01' },
  { description: 'Team lunch', amount: 28, date: '2026-04-15' },
  { description: 'Transit', amount: 7.25, date: '2026-04-30' }
];
let visible = expenses;
const body = document.querySelector('#expenses');
const message = document.querySelector('#message');

function render(rows) {
  body.replaceChildren(...rows.map(expense => {
    const row = document.createElement('tr');
    for (const value of [expense.date, expense.description, expense.amount.toFixed(2)]) {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.append(cell);
    }
    return row;
  }));
  document.querySelector('#total').textContent = totalExpenses(rows).toFixed(2);
}

function applyFilter() {
  try {
    const rows = filterExpensesByDateRange(expenses, { startDate: document.querySelector('#start-date').value, endDate: document.querySelector('#end-date').value });
    visible = rows;
    message.textContent = '';
    render(visible);
  } catch (error) {
    message.textContent = error.message;
  }
}

document.querySelector('#start-date').addEventListener('change', applyFilter);
document.querySelector('#end-date').addEventListener('change', applyFilter);
document.querySelector('#add-expense').addEventListener('submit', event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  try {
    expenses = addExpense(expenses, { description: form.get('description'), amount: Number(form.get('amount')), date: form.get('date') });
    event.currentTarget.reset();
    applyFilter();
  } catch (error) { message.textContent = error.message; }
});
document.querySelector('#export-csv').addEventListener('click', () => {
  const blob = new Blob([expensesToCsv(visible)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = Object.assign(document.createElement('a'), { href: url, download: 'expenses.csv' });
  anchor.click();
  URL.revokeObjectURL(url);
});
render(visible);
