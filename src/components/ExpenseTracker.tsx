import React, { useState } from 'react';
import { 
  PlusCircle, 
  Trash2, 
  Search, 
  Filter, 
  UtensilsCrossed, 
  Sparkles, 
  Calendar, 
  DollarSign, 
  FileText, 
  MapPin, 
  TrendingDown,
  ArrowUpDown,
  Tag
} from 'lucide-react';
import { CategoryInfo, DEFAULT_CATEGORIES, Expense } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { formatCurrency } from '../utils/storage';

interface ExpenseTrackerProps {
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  onDeleteExpense: (id: string) => void;
}

export const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({
  expenses,
  onAddExpense,
  onDeleteExpense,
}) => {
  // Form State for fast logging
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('dining_out');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<Expense['paymentMethod']>('card');
  const [isOutsideFood, setIsOutsideFood] = useState<boolean>(true);
  const [isLeisure, setIsLeisure] = useState<boolean>(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);

  // List search & filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('all');
  const [habitFilter, setHabitFilter] = useState<'all' | 'outside_food' | 'leisure'>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');

  // Quick preset amounts for 1-click speed
  const quickAmounts = [5, 12, 20, 35, 50, 100];

  // Auto-sync tags when category changes
  const handleCategorySelect = (cat: CategoryInfo) => {
    setCategoryId(cat.id);
    if (cat.isOutsideFood) {
      setIsOutsideFood(true);
      setIsLeisure(false);
    } else if (cat.isLeisure) {
      setIsOutsideFood(false);
      setIsLeisure(true);
    } else {
      setIsOutsideFood(false);
      setIsLeisure(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return;
    }

    const matchedCategory = DEFAULT_CATEGORIES.find((c) => c.id === categoryId);
    const categoryName = matchedCategory ? matchedCategory.name : 'Other Expense';

    onAddExpense({
      amount: numAmount,
      categoryId,
      categoryName,
      date,
      note: note.trim() || categoryName,
      location: location.trim() || undefined,
      paymentMethod,
      isOutsideFood,
      isLeisure,
    });

    // Reset & provide snappy feedback
    setAmount('');
    setNote('');
    setLocation('');
    setFormSuccessMessage(`Logged ${formatCurrency(numAmount)} under ${categoryName}!`);
    setTimeout(() => setFormSuccessMessage(null), 3000);
  };

  // Quick preset tags
  const quickTags = [
    { label: '☕ Morning Coffee', catId: 'dining_out', note: 'Coffee & pastry', isFood: true, isLeis: false },
    { label: '🍱 Lunch Bowl', catId: 'dining_out', note: 'Takeout lunch', isFood: true, isLeis: false },
    { label: '🍕 Dinner Out', catId: 'dining_out', note: 'Dinner with friends', isFood: true, isLeis: false },
    { label: '🎬 Movie & Drinks', catId: 'leisure', note: 'Cinema & snacks', isFood: false, isLeis: true },
    { label: '🛒 Weekly Groceries', catId: 'groceries', note: 'Pantry restocking', isFood: false, isLeis: false },
    { label: '🚇 Transit Fare', catId: 'transport', note: 'Metro / bus fare', isFood: false, isLeis: false },
  ];

  const applyQuickTag = (tag: typeof quickTags[0]) => {
    setCategoryId(tag.catId);
    setNote(tag.note);
    setIsOutsideFood(tag.isFood);
    setIsLeisure(tag.isLeis);
  };

  // Filtered expenses
  const filteredExpenses = expenses
    .filter((exp) => {
      const matchesSearch =
        exp.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exp.location && exp.location.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory =
        selectedFilterCategory === 'all' || exp.categoryId === selectedFilterCategory;

      const matchesHabit =
        habitFilter === 'all' ||
        (habitFilter === 'outside_food' && exp.isOutsideFood) ||
        (habitFilter === 'leisure' && exp.isLeisure);

      return matchesSearch && matchesCategory && matchesHabit;
    })
    .sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'amount_desc') return b.amount - a.amount;
      if (sortBy === 'amount_asc') return a.amount - b.amount;
      return 0;
    });

  const totalFilteredSum = filteredExpenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner / Fast Entry Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-stone-900 text-white flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h2 className="text-lg font-bold tracking-tight">Record New Expense</h2>
            </div>
            <p className="text-xs text-stone-300 mt-0.5">
              Quickly record what was spent, choose a category, and tag outside food or leisure.
            </p>
          </div>
          {formSuccessMessage && (
            <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-medium rounded-full animate-fade-in">
              ✓ {formSuccessMessage}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Main Amount & Category Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            {/* Amount Input */}
            <div className="md:col-span-4">
              <label htmlFor="expense-amount-input" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Amount Spent ($) *
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-700 font-bold text-lg">
                  $
                </div>
                <input
                  id="expense-amount-input"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 text-2xl font-bold rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-stone-900 placeholder:text-stone-700 transition-all"
                  autoFocus
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {quickAmounts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setAmount(q.toString())}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-stone-100 text-stone-700 hover:bg-amber-100 hover:text-amber-800 transition-colors"
                  >
                    +${q}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Selector Chips */}
            <div className="md:col-span-8">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Expense Category *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {DEFAULT_CATEGORIES.map((cat) => {
                  const isSelected = categoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategorySelect(cat)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                        isSelected
                          ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                          : 'border-stone-200 bg-stone-50/70 text-stone-700 hover:bg-white hover:border-stone-300'
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : cat.bgColor,
                          color: isSelected ? '#FFFFFF' : cat.color,
                        }}
                      >
                        <CategoryIcon name={cat.iconName} className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Details Row: Date, Note, Location & Habit Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-stone-100">
            <div>
              <label htmlFor="expense-date-input" className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-700" />
                Date
              </label>
              <input
                id="expense-date-input"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-200 bg-stone-50 text-stone-800 focus:bg-white focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label htmlFor="expense-note-input" className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-stone-700" />
                Description / Item
              </label>
              <input
                id="expense-note-input"
                type="text"
                placeholder="e.g., Thai noodles lunch"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-200 bg-stone-50 text-stone-800 focus:bg-white focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label htmlFor="expense-location-input" className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-700" />
                Place / Merchant (Optional)
              </label>
              <input
                id="expense-location-input"
                type="text"
                placeholder="e.g., Noodle Joint, Uber Eats"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-200 bg-stone-50 text-stone-800 focus:bg-white focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Special Habit Feature Flags */}
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-stone-700" />
                Habit Tracking Tags
              </label>
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => setIsOutsideFood(!isOutsideFood)}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors ${
                    isOutsideFood
                      ? 'bg-orange-50 border-orange-300 text-orange-800 font-semibold'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <UtensilsCrossed className="w-3 h-3" />
                  Outside Food
                </button>
                <button
                  type="button"
                  onClick={() => setIsLeisure(!isLeisure)}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors ${
                    isLeisure
                      ? 'bg-purple-50 border-purple-300 text-purple-800 font-semibold'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  Leisure / Fun
                </button>
              </div>
            </div>
          </div>

          {/* Quick presets row & Submit Action */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-stone-700 font-medium mr-1">Quick Presets:</span>
              {quickTags.map((tag, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyQuickTag(tag)}
                  className="text-xs px-2.5 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                >
                  {tag.label}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold shadow-xs hover:shadow transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Save Expense
            </button>
          </div>
        </form>
      </div>

      {/* Expense History / Ledger */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {/* Header & Controls */}
        <div className="p-5 border-b border-stone-200 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Expense Records & Cash Outflow
              </h3>
              <p className="text-xs text-stone-700">
                Showing {filteredExpenses.length} transaction{filteredExpenses.length === 1 ? '' : 's'} totalling{' '}
                <span className="font-bold text-stone-900">{formatCurrency(totalFilteredSum)}</span>
              </p>
            </div>

            {/* Quick Habit Filters */}
            <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setHabitFilter('all')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  habitFilter === 'all'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                All Outflow
              </button>
              <button
                type="button"
                onClick={() => setHabitFilter('outside_food')}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  habitFilter === 'outside_food'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-orange-700 hover:text-orange-900'
                }`}
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                Outside Food Only
              </button>
              <button
                type="button"
                onClick={() => setHabitFilter('leisure')}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  habitFilter === 'leisure'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-purple-700 hover:text-purple-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Leisure Only
              </button>
            </div>
          </div>

          {/* Search, Category Filter, and Sort */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-stone-700 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search notes, restaurants, categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-800"
              />
            </div>

            <div className="sm:col-span-3">
              <select
                value={selectedFilterCategory}
                onChange={(e) => setSelectedFilterCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="all">All Categories</option>
                {DEFAULT_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="date_desc">Newest Date First</option>
                <option value="date_asc">Oldest Date First</option>
                <option value="amount_desc">Highest Amount First</option>
                <option value="amount_asc">Lowest Amount First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Expense List */}
        {filteredExpenses.length === 0 ? (
          <div className="py-12 text-center text-stone-700">
            <TrendingDown className="w-10 h-10 mx-auto text-stone-300 mb-2" />
            <p className="text-sm font-medium text-stone-600">No matching expense entries found</p>
            <p className="text-xs text-stone-700 mt-1">Try logging an expense or adjusting your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filteredExpenses.map((exp) => {
              const cat = DEFAULT_CATEGORIES.find((c) => c.id === exp.categoryId);
              return (
                <div
                  key={exp.id}
                  className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-stone-50/70 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: cat ? cat.bgColor : '#F5F5F4',
                        borderColor: cat ? cat.borderColor : '#E7E5E4',
                        color: cat ? cat.color : '#57534E',
                      }}
                    >
                      <CategoryIcon name={cat ? cat.iconName : 'Tag'} className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-stone-900 truncate">
                          {exp.note}
                        </span>
                        {exp.isOutsideFood && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-100 text-orange-800 border border-orange-200">
                            <UtensilsCrossed className="w-2.5 h-2.5" />
                            Outside Food
                          </span>
                        )}
                        {exp.isLeisure && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                            <Sparkles className="w-2.5 h-2.5" />
                            Leisure
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-stone-700 mt-0.5 flex-wrap">
                        <span className="font-medium text-stone-600">{exp.categoryName}</span>
                        <span>•</span>
                        <span>{exp.date}</span>
                        {exp.location && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-stone-700">
                              <MapPin className="w-3 h-3" />
                              {exp.location}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-bold text-stone-900">
                        -{formatCurrency(exp.amount)}
                      </div>
                      <span className="text-[10px] text-stone-700 capitalize font-mono">
                        {exp.paymentMethod || 'card'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteExpense(exp.id)}
                      title="Delete expense"
                      className="p-1.5 text-stone-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-60 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
