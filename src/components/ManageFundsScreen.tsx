import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Check, 
  RotateCcw, 
  PiggyBank,
  Sparkles, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BudgetConfig, DEFAULT_CATEGORIES, Expense, SAVINGS_CATEGORY_INFO, Shift } from '../types';
import { RadialSlider } from './RadialSlider';
import { formatCurrency } from '../utils/storage';

interface ManageFundsScreenProps {
  budgetConfig: BudgetConfig;
  shifts: Shift[];
  expenses: Expense[];
  onBack: () => void;
  onUpdateBudgetConfig: (newConfig: BudgetConfig) => void;
}

export const ManageFundsScreen: React.FC<ManageFundsScreenProps> = ({
  budgetConfig,
  shifts,
  expenses,
  onBack,
  onUpdateBudgetConfig,
}) => {
  // Only consider money received already
  const receivedTotal = shifts
    .filter((s) => s.status === 'received')
    .reduce((sum, s) => sum + s.totalEarnings, 0);

  const effectivePool = receivedTotal > 0 ? receivedTotal : 1500;

  // Filter out any obsolete categories like rent_housing or previous savings slider
  const validCategoryIds = new Set(DEFAULT_CATEGORIES.map((c) => c.id));
  const initialAllocations = budgetConfig.allocations.filter((a) =>
    validCategoryIds.has(a.categoryId)
  );

  // Ensure all 4 categories exist
  const completeInitialAllocations = DEFAULT_CATEGORIES.map((cat) => {
    const existing = initialAllocations.find((a) => a.categoryId === cat.id);
    return (
      existing || {
        categoryId: cat.id,
        percentage: cat.defaultPercentage,
        isLocked: false,
      }
    );
  });

  const [currentAllocations, setCurrentAllocations] = useState(completeInitialAllocations);
  const [isSavedToast, setIsSavedToast] = useState(false);

  // Actual spend per category
  const spendByCategory: Record<string, number> = {};
  DEFAULT_CATEGORIES.forEach((c) => (spendByCategory[c.id] = 0));
  expenses.forEach((e) => {
    spendByCategory[e.categoryId] = (spendByCategory[e.categoryId] || 0) + e.amount;
  });

  // Calculate dynamic allocated and unallocated numbers
  const totalAllocatedPercentage = currentAllocations.reduce(
    (sum, a) => sum + a.percentage,
    0
  );
  const unallocatedPercentage = Math.max(0, 100 - totalAllocatedPercentage);
  const unallocatedAmount = (unallocatedPercentage / 100) * effectivePool;
  const isOverAllocated = totalAllocatedPercentage > 100;
  const overPercentage = totalAllocatedPercentage - 100;
  const overAmount = (overPercentage / 100) * effectivePool;

  const handlePercentageChange = (categoryId: string, newPercentage: number) => {
    const nextAllocations = currentAllocations.map((a) => {
      if (a.categoryId === categoryId) {
        return { ...a, percentage: newPercentage };
      }
      return a;
    });

    setCurrentAllocations(nextAllocations);
    // Real-time sync
    onUpdateBudgetConfig({
      ...budgetConfig,
      earningsSource: 'received',
      allocations: nextAllocations,
    });
  };

  const handleToggleLock = (categoryId: string) => {
    const nextAllocations = currentAllocations.map((a) => {
      if (a.categoryId === categoryId) {
        return { ...a, isLocked: !a.isLocked };
      }
      return a;
    });

    setCurrentAllocations(nextAllocations);
    onUpdateBudgetConfig({
      ...budgetConfig,
      allocations: nextAllocations,
    });
  };

  const handleSaveIt = () => {
    // "Save it" action banks everything that hasn't been allocated into savings
    onUpdateBudgetConfig({
      ...budgetConfig,
      earningsSource: 'received',
      allocations: currentAllocations,
    });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.35 },
      colors: ['#0D9488', '#10B981', '#F59E0B'],
    });

    setIsSavedToast(true);
    setTimeout(() => {
      setIsSavedToast(false);
      onBack();
    }, 1000);
  };

  const handleReset = () => {
    const defaults = DEFAULT_CATEGORIES.map((cat) => ({
      categoryId: cat.id,
      percentage: cat.defaultPercentage,
      isLocked: false,
    }));
    setCurrentAllocations(defaults);
    onUpdateBudgetConfig({
      ...budgetConfig,
      allocations: defaults,
    });
  };

  return (
    <div className="flex-1 flex flex-col px-5 py-6 justify-between animate-fadeIn">
      <div>
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors p-1.5 -ml-1.5 rounded-lg hover:bg-stone-100 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">
            Manage Funds
          </span>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer text-xs flex items-center gap-1"
            title="Reset default sliders"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dedicated Header: Unallocated Number + "Save it" Small Button */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-xs mb-5 text-center flex flex-col items-center">
          <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider block mb-1">
            Unallocated
          </span>

          <div className="flex items-baseline justify-center gap-2">
            <span
              className={`text-3xl sm:text-4xl font-extrabold tracking-tight transition-colors ${
                isOverAllocated
                  ? 'text-rose-600'
                  : unallocatedPercentage > 0
                  ? 'text-amber-600'
                  : 'text-emerald-700'
              }`}
            >
              {isOverAllocated
                ? `-${formatCurrency(overAmount)}`
                : formatCurrency(unallocatedAmount)}
            </span>
            <span className="text-xs font-semibold text-stone-700">
              ({isOverAllocated ? `+${overPercentage}% over` : `${unallocatedPercentage}% to save`})
            </span>
          </div>

          <p className="text-[11px] text-stone-700 mt-1 max-w-xs leading-relaxed">
            {isOverAllocated
              ? 'Category sliders exceed 100% of received income'
              : unallocatedPercentage > 0
              ? 'Tap "Save it" to bank this unallocated amount into your Savings pool'
              : 'All received income is allocated across the 4 categories'}
          </p>

          {/* Small button beneath unallocated: "Save it" */}
          <div className="mt-3.5">
            <button
              id="btn-save-it"
              onClick={handleSaveIt}
              disabled={isOverAllocated}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-95 ${
                isOverAllocated
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : isSavedToast
                  ? 'bg-teal-700 text-white'
                  : 'bg-stone-900 hover:bg-stone-800 text-white'
              }`}
            >
              {isSavedToast ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Banked into Savings!</span>
                </>
              ) : (
                <>
                  <PiggyBank className="w-3.5 h-3.5 text-teal-300" />
                  <span>Save it</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4 Radial Sliders Section (Eating Out, Leisure, Groceries, Other) */}
        <div className="text-xs font-semibold uppercase tracking-wider text-stone-700 mb-3 px-1 flex items-center justify-between">
          <span>Category Sliders</span>
          <span className="text-[11px] text-stone-700 font-normal">
            Total Allocated: <strong className="text-stone-800">{totalAllocatedPercentage}%</strong>
          </span>
        </div>

        <div className="flex flex-col gap-3 pb-6">
          {DEFAULT_CATEGORIES.map((category) => {
            const allocation = currentAllocations.find(
              (a) => a.categoryId === category.id
            ) || { categoryId: category.id, percentage: category.defaultPercentage, isLocked: false };

            const percentage = allocation.percentage;
            const allocatedAmount = (percentage / 100) * effectivePool;
            const spentAmount = spendByCategory[category.id] || 0;

            return (
              <RadialSlider
                key={category.id}
                category={category}
                percentage={percentage}
                allocatedAmount={allocatedAmount}
                spentAmount={spentAmount}
                totalPool={effectivePool}
                isLocked={!!allocation.isLocked}
                onPercentageChange={(newPct) => handlePercentageChange(category.id, newPct)}
                onToggleLock={() => handleToggleLock(category.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
