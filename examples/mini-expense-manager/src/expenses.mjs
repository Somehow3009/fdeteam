export function addExpense(expenses, expense) {
  if (!expense || typeof expense.description !== 'string' || !expense.description.trim()) throw new TypeError('description is required');
  if (!Number.isFinite(expense.amount) || expense.amount <= 0) throw new RangeError('amount must be a positive number');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(expense.date) || Number.isNaN(Date.parse(`${expense.date}T00:00:00Z`))) throw new TypeError('date must use YYYY-MM-DD');
  return [...expenses, { description: expense.description.trim(), amount: expense.amount, date: expense.date }];
}

export function totalExpenses(expenses) {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
}

function isIsoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

export function filterExpensesByDateRange(expenses, { startDate = '', endDate = '' } = {}) {
  if (startDate && !isIsoDate(startDate)) throw new TypeError('startDate must be a valid YYYY-MM-DD date');
  if (endDate && !isIsoDate(endDate)) throw new TypeError('endDate must be a valid YYYY-MM-DD date');
  if (startDate && endDate && startDate > endDate) throw new RangeError('Start date must be on or before end date');
  return expenses.filter(expense => (!startDate || expense.date >= startDate) && (!endDate || expense.date <= endDate));
}

function csvField(value) {
  let text = String(value ?? '');
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  if (/[",\r\n]/.test(text)) text = `"${text.replaceAll('"', '""')}"`;
  return text;
}

export function expensesToCsv(expenses) {
  return ['date,description,amount', ...expenses.map(expense => [expense.date, expense.description, expense.amount].map(csvField).join(','))].join('\r\n');
}
