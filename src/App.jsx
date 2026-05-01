// App.jsx — The entire Finance Tracker lives here.
//
// Concepts used (great for learning!):
//   - useState  : stores values that can change (like our list of transactions)
//   - useEffect : runs code at specific times (here: load/save from localStorage)
//   - .map()    : loops over an array and renders a component for each item
//   - .filter() : creates a new array with only items that match a condition
//   - .reduce() : adds up values in an array (used to calculate totals)

import { useState, useEffect } from 'react'

// ─── Helper: format a number as Indian Rupees ─────────────────────────────────
// Example: formatCurrency(1500) → "₹1,500.00"
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount)
}

// ─── Component: SummaryCard ───────────────────────────────────────────────────
// Displays one of the three summary boxes at the top (Balance / Income / Expense).
// Props (inputs passed from the parent):
//   - title  : the label text, e.g. "Total Balance"
//   - amount : the number to display
//   - color  : a Tailwind text-color class to make each card look different
function SummaryCard({ title, amount, color }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-1 flex-1 min-w-[160px]">
      <span className="text-sm font-medium text-gray-500">{title}</span>
      <span className={`text-2xl font-bold ${color}`}>
        {formatCurrency(amount)}
      </span>
    </div>
  )
}

// ─── Component: TransactionItem ───────────────────────────────────────────────
// Renders a single row in the transaction history list.
// Props:
//   - transaction : one transaction object { id, description, amount, type }
//   - onDelete    : a function to call when the Delete button is clicked
function TransactionItem({ transaction, onDelete }) {
  // Pick green for income, red for expense
  const isIncome = transaction.type === 'income'

  return (
    <div className="flex items-center justify-between bg-white rounded-xl shadow-sm px-4 py-3 border-l-4 transition-all hover:shadow-md"
      style={{ borderColor: isIncome ? '#22c55e' : '#ef4444' }}>

      {/* Left side: description and type badge */}
      <div className="flex flex-col">
        <span className="font-medium text-gray-800">{transaction.description}</span>
        <span className={`text-xs mt-0.5 font-semibold uppercase tracking-wide ${isIncome ? 'text-green-500' : 'text-red-500'}`}>
          {transaction.type}
        </span>
      </div>

      {/* Right side: amount and delete button */}
      <div className="flex items-center gap-4">
        <span className={`text-lg font-bold ${isIncome ? 'text-green-600' : 'text-red-500'}`}>
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
        </span>

        <button
          onClick={() => onDelete(transaction.id)}
          className="text-gray-400 hover:text-red-500 transition-colors text-sm font-medium px-2 py-1 rounded-lg hover:bg-red-50"
          aria-label="Delete transaction"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

// ─── Main Component: App ──────────────────────────────────────────────────────
// This is the root of the whole page. It manages all the state.
export default function App() {

  // ── State: list of all transactions ────────────────────────────────────────
  // We initialize it from localStorage so data survives page refresh.
  // JSON.parse turns the saved string back into a JavaScript array.
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('financeTransactions')
    return saved ? JSON.parse(saved) : []
  })

  // ── State: the three form input values ─────────────────────────────────────
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('income') // 'income' or 'expense'

  // ── Effect: save to localStorage whenever transactions change ───────────────
  // useEffect with [transactions] as dependency runs every time 'transactions' updates.
  // JSON.stringify turns the array into a string so we can store it.
  useEffect(() => {
    localStorage.setItem('financeTransactions', JSON.stringify(transactions))
  }, [transactions])

  // ── Calculated values (derived from the transactions array) ────────────────
  // .filter() keeps only income items, then .reduce() adds up their amounts.
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalBalance = totalIncome - totalExpense

  // ── Handler: add a new transaction ─────────────────────────────────────────
  function handleAddTransaction(e) {
    // Prevent the form from reloading the page (default HTML form behavior)
    e.preventDefault()

    // Basic validation: don't add if fields are empty or amount is not positive
    if (!description.trim() || !amount || Number(amount) <= 0) {
      alert('Please enter a valid description and a positive amount.')
      return
    }

    // Build the new transaction object
    const newTransaction = {
      id: Date.now(),           // unique ID using current timestamp
      description: description.trim(),
      amount: Number(amount),   // convert string to number
      type: type,               // 'income' or 'expense'
    }

    // Add the new transaction to the list (we spread the old array + add new item)
    setTransactions([newTransaction, ...transactions])

    // Reset the form fields
    setDescription('')
    setAmount('')
    setType('income')
  }

  // ── Handler: delete a transaction by its id ─────────────────────────────────
  function handleDelete(id) {
    // .filter() returns a new array that excludes the item with the matching id
    setTransactions(transactions.filter((t) => t.id !== id))
  }

  // ── Render (what the user actually sees) ────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-fuchsia-500 to-violet-600 py-10 px-4">

      {/* Page wrapper — max width so it doesn't stretch too wide on big screens */}
      <div className="max-w-2xl mx-auto flex flex-col gap-8">

        {/* ── Page Title ── */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-md">💰 Finance Tracker</h1>
          <p className="text-pink-100 mt-1 text-sm font-medium">Track your income and expenses easily</p>
        </div>

        {/* ── Section 1: Summary Cards ── */}
        <div className="flex flex-wrap gap-4">
          <SummaryCard
            title="Total Balance"
            amount={totalBalance}
            color={totalBalance >= 0 ? 'text-indigo-600' : 'text-red-600'}
          />
          <SummaryCard
            title="Total Income"
            amount={totalIncome}
            color="text-green-600"
          />
          <SummaryCard
            title="Total Expense"
            amount={totalExpense}
            color="text-red-500"
          />
        </div>

        {/* ── Section 2: Add Transaction Form ── */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Add New Transaction</h2>

          <form onSubmit={handleAddTransaction} className="flex flex-col gap-4">

            {/* Description input */}
            <div className="flex flex-col gap-1">
              <label htmlFor="description" className="text-sm font-medium text-gray-600">
                Description
              </label>
              <input
                id="description"
                type="text"
                placeholder="e.g. Freelance payment, Groceries..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              />
            </div>

            {/* Amount input */}
            <div className="flex flex-col gap-1">
              <label htmlFor="amount" className="text-sm font-medium text-gray-600">
                Amount (₹)
              </label>
              <input
                id="amount"
                type="number"
                placeholder="e.g. 500"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              />
            </div>

            {/* Type: Radio buttons for Income vs Expense */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-600">Type</span>
              <div className="flex gap-6">

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="income"
                    checked={type === 'income'}
                    onChange={() => setType('income')}
                    className="accent-green-500 w-4 h-4"
                  />
                  <span className="text-sm text-green-700 font-semibold">Income</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="expense"
                    checked={type === 'expense'}
                    onChange={() => setType('expense')}
                    className="accent-red-500 w-4 h-4"
                  />
                  <span className="text-sm text-red-600 font-semibold">Expense</span>
                </label>

              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors shadow-sm mt-1"
            >
              + Add Transaction
            </button>

          </form>
        </div>

        {/* ── Section 3: Transaction History ── */}
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-gray-700">Transaction History</h2>

          {/* If no transactions yet, show a friendly message */}
          {transactions.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-400">
              <p className="text-4xl mb-2">📭</p>
              <p className="text-sm">No transactions yet. Add one above!</p>
            </div>
          ) : (
            // Loop through the transactions array and render one TransactionItem per entry
            transactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>

      </div>
    </div>
  )
}
