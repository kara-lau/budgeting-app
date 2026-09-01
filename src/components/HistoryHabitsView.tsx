import React, { useState, useMemo } from 'react';
import { 
  UtensilsCrossed, 
  Sparkles, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Coffee, 
  PieChart as PieIcon, 
  BarChart3, 
  Download, 
  ArrowUpRight, 
  CheckCircle2, 
  ShoppingBag, 
  MapPin, 
  CreditCard,
  Search,
  Filter
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { DEFAULT_CATEGORIES, Expense, Shift } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { formatCurrency } from '../utils/storage';

interface HistoryHabitsViewProps {
  expenses: Expense[];
  shifts: Shift[];
}

export const HistoryHabitsView: React.FC<HistoryHabitsViewProps> = ({
  expenses,
  shifts,
}) => {
  const [timeFilter, setTimeFilter] = useState<'all' | 'this_month' | 'last_30_days'>('all');
  const [activeTab, setActiveTab] = useState<'habits' | 'cashflow_trends' | 'full_ledger'>('habits');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [habitTagFilter, setHabitTagFilter] = useState<'all' | 'outside_food' | 'leisure'>('all');

  // Filter expenses by date
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return expenses.filter((e) => {
      const expDate = new Date(e.date);
      if (timeFilter === 'this_month') {
        return expDate.getFullYear() === currentYear && expDate.getMonth() === currentMonth;
      }
      if (timeFilter === 'last_30_days') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return expDate >= thirtyDaysAgo;
      }
      return true;
    });
  }, [expenses, timeFilter]);

  // Outside food analytics
  const outsideFoodExpenses = filteredExpenses.filter((e) => e.isOutsideFood);
  const outsideFoodTotal = outsideFoodExpenses.reduce((sum, e) => sum + e.amount, 0);
  const outsideFoodCount = outsideFoodExpenses.length;
  const outsideFoodAvg = outsideFoodCount > 0 ? outsideFoodTotal / outsideFoodCount : 0;

  // Leisure analytics
  const leisureExpenses = filteredExpenses.filter((e) => e.isLeisure);
  const leisureTotal = leisureExpenses.reduce((sum, e) => sum + e.amount, 0);
  const leisureCount = leisureExpenses.length;
  const leisureAvg = leisureCount > 0 ? leisureTotal / leisureCount : 0;

  // Overall totals
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const receivedInflow = shifts
    .filter((s) => s.status === 'received')
    .reduce((sum, s) => sum + s.totalEarnings, 0);
  const netCashflow = receivedInflow - totalExpenses;

  // Category breakdown for Pie Chart
  const categoryData = useMemo(() => {
    const map: Record<string, { name: string; value: number; color: string }> = {};
    DEFAULT_CATEGORIES.forEach((c) => {
      map[c.id] = { name: c.name, value: 0, color: c.color };
    });

    filteredExpenses.forEach((e) => {
      if (map[e.categoryId]) {
        map[e.categoryId].value += e.amount;
      } else {
        map[e.categoryId] = { name: e.categoryName, value: e.amount, color: '#6B7280' };
      }
    });

    return Object.values(map).filter((item) => item.value > 0);
  }, [filteredExpenses]);

  // Weekly / Daily spend grouping for outside food & leisure bar chart
  const habitsTrendData = useMemo(() => {
    const dayMap: Record<string, { date: string; food: number; leisure: number; other: number }> = {};

    // Group last 14 unique dates or recent transactions
    const sorted = [...filteredExpenses].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sorted.forEach((e) => {
      if (!dayMap[e.date]) {
        dayMap[e.date] = { date: e.date.slice(5), food: 0, leisure: 0, other: 0 };
      }
      if (e.isOutsideFood) {
        dayMap[e.date].food += e.amount;
      } else if (e.isLeisure) {
        dayMap[e.date].leisure += e.amount;
      } else {
        dayMap[e.date].other += e.amount;
      }
    });

    return Object.values(dayMap).slice(-10); // Take last 10 dates with entries
  }, [filteredExpenses]);

  // CSV Export handler
  const handleExportCSV = () => {
    const headers = ['Date', 'Item/Note', 'Category', 'Amount', 'Outside Food?', 'Leisure?', 'Location', 'Payment Method'];
    const rows = filteredExpenses.map((e) => [
      e.date,
      `"${e.note.replace(/"/g, '""')}"`,
      `"${e.categoryName}"`,
      e.amount.toFixed(2),
      e.isOutsideFood ? 'Yes' : 'No',
      e.isLeisure ? 'Yes' : 'No',
      `"${(e.location || '').replace(/"/g, '""')}"`,
      e.paymentMethod || 'card',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `expenses_history_${timeFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header with Period Filters */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight">
            Habit Analysis & Spending History
          </h2>
          <p className="text-xs text-stone-700 mt-0.5">
            Deep dive into dining out frequency, leisure expenditure, and your long-term cashflow habits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period selector */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setTimeFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                timeFilter === 'all'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              All Time
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter('this_month')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                timeFilter === 'this_month'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter('last_30_days')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                timeFilter === 'last_30_days'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              Last 30 Days
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-stone-900 hover:bg-stone-800 text-white shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Habit Spotlights: Outside Food & Leisure Activities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Outside Food Spotlight Card */}
        <div className="bg-gradient-to-br from-orange-50/70 to-amber-50/40 rounded-2xl p-6 border border-orange-200/90 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  Outside Food & Dining Habits
                </h3>
                <p className="text-xs text-orange-950/70">
                  Takeout, cafes, restaurants & food delivery
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 text-xs font-bold bg-orange-200/60 text-orange-900 rounded-full">
              {totalExpenses > 0 ? ((outsideFoodTotal / totalExpenses) * 100).toFixed(0) : 0}% of expenses
            </span>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 bg-white/80 rounded-xl p-3.5 border border-orange-200/60 mb-4 backdrop-blur-xs">
            <div>
              <span className="text-[10px] uppercase font-semibold text-stone-700 block">
                Total Food Outflow
              </span>
              <div className="text-xl font-extrabold text-orange-600 mt-0.5">
                {formatCurrency(outsideFoodTotal)}
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-stone-700 block">
                Times Ate Out
              </span>
              <div className="text-xl font-extrabold text-stone-900 mt-0.5">
                {outsideFoodCount} <span className="text-xs font-medium text-stone-700">meals</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-stone-700 block">
                Avg. per Meal
              </span>
              <div className="text-xl font-extrabold text-stone-900 mt-0.5">
                {formatCurrency(outsideFoodAvg)}
              </div>
            </div>
          </div>

          {/* Recent Outside Food Entries */}
          <div>
            <h4 className="text-xs font-bold text-stone-900 mb-2 uppercase tracking-wider">
              Recent Outside Meals Logged ({outsideFoodExpenses.slice(0, 3).length})
            </h4>
            {outsideFoodExpenses.length === 0 ? (
              <p className="text-xs text-stone-700 italic py-2">No outside food logged for this period.</p>
            ) : (
              <div className="space-y-2">
                {outsideFoodExpenses.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-xs bg-white/70 p-2.5 rounded-lg border border-orange-100/80"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="font-semibold text-stone-900 truncate block">
                        {item.note}
                      </span>
                      <span className="text-[10px] text-stone-700">
                        {item.date} {item.location ? `• ${item.location}` : ''}
                      </span>
                    </div>
                    <span className="font-bold text-orange-700 shrink-0">
                      -{formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Leisure & Activities Spotlight Card */}
        <div className="bg-gradient-to-br from-purple-50/70 to-indigo-50/40 rounded-2xl p-6 border border-purple-200/90 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  Leisure & Fun Activities
                </h3>
                <p className="text-xs text-purple-950/70">
                  Cinema, concerts, gaming, sports & outings
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 text-xs font-bold bg-purple-200/60 text-purple-900 rounded-full">
              {totalExpenses > 0 ? ((leisureTotal / totalExpenses) * 100).toFixed(0) : 0}% of expenses
            </span>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 bg-white/80 rounded-xl p-3.5 border border-purple-200/60 mb-4 backdrop-blur-xs">
            <div>
              <span className="text-[10px] uppercase font-semibold text-stone-700 block">
                Total Leisure Spend
              </span>
              <div className="text-xl font-extrabold text-purple-600 mt-0.5">
                {formatCurrency(leisureTotal)}
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-stone-700 block">
                Activities Enjoyed
              </span>
              <div className="text-xl font-extrabold text-stone-900 mt-0.5">
                {leisureCount} <span className="text-xs font-medium text-stone-700">times</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-stone-700 block">
                Avg. per Activity
              </span>
              <div className="text-xl font-extrabold text-stone-900 mt-0.5">
                {formatCurrency(leisureAvg)}
              </div>
            </div>
          </div>

          {/* Recent Leisure Entries */}
          <div>
            <h4 className="text-xs font-bold text-stone-900 mb-2 uppercase tracking-wider">
              Recent Leisure Outings ({leisureExpenses.slice(0, 3).length})
            </h4>
            {leisureExpenses.length === 0 ? (
              <p className="text-xs text-stone-700 italic py-2">No leisure activities logged for this period.</p>
            ) : (
              <div className="space-y-2">
                {leisureExpenses.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-xs bg-white/70 p-2.5 rounded-lg border border-purple-100/80"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="font-semibold text-stone-900 truncate block">
                        {item.note}
                      </span>
                      <span className="text-[10px] text-stone-700">
                        {item.date} {item.location ? `• ${item.location}` : ''}
                      </span>
                    </div>
                    <span className="font-bold text-purple-700 shrink-0">
                      -{formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Visual Analytics & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Category Breakdown Donut */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-amber-600" />
                Category Outflow Share
              </h3>
              <span className="text-xs font-bold text-stone-700">
                {formatCurrency(totalExpenses)} Total
              </span>
            </div>
            <p className="text-xs text-stone-700 mb-4">
              Where your money is going across all logged expenses.
            </p>

            <div className="h-60 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number | string | undefined) => [formatCurrency(Number(val) || 0), 'Amount']}
                    contentStyle={{
                      backgroundColor: '#1C1917',
                      color: '#FFFFFF',
                      borderRadius: '10px',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mini legend */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-stone-100 text-xs">
            {categoryData.slice(0, 6).map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                <span className="truncate text-stone-700">{c.name}</span>
                <span className="ml-auto font-semibold text-stone-900">{formatCurrency(c.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily / Weekly Activity Bar Chart */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              Outside Food vs Leisure vs Other Outflow
            </h3>
            <span className="text-xs text-stone-700">By date</span>
          </div>
          <p className="text-xs text-stone-700 mb-4">
            Compare how food and leisure track alongside your essential bills over time.
          </p>

          <div className="h-64 w-full">
            {habitsTrendData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-stone-700">
                Not enough transactions to plot habit trends yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={habitsTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#78716C' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#78716C' }} tickFormatter={(val) => `$${val}`} />
                  <Tooltip
                    formatter={(val: number | string | undefined) => [formatCurrency(Number(val) || 0), '']}
                    contentStyle={{
                      backgroundColor: '#1C1917',
                      color: '#FFFFFF',
                      borderRadius: '10px',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="food" name="Outside Food" fill="#F97316" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="leisure" name="Leisure & Fun" fill="#8B5CF6" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="other" name="Other Expenses" fill="#94A3B8" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Comprehensive History Ledger & Search */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-stone-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-stone-900">
              Full Transaction History Ledger
            </h3>
            <p className="text-xs text-stone-700">
              Detailed breakdown of all your recorded outflows with habit indicators.
            </p>
          </div>

          {/* Habit Filter & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-700 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white text-stone-800"
              />
            </div>

            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setHabitTagFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  habitTagFilter === 'all' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-700'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setHabitTagFilter('outside_food')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  habitTagFilter === 'outside_food'
                    ? 'bg-orange-500 text-white font-semibold'
                    : 'text-orange-700'
                }`}
              >
                Food
              </button>
              <button
                type="button"
                onClick={() => setHabitTagFilter('leisure')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  habitTagFilter === 'leisure'
                    ? 'bg-purple-600 text-white font-semibold'
                    : 'text-purple-700'
                }`}
              >
                Leisure
              </button>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-700 uppercase tracking-wider font-semibold border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Item / Note</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Habit Tags</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {filteredExpenses
                .filter((exp) => {
                  const matchSearch =
                    exp.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    exp.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (exp.location && exp.location.toLowerCase().includes(searchTerm.toLowerCase()));
                  const matchTag =
                    habitTagFilter === 'all' ||
                    (habitTagFilter === 'outside_food' && exp.isOutsideFood) ||
                    (habitTagFilter === 'leisure' && exp.isLeisure);
                  return matchSearch && matchTag;
                })
                .map((exp) => {
                  const cat = DEFAULT_CATEGORIES.find((c) => c.id === exp.categoryId);
                  return (
                    <tr key={exp.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono text-stone-600 whitespace-nowrap">{exp.date}</td>
                      <td className="py-3 px-4 font-semibold text-stone-900">{exp.note}</td>
                      <td className="py-3 px-4">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border"
                          style={{
                            backgroundColor: cat?.bgColor || '#F5F5F4',
                            borderColor: cat?.borderColor || '#E7E5E4',
                            color: cat?.color || '#57534E',
                          }}
                        >
                          <CategoryIcon name={cat?.iconName || 'Tag'} className="w-3 h-3" />
                          {exp.categoryName}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {exp.isOutsideFood && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
                              Outside Food
                            </span>
                          )}
                          {exp.isLeisure && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                              Leisure / Fun
                            </span>
                          )}
                          {!exp.isOutsideFood && !exp.isLeisure && (
                            <span className="text-stone-700 text-[11px]">—</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-stone-700">{exp.location || '—'}</td>
                      <td className="py-3 px-4 text-right font-bold text-stone-900 whitespace-nowrap">
                        -{formatCurrency(exp.amount)}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
