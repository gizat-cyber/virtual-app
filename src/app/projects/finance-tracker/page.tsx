"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

// Типы данных
interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: Date;
}

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  budget?: number;
}

interface Budget {
  categoryId: string;
  limit: number;
  period: "monthly" | "weekly" | "yearly";
}

// Предустановленные категории
const defaultCategories: Category[] = [
  // Доходы
  { id: "salary", name: "Зарплата", type: "income", color: "#10b981" },
  { id: "freelance", name: "Фриланс", type: "income", color: "#06b6d4" },
  { id: "investment", name: "Инвестиции", type: "income", color: "#8b5cf6" },
  
  // Расходы
  { id: "food", name: "Еда", type: "expense", color: "#f59e0b" },
  { id: "transport", name: "Транспорт", type: "expense", color: "#ef4444" },
  { id: "entertainment", name: "Развлечения", type: "expense", color: "#ec4899" },
  { id: "utilities", name: "Коммунальные", type: "expense", color: "#6b7280" },
  { id: "shopping", name: "Покупки", type: "expense", color: "#84cc16" },
  { id: "healthcare", name: "Здоровье", type: "expense", color: "#f97316" },
];

export default function FinanceTracker() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [activeTab, setActiveTab] = useState<"dashboard" | "transactions" | "budgets" | "analytics">("dashboard");
  
  // Форма транзакции
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "expense" as "income" | "expense",
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split('T')[0]
  });

  // Загрузка данных из localStorage
  useEffect(() => {
    const savedTransactions = localStorage.getItem("finance-transactions");
    const savedBudgets = localStorage.getItem("finance-budgets");
    
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
    
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    }
  }, []);

  // Сохранение данных в localStorage
  useEffect(() => {
    localStorage.setItem("finance-transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("finance-budgets", JSON.stringify(budgets));
  }, [budgets]);

  // Вычисляемые значения
  const stats = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
    
    const totalIncome = monthlyTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = monthlyTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpenses;
    
    // Группировка по категориям
    const categoryStats = categories.map(category => {
      const categoryTransactions = monthlyTransactions.filter(t => t.category === category.id);
      const total = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
      const budget = budgets.find(b => b.categoryId === category.id);
      
      return {
        ...category,
        spent: total,
        budget: budget?.limit || 0,
        percentage: budget?.limit ? (total / budget.limit) * 100 : 0
      };
    });

    return {
      totalIncome,
      totalExpenses,
      balance,
      categoryStats,
      transactionsCount: monthlyTransactions.length
    };
  }, [transactions, categories, budgets]);

  // Добавление транзакции
  const addTransaction = () => {
    if (!formData.amount || !formData.category) return;

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: formData.type,
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      date: formData.date,
      createdAt: new Date()
    };

    setTransactions([newTransaction, ...transactions]);
    setFormData({
      type: "expense",
      amount: "",
      category: "",
      description: "",
      date: new Date().toISOString().split('T')[0]
    });
    setShowTransactionForm(false);
  };

  // Удаление транзакции
  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  // Установка бюджета
  const setBudget = (categoryId: string, limit: number) => {
    const existingBudget = budgets.find(b => b.categoryId === categoryId);
    if (existingBudget) {
      setBudgets(budgets.map(b => 
        b.categoryId === categoryId ? { ...b, limit } : b
      ));
    } else {
      setBudgets([...budgets, { categoryId, limit, period: "monthly" }]);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-KZ', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getFilteredCategories = () => {
    return categories.filter(c => c.type === formData.type);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-4"
          >
            ← Назад к проектам
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                💰 Финансовый Трекер
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Управление личными финансами, бюджетом и аналитикой расходов
              </p>
            </div>
            <button
              onClick={() => setShowTransactionForm(true)}
              className="mt-4 md:mt-0 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              + Добавить транзакцию
            </button>
          </div>
        </header>

        {/* MVP Info */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-6 border border-slate-200 dark:border-slate-700">
          <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Функции приложения:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-slate-600 dark:text-slate-400">
            <div>📊 Трекинг доходов и расходов</div>
            <div>📈 Аналитика по категориям</div>
            <div>💳 Управление бюджетами</div>
            <div>📱 Адаптивный интерфейс</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-slate-800 rounded-lg mb-6 border border-slate-200 dark:border-slate-700">
          <div className="flex overflow-x-auto">
            {[
              { id: "dashboard", label: "📊 Дашборд", icon: "📊" },
              { id: "transactions", label: "💸 Транзакции", icon: "💸" },
              { id: "budgets", label: "💳 Бюджеты", icon: "💳" },
              { id: "analytics", label: "📈 Аналитика", icon: "📈" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Tab */}
        {activeTab === "transactions" && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Все транзакции ({transactions.length})
                </h3>
                <div className="mt-4 md:mt-0 flex space-x-2">
                  <select className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-100">
                    <option>Все категории</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <select className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-100">
                    <option>Все типы</option>
                    <option value="income">Доходы</option>
                    <option value="expense">Расходы</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6">
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">💸</div>
                  <p className="text-slate-500 dark:text-slate-400">
                    Пока нет транзакций. Добавьте первую транзакцию!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => {
                    const category = categories.find(c => c.id === transaction.category);
                    return (
                      <div key={transaction.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: category?.color || '#6b7280' }}
                          ></div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-slate-100">
                              {transaction.description || category?.name}
                            </p>
                            <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                              <span>{category?.name}</span>
                              <span>•</span>
                              <span>{new Date(transaction.date).toLocaleDateString('ru-RU')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <p className={`font-semibold text-lg ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </p>
                          <button
                            onClick={() => deleteTransaction(transaction.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Budgets Tab */}
        {activeTab === "budgets" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Управление бюджетами
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Установите лимиты расходов для каждой категории и отслеживайте их выполнение.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.filter(c => c.type === 'expense').map(category => {
                  const categoryStats = stats.categoryStats.find(s => s.id === category.id);
                  const currentBudget = budgets.find(b => b.categoryId === category.id);
                  
                  return (
                    <div key={category.id} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {category.name}
                          </span>
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {formatCurrency(categoryStats?.spent || 0)}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600 dark:text-slate-400">Бюджет:</span>
                          <span className="text-slate-600 dark:text-slate-400">
                            {categoryStats?.percentage.toFixed(0) || 0}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              (categoryStats?.percentage || 0) > 100 ? 'bg-red-500' : 
                              (categoryStats?.percentage || 0) > 80 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(categoryStats?.percentage || 0, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          placeholder="Лимит"
                          defaultValue={currentBudget?.limit || ''}
                          onBlur={(e) => {
                            const value = parseFloat(e.target.value);
                            if (value > 0) {
                              setBudget(category.id, value);
                            }
                          }}
                          className="flex-1 px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-600 dark:text-slate-100"
                        />
                        <span className="px-2 py-1 text-sm text-slate-600 dark:text-slate-400">₸</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            {/* Monthly Overview */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Анализ за текущий месяц
              </h3>
              
              {/* Category Breakdown */}
              <div className="space-y-4">
                <h4 className="font-medium text-slate-900 dark:text-slate-100">Расходы по категориям:</h4>
                {stats.categoryStats
                  .filter(cat => cat.type === 'expense' && cat.spent > 0)
                  .sort((a, b) => b.spent - a.spent)
                  .map(category => (
                    <div key={category.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {category.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {formatCurrency(category.spent)}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                            ({((category.spent / stats.totalExpenses) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1.5">
                        <div 
                          className="h-1.5 rounded-full transition-all duration-300"
                          style={{ 
                            backgroundColor: category.color,
                            width: `${(category.spent / stats.totalExpenses) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Financial Health */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Финансовое здоровье
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">Статистика:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Норма сбережений:</span>
                      <span className={`font-medium ${
                        (stats.balance / stats.totalIncome) * 100 > 20 ? 'text-green-600' : 
                        (stats.balance / stats.totalIncome) * 100 > 10 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {stats.totalIncome > 0 ? ((stats.balance / stats.totalIncome) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Количество транзакций:</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {stats.transactionsCount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Средний расход:</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {formatCurrency(transactions.filter(t => t.type === 'expense').length > 0 
                          ? stats.totalExpenses / transactions.filter(t => t.type === 'expense').length 
                          : 0)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">Рекомендации:</h4>
                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    {stats.balance < 0 && (
                      <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded">
                        ⚠️ Расходы превышают доходы. Пересмотрите бюджет.
                      </div>
                    )}
                    {(stats.balance / stats.totalIncome) * 100 < 10 && stats.totalIncome > 0 && (
                      <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded">
                        💡 Рекомендуем откладывать минимум 10% от доходов.
                      </div>
                    )}
                    {stats.categoryStats.some(cat => cat.percentage > 100) && (
                      <div className="p-2 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded">
                        📊 Некоторые категории превысили бюджет.
                      </div>
                    )}
                    {stats.balance > 0 && (stats.balance / stats.totalIncome) * 100 > 20 && (
                      <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded">
                        ✅ Отличная норма сбережений! Продолжайте в том же духе.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Доходы за месяц</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalIncome)}</p>
                  </div>
                  <div className="text-3xl">📈</div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Расходы за месяц</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalExpenses)}</p>
                  </div>
                  <div className="text-3xl">📉</div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Баланс</p>
                    <p className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(stats.balance)}
                    </p>
                  </div>
                  <div className="text-3xl">{stats.balance >= 0 ? '💰' : '⚠️'}</div>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Последние транзакции
                </h3>
              </div>
              <div className="p-6">
                {transactions.slice(0, 5).length === 0 ? (
                  <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                    Пока нет транзакций. Добавьте первую транзакцию!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((transaction) => {
                      const category = categories.find(c => c.id === transaction.category);
                      return (
                        <div key={transaction.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category?.color || '#6b7280' }}
                            ></div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-slate-100">
                                {transaction.description || category?.name}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {new Date(transaction.date).toLocaleDateString('ru-RU')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${
                              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Transaction Form Modal */}
        {showTransactionForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Добавить транзакцию
              </h3>
              
              <div className="space-y-4">
                {/* Type Selection */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFormData({...formData, type: "expense", category: ""})}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      formData.type === "expense"
                        ? "bg-red-100 text-red-700 border-2 border-red-300"
                        : "bg-slate-100 text-slate-700 border-2 border-transparent"
                    }`}
                  >
                    📉 Расход
                  </button>
                  <button
                    onClick={() => setFormData({...formData, type: "income", category: ""})}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      formData.type === "income"
                        ? "bg-green-100 text-green-700 border-2 border-green-300"
                        : "bg-slate-100 text-slate-700 border-2 border-transparent"
                    }`}
                  >
                    📈 Доход
                  </button>
                </div>

                {/* Amount */}
                <input
                  type="number"
                  placeholder="Сумма"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100"
                />

                {/* Category */}
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100"
                >
                  <option value="">Выберите категорию</option>
                  {getFilteredCategories().map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                {/* Description */}
                <input
                  type="text"
                  placeholder="Описание (необязательно)"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100"
                />

                {/* Date */}
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100"
                />

                {/* Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowTransactionForm(false)}
                    className="flex-1 py-2 px-4 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={addTransaction}
                    disabled={!formData.amount || !formData.category}
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Добавить
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tech Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Технологии: React Hooks, TypeScript, Local Storage, Complex State Management, Data Visualization
          </p>
        </div>
      </div>
    </div>
  );
}
