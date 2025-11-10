
import React, { useState, useMemo } from 'react';
import Card from './Card';
import { useData } from '../App';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Transaction } from '../types';

const Finance: React.FC = () => {
    const { appData, addIncome, addExpense } = useData();
    const { financialSummary, incomeTransactions, expenseTransactions } = appData;

    const [incomeDescription, setIncomeDescription] = useState('');
    const [incomeAmount, setIncomeAmount] = useState('');
    const [incomeCategory, setIncomeCategory] = useState('Products');
    
    const [expenseDescription, setExpenseDescription] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseCategory, setExpenseCategory] = useState('Tools');
    
    const netProfit = financialSummary.income - financialSummary.expenses;

    const COLORS = ['hsl(var(--color-primary))', 'hsl(var(--color-primary-accent))', 'hsl(var(--color-border))', 'hsl(var(--color-text-secondary))'];

    const handleAddIncome = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(incomeAmount);
        if (incomeDescription.trim() && !isNaN(numAmount) && numAmount > 0) {
            addIncome({ description: incomeDescription, amount: numAmount, category: incomeCategory });
            setIncomeDescription('');
            setIncomeAmount('');
            setIncomeCategory('Products');
        }
    }
    
    const handleAddExpense = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(expenseAmount);
        if (expenseDescription.trim() && !isNaN(numAmount) && numAmount > 0) {
            addExpense({ description: expenseDescription, amount: numAmount, category: expenseCategory });
            setExpenseDescription('');
            setExpenseAmount('');
            setExpenseCategory('Tools');
        }
    }

    const aggregatedIncomeData = useMemo(() => {
        const categoryMap: { [key: string]: number } = {};
        incomeTransactions.forEach(t => {
            if (categoryMap[t.category]) {
                categoryMap[t.category] += t.amount;
            } else {
                categoryMap[t.category] = t.amount;
            }
        });
        return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
    }, [incomeTransactions]);

    const aggregatedExpenseData = useMemo(() => {
        const categoryMap: { [key: string]: number } = {};
        expenseTransactions.forEach(t => {
            if (categoryMap[t.category]) {
                categoryMap[t.category] += t.amount;
            } else {
                categoryMap[t.category] = t.amount;
            }
        });
        return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
    }, [expenseTransactions]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-brand-text-primary">Income & Expenses</h1>
        <p className="text-brand-text-secondary mt-2">Know your streams, celebrate your wins, and refine what truly grows.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Total Income">
            <p className="text-4xl font-bold text-green-700">${financialSummary.income.toLocaleString()}</p>
        </Card>
        <Card title="Total Expenses">
            <p className="text-4xl font-bold text-red-700">${financialSummary.expenses.toLocaleString()}</p>
        </Card>
        <Card title="Net Profit">
            <p className={`text-4xl font-bold ${netProfit >= 0 ? 'text-brand-text-primary' : 'text-red-700'}`}>${netProfit.toLocaleString()}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Income Streams">
              <div className="h-80">
                  {aggregatedIncomeData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie
                                  data={aggregatedIncomeData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  outerRadius={120}
                                  fill="#8884d8"
                                  dataKey="value"
                                  nameKey="name"
                                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              >
                                  {aggregatedIncomeData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--color-surface))', borderColor: 'hsl(var(--color-primary))', color: 'hsl(var(--color-text-primary))' }}/>
                          </PieChart>
                      </ResponsiveContainer>
                  ) : (
                      <div className="flex items-center justify-center h-full text-brand-text-secondary">Add an income source to see your chart.</div>
                  )}
              </div>
          </Card>
          <Card title="Expense Categories">
              <div className="h-80">
                  {aggregatedExpenseData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie
                                  data={aggregatedExpenseData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={120}
                                  fill="#8884d8"
                                  paddingAngle={5}
                                  dataKey="value"
                                  nameKey="name"
                                  label
                              >
                                  {aggregatedExpenseData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                              </Pie>
                               <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--color-surface))', borderColor: 'hsl(var(--color-primary))', color: 'hsl(var(--color-text-primary))' }}/>
                          </PieChart>
                      </ResponsiveContainer>
                  ) : (
                      <div className="flex items-center justify-center h-full text-brand-text-secondary">Add an expense to see your chart.</div>
                  )}
              </div>
          </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
            <Card title="Add New Income">
                <form onSubmit={handleAddIncome} className="space-y-4">
                    <div>
                        <label htmlFor="income-description" className="block text-sm font-medium text-brand-text-secondary mb-1">Description</label>
                        <input type="text" id="income-description" value={incomeDescription} onChange={e => setIncomeDescription(e.target.value)} required className="w-full p-2 bg-brand-surface border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition" />
                    </div>
                     <div>
                        <label htmlFor="income-amount" className="block text-sm font-medium text-brand-text-secondary mb-1">Amount ($)</label>
                        <input type="number" id="income-amount" value={incomeAmount} onChange={e => setIncomeAmount(e.target.value)} required className="w-full p-2 bg-brand-surface border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition" />
                    </div>
                     <div>
                        <label htmlFor="income-category" className="block text-sm font-medium text-brand-text-secondary mb-1">Category</label>
                        <select id="income-category" value={incomeCategory} onChange={e => setIncomeCategory(e.target.value)} className="w-full p-2 bg-brand-surface border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition">
                            <option>Products</option>
                            <option>Services</option>
                            <option>Affiliate</option>
                            <option>Courses</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-brand-primary text-brand-text-on-primary py-2 rounded-lg hover:opacity-90 transition-all">Add Income</button>
                </form>
            </Card>
        </div>
        <div className="lg:col-span-3">
             <Card title="Recent Income">
                <div className="space-y-3 h-64 overflow-y-auto pr-2">
                    {incomeTransactions.length === 0 ? (
                        <p className="text-brand-text-secondary text-center py-10">No income logged yet. 🌿</p>
                    ) : (
                        incomeTransactions.map((t: Transaction) => (
                            <div key={t.id} className="flex justify-between items-center p-3 bg-brand-background rounded-lg">
                                <div>
                                    <p className="font-medium text-brand-text-primary">{t.description}</p>
                                    <p className="text-sm text-brand-text-secondary">{t.category} &middot; {new Date(t.date).toLocaleDateString()}</p>
                                </div>
                                <p className="font-semibold text-green-700">${t.amount.toFixed(2)}</p>
                            </div>
                        ))
                    )}
                </div>
             </Card>
        </div>
      </div>
       <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
            <Card title="Add New Expense">
                <form onSubmit={handleAddExpense} className="space-y-4">
                    <div>
                        <label htmlFor="expense-description" className="block text-sm font-medium text-brand-text-secondary mb-1">Description</label>
                        <input type="text" id="expense-description" value={expenseDescription} onChange={e => setExpenseDescription(e.target.value)} required className="w-full p-2 bg-brand-surface border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition" />
                    </div>
                     <div>
                        <label htmlFor="expense-amount" className="block text-sm font-medium text-brand-text-secondary mb-1">Amount ($)</label>
                        <input type="number" id="expense-amount" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} required className="w-full p-2 bg-brand-surface border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition" />
                    </div>
                     <div>
                        <label htmlFor="expense-category" className="block text-sm font-medium text-brand-text-secondary mb-1">Category</label>
                        <select id="expense-category" value={expenseCategory} onChange={e => setExpenseCategory(e.target.value)} className="w-full p-2 bg-brand-surface border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition">
                            <option>Tools</option>
                            <option>Ads</option>
                            <option>Services</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-brand-primary text-brand-text-on-primary py-2 rounded-lg hover:opacity-90 transition-all">Add Expense</button>
                </form>
            </Card>
        </div>
        <div className="lg:col-span-3">
             <Card title="Recent Expenses">
                <div className="space-y-3 h-64 overflow-y-auto pr-2">
                    {expenseTransactions.length === 0 ? (
                        <p className="text-brand-text-secondary text-center py-10">No expenses logged yet. 🌿</p>
                    ) : (
                        expenseTransactions.map((t: Transaction) => (
                            <div key={t.id} className="flex justify-between items-center p-3 bg-brand-background rounded-lg">
                                <div>
                                    <p className="font-medium text-brand-text-primary">{t.description}</p>
                                    <p className="text-sm text-brand-text-secondary">{t.category} &middot; {new Date(t.date).toLocaleDateString()}</p>
                                </div>
                                <p className="font-semibold text-red-700">${t.amount.toFixed(2)}</p>
                            </div>
                        ))
                    )}
                </div>
             </Card>
        </div>
      </div>
    </div>
  );
};

export default Finance;
