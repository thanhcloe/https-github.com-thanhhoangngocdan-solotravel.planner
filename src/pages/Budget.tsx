import React, { useState } from 'react';

export default function Budget() {
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expenses, setExpenses] = useState([
    { id: 1, title: 'Sushi Dinner', amount: 45, category: 'Food', date: '2024-03-14' },
    { id: 2, title: 'Shinkansen Ticket', amount: 120, category: 'Transport', date: '2024-03-14' },
    { id: 3, title: 'Hotel Tokyo', amount: 150, category: 'Accommodation', date: '2024-03-13' },
  ]);

  const [newExpense, setNewExpense] = useState({ title: '', amount: '', category: 'Food' });

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.title || !newExpense.amount) return;
    
    setExpenses([
      {
        id: Date.now(),
        title: newExpense.title,
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        date: new Date().toISOString().split('T')[0],
      },
      ...expenses
    ]);
    setNewExpense({ title: '', amount: '', category: 'Food' });
    setIsAddExpenseOpen(false);
  };

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalBudget = 4200;
  const remaining = totalBudget - totalSpent;

  return (
    <div className="flex-1 overflow-y-auto pb-24 relative">
      {/* Header */}
      <div className="flex items-center p-4 pb-2 justify-between sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-20">
        <div className="text-slate-900 dark:text-slate-100 flex size-12 shrink-0 items-center justify-center cursor-pointer">
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </div>
        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Japan Spring '24</h2>
        <div className="flex w-12 items-center justify-end">
          <button className="flex items-center justify-center rounded-xl h-12 bg-transparent text-slate-900 dark:text-slate-100">
            <span className="material-symbols-outlined text-2xl">more_horiz</span>
          </button>
        </div>
      </div>

      {/* Budget Cards */}
      <div className="flex flex-wrap gap-4 p-4">
        <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-800 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-normal">Total Budget</p>
          <p className="text-slate-900 dark:text-slate-100 tracking-tight text-2xl font-bold leading-tight">${totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold leading-normal flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">trending_up</span> Planned
          </p>
        </div>
        <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 bg-primary text-white shadow-lg shadow-primary/20">
          <p className="text-white/80 text-sm font-medium leading-normal">Remaining</p>
          <p className="text-white tracking-tight text-2xl font-bold leading-tight">${remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <div className="w-full bg-white/20 h-1.5 rounded-full mt-1">
            <div className="bg-white h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, (remaining / totalBudget) * 100))}%` }}></div>
          </div>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="px-4 py-3">
        <div className="flex h-12 flex-1 items-center justify-center rounded-xl bg-slate-200/50 dark:bg-slate-800 p-1">
          <label className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 has-[:checked]:bg-white dark:has-[:checked]:bg-slate-700 has-[:checked]:shadow-sm has-[:checked]:text-primary text-slate-500 dark:text-slate-400 text-sm font-bold transition-all">
            <span className="truncate">Budget</span>
            <input type="radio" name="travel_mode" value="Budget" className="hidden" />
          </label>
          <label className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 has-[:checked]:bg-white dark:has-[:checked]:bg-slate-700 has-[:checked]:shadow-sm has-[:checked]:text-primary text-slate-500 dark:text-slate-400 text-sm font-bold transition-all">
            <span className="truncate">Balanced</span>
            <input type="radio" name="travel_mode" value="Balanced" className="hidden" defaultChecked />
          </label>
          <label className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 has-[:checked]:bg-white dark:has-[:checked]:bg-slate-700 has-[:checked]:shadow-sm has-[:checked]:text-primary text-slate-500 dark:text-slate-400 text-sm font-bold transition-all">
            <span className="truncate">Comfort</span>
            <input type="radio" name="travel_mode" value="Comfort" className="hidden" />
          </label>
        </div>
      </div>

      {/* Daily Spend Indicator */}
      <div className="px-4 py-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-slate-900 dark:text-slate-100 text-base font-bold">Daily Allowance</h3>
            <span className="text-primary font-bold">$120 / day</span>
          </div>
          <div className="flex gap-2 h-16 items-end justify-between">
            <div className="w-full bg-primary/20 rounded-t-sm h-[60%]"></div>
            <div className="w-full bg-primary/20 rounded-t-sm h-[80%]"></div>
            <div className="w-full bg-primary/20 rounded-t-sm h-[45%]"></div>
            <div className="w-full bg-primary/20 rounded-t-sm h-[90%]"></div>
            <div className="w-full bg-primary rounded-t-sm h-[100%] shadow-lg shadow-primary/20"></div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-t-sm h-[10%]"></div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-t-sm h-[10%]"></div>
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span className="text-primary">Today</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>
      </div>

      {/* Recent Expenses */}
      <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight px-4 pb-2 pt-4">Recent Expenses</h3>
      <div className="px-4 pb-4">
        <div className="flex flex-col gap-3">
          {expenses.map((expense) => (
            <div key={expense.id} className="flex items-center gap-4 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
              <div className={`flex size-10 items-center justify-center rounded-full ${
                expense.category === 'Accommodation' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                expense.category === 'Food' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
              }`}>
                <span className="material-symbols-outlined">
                  {expense.category === 'Accommodation' ? 'hotel' : expense.category === 'Food' ? 'restaurant' : 'train'}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{expense.title}</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">${expense.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">{expense.category}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{expense.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsAddExpenseOpen(true)}
        className="fixed bottom-24 right-6 size-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center hover:bg-primary/90 transition-colors z-30"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

      {/* Add Expense Modal */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
          <div className="bg-white dark:bg-slate-900 w-full sm:w-[400px] rounded-t-2xl sm:rounded-2xl p-6 shadow-xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Add Expense</h3>
              <button onClick={() => setIsAddExpenseOpen(false)} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleAddExpense} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <input 
                  type="text" 
                  required
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({...newExpense, title: e.target.value})}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-4 py-3 text-slate-900 dark:text-slate-100 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g. Sushi Dinner"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount ($)</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  step="0.01"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-4 py-3 text-slate-900 dark:text-slate-100 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select 
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-4 py-3 text-slate-900 dark:text-slate-100 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary appearance-none"
                >
                  <option value="Food">Food & Dining</option>
                  <option value="Transport">Transport</option>
                  <option value="Accommodation">Accommodation</option>
                  <option value="Activities">Activities</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <button 
                type="submit"
                className="w-full rounded-xl bg-primary px-4 py-3 text-center font-bold text-white hover:bg-primary/90 transition-colors mt-4"
              >
                Save Expense
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
