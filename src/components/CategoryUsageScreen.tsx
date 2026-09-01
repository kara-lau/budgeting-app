import React from 'react';
import { ArrowLeft, UtensilsCrossed, Sparkles, ShoppingBag, MoreHorizontal } from 'lucide-react';
import { DEFAULT_CATEGORIES, Expense } from '../types';
import { formatCurrency } from '../utils/storage';

interface CategoryUsageScreenProps {
  expenses: Expense[];
  categoryLimits?: Record<string, number>;
  onBack: () => void;
}

export const CategoryUsageScreen: React.FC<CategoryUsageScreenProps> = ({
  expenses,
  categoryLimits = {
    eating_out: 350,
    leisure: 250,
    groceries: 450,
    other: 150,
  },
  onBack,
}) => {
  // Calculate total spent per category for current month
  const spendByCategory: Record<string, number> = {
    eating_out: 0,
    leisure: 0,
    groceries: 0,
    other: 0,
  };

  expenses.forEach((e) => {
    if (spendByCategory[e.categoryId] !== undefined) {
      spendByCategory[e.categoryId] += e.amount;
    } else if (e.isOutsideFood) {
      spendByCategory.eating_out += e.amount;
    } else if (e.isLeisure) {
      spendByCategory.leisure += e.amount;
    } else {
      spendByCategory.other += e.amount;
    }
  });

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'eating_out':
        return <UtensilsCrossed className="w-4 h-4" />;
      case 'leisure':
        return <Sparkles className="w-4 h-4" />;
      case 'groceries':
        return <ShoppingBag className="w-4 h-4" />;
      default:
        return <MoreHorizontal className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col px-5 py-6 justify-between animate-fadeIn">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors p-1.5 -ml-1.5 rounded-lg hover:bg-stone-100 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">
            Category Budget Usage
          </span>
          <div className="w-12" />
        </div>

        {/* 4 Radial Charts in Clean 2x2 Grid */}
        <div className="grid grid-cols-2 gap-3.5">
          {DEFAULT_CATEGORIES.map((cat) => {
            const spent = spendByCategory[cat.id] || 0;
            const limit = categoryLimits[cat.id] || 300;
            const percentage = Math.min(100, Math.round((spent / limit) * 100));
            const isOver = spent > limit;
            const remaining = Math.max(0, limit - spent);

            // SVG Radial Geometry (270 deg arc or full 360 circle)
            const size = 120;
            const strokeWidth = 10;
            const radius = (size - strokeWidth) / 2;
            const circumference = 2 * Math.PI * radius;
            const strokeDashoffset = circumference - (percentage / 100) * circumference;

            return (
              <div
                key={cat.id}
                className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-xs flex flex-col items-center text-center"
              >
                {/* Category Header */}
                <div className="flex items-center gap-1.5 mb-2.5">
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: cat.bgColor, color: cat.color }}
                  >
                    {getCategoryIcon(cat.id)}
                  </div>
                  <span className="text-xs font-bold text-stone-900 truncate">
                    {cat.name}
                  </span>
                </div>

                {/* SVG Radial Meter */}
                <div className="relative my-1 flex items-center justify-center">
                  <svg
                    width={size}
                    height={size}
                    className="-rotate-90"
                    viewBox={`0 0 ${size} ${size}`}
                  >
                    {/* Background Track */}
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      fill="none"
                      stroke="#F1F0EC"
                      strokeWidth={strokeWidth}
                    />
                    {/* Used Progress Arc */}
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      fill="none"
                      stroke={isOver ? '#EF4444' : cat.color}
                      strokeWidth={strokeWidth}
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>

                  {/* Inner Stats */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-sm font-extrabold text-stone-900 leading-tight">
                      {formatCurrency(spent)}
                    </span>
                    <span className="text-[10px] font-medium text-stone-700">
                      of {formatCurrency(limit)}
                    </span>
                  </div>
                </div>

                {/* Remaining / Over Tag */}
                <div className="mt-2 text-[11px] font-semibold">
                  {isOver ? (
                    <span className="text-rose-600">
                      {formatCurrency(spent - limit)} over limit
                    </span>
                  ) : (
                    <span className="text-stone-700">
                      {formatCurrency(remaining)} remaining
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clean Bottom Note with Vibrant Palette */}
      <div className="mt-6 pt-4 border-t border-stone-200/70 text-center">
        <button
          onClick={onBack}
          className="w-full py-3 rounded-xl text-white text-xs font-bold transition-all shadow-xs cursor-pointer hover:opacity-95 active:scale-[0.98]"
          style={{ backgroundColor: '#3A86FF' }}
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};
