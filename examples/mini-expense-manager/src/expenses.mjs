export function addExpense(expenses, expense) {
  if (!expense || typeof expense.description !== 'string' || !expense.description.trim()) throw new TypeError('description is required');
  if (!Number.isFinite(expense.amount) || expense.amount <= 0) throw new RangeError('amount must be a positive number');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(expense.date) || Number.isNaN(Date.parse(`${expense.date}T00:00:00Z`))) throw new TypeError('date must use YYYY-MM-DD');
  return [...expenses, { description: expense.description.trim(), amount: expense.amount, date: expense.date }];
}

export function totalExpenses(expenses) {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
}
