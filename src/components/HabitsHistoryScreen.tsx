import React, { useState } from 'react';
import { 
  ArrowLeft, 
  UtensilsCrossed, 
  Sparkles, 
  ShoppingBag, 
  Trash2, 
  Tag
} from 'lucide-react';
import { DEFAULT_CATEGORIES, Expense, Shift } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { formatCurrency } from '../utils/storage';

interface HabitsHistoryScreenProps {
  expenses: Expense[];
  shifts: Shift[];
  onBack: () => void;
  onDeleteExpense: (id: string) => void;
  onResetData: () => void;
}

export const HabitsHistoryScreen: React.FC<HabitsHistoryScreenProps> = ({
  expenses,
  onBack,
  onDeleteExpense,
  onResetData,
}) => {
  const [filter, setFilter] = useState<'all' | 'eating_out' | 'leisure' | 'groceries'>('all');

  // Habit metrics
  const outsideFoodExpenses = expenses.filter((e) => e.isOutsideFood || e.categoryId === 'eating_out');
  const outsideFoodTotal = outsideFoodExpenses.reduce((sum, e) => sum + e.amount, 0);

  const leisureExpenses = expenses.filter((e) => e.isLeisure || e.categoryId === 'leisure');
  const leisureTotal = leisureExpenses.reduce((sum, e) => sum + e.amount, 0);

  const groceriesExpenses = expenses.filter((e) => e.categoryId === 'groceries');

  // Filtered expenses
  const displayedExpenses = expenses.filter((e) => {
    if (filter === 'all') return true;
    if (filter === 'eating_out') return e.isOutsideFood || e.categoryId === 'eating_out';
    if (filter === 'leisure') return e.isLeisure || e.categoryId === 'leisure';
    if (filter === 'groceries') return e.categoryId === 'groceries';
    return true;
  });

  return (
    <div className="flex-1 flex flex-col px-5 py-6 justify-between animate-fadeIn">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors p-1.5 -ml-1.5 rounded-lg hover:bg-stone-100 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">
            History
          </span>
          <button
            onClick={onResetData}
            className="text-[11px] font-bold text-stone-500 hover:text-rose-600 transition-colors px-2 py-1 rounded-lg hover:bg-rose-50 cursor-pointer"
            title="Clear all data including shifts and expenses"
          >
            Reset
          </button>
        </div>

        {/* Minimal Summary Highlights */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {/* Eating Out */}
          <div className="bg-white rounded-2xl p-3.5 border border-stone-200/90 shadow-xs">
            <div className="flex items-center gap-2 mb-1">
              <div 
                className="w-6 h-6 rounded-lg text-white flex items-center justify-center"
                style={{ backgroundColor: '#FB5607' }}
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-stone-900">Eating Out</span>
            </div>
            <div className="text-lg font-extrabold" style={{ color: '#FB5607' }}>
              {formatCurrency(outsideFoodTotal)}
            </div>
          </div>

          {/* Leisure */}
          <div className="bg-white rounded-2xl p-3.5 border border-stone-200/90 shadow-xs">
            <div className="flex items-center gap-2 mb-1">
              <div 
                className="w-6 h-6 rounded-lg text-white flex items-center justify-center"
                style={{ backgroundColor: '#FF006E' }}
              >
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-stone-900">Leisure</span>
            </div>
            <div className="text-lg font-extrabold" style={{ color: '#FF006E' }}>
              {formatCurrency(leisureTotal)}
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-stone-900 text-white'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            All ({expenses.length})
          </button>
          <button
            onClick={() => setFilter('eating_out')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filter === 'eating_out'
                ? 'text-white'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
            style={{ backgroundColor: filter === 'eating_out' ? '#FB5607' : undefined }}
          >
            Eating Out ({outsideFoodExpenses.length})
          </button>
          <button
            onClick={() => setFilter('leisure')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filter === 'leisure'
                ? 'text-white'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
            style={{ backgroundColor: filter === 'leisure' ? '#FF006E' : undefined }}
          >
            Leisure ({leisureExpenses.length})
          </button>
          <button
            onClick={() => setFilter('groceries')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filter === 'groceries'
                ? 'text-stone-900 font-bold'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
            style={{ backgroundColor: filter === 'groceries' ? '#FFBE0B' : undefined }}
          >
            Groceries ({groceriesExpenses.length})
          </button>
        </div>

        {/* Expense List */}
        <div className="flex flex-col gap-2 pb-6">
          {displayedExpenses.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 border border-dashed border-stone-200 text-center text-xs text-stone-500">
              No transactions recorded.
            </div>
          ) : (
            displayedExpenses.map((exp) => {
              const matchedCat = DEFAULT_CATEGORIES.find((c) => c.id === exp.categoryId);
              return (
                <div
                  key={exp.id}
                  className="bg-white rounded-2xl p-3.5 border border-stone-200/90 shadow-xs flex items-center justify-between gap-3 hover:border-stone-300 transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: matchedCat?.bgColor || '#F1F5F9',
                      color: matchedCat?.color || '#475569',
                    }}
                  >
                    <CategoryIcon name={matchedCat?.iconName || exp.categoryId} className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-stone-900 truncate">
                        {exp.note || exp.categoryName}
                      </h4>
                      <span className="text-xs font-black text-stone-900">
                        -{formatCurrency(exp.amount)}
                      </span>
                    </div>
                    <div className="text-[10px] text-stone-500 truncate mt-0.5">
                      {exp.date} • {exp.categoryName}
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteExpense(exp.id)}
                    className="p-1 text-stone-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete expense"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
