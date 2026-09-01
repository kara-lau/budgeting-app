import React, { useState } from 'react';
import { 
  PieChart, 
  RotateCcw, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Wallet, 
  Layers, 
  Sliders,
  DollarSign,
  TrendingUp,
  Scale
} from 'lucide-react';
import { BudgetConfig, DEFAULT_CATEGORIES, Expense, Shift } from '../types';
import { RadialSlider } from './RadialSlider';
import { formatCurrency } from '../utils/storage';

interface BudgetAllocatorProps {
  budgetConfig: BudgetConfig;
  shifts: Shift[];
  expenses: Expense[];
  onUpdateBudgetConfig: (newConfig: BudgetConfig) => void;
}

export const BudgetAllocator: React.FC<BudgetAllocatorProps> = ({
  budgetConfig,
  shifts,
  expenses,
  onUpdateBudgetConfig,
}) => {
  const [customAmountInput, setCustomAmountInput] = useState<string>(
    budgetConfig.customPoolAmount.toString()
  );

  // Compute available pool amounts
  const receivedTotal = shifts
    .filter((s) => s.status === 'received')
    .reduce((sum, s) => sum + s.totalEarnings, 0);

  const projectedTotal = shifts.reduce((sum, s) => sum + s.totalEarnings, 0);

  // Determine active total pool
  let activePool = 0;
  if (budgetConfig.earningsSource === 'received') {
    activePool = receivedTotal;
  } else if (budgetConfig.earningsSource === 'projected') {
    activePool = projectedTotal;
  } else {
    activePool = budgetConfig.customPoolAmount;
  }

  // Ensure minimum pool for visual calculation fallback
  const effectivePool = activePool > 0 ? activePool : 1500;

  // Calculate allocations and total percentage
  const totalAllocatedPercentage = budgetConfig.allocations.reduce(
    (sum, a) => sum + a.percentage,
    0
  );
  const unallocatedPercentage = 100 - totalAllocatedPercentage;
  const unallocatedAmount = (unallocatedPercentage / 100) * effectivePool;
  const totalAllocatedDollars = (totalAllocatedPercentage / 100) * effectivePool;

  // Actual spend per category
  const spendByCategory: Record<string, number> = {};
  DEFAULT_CATEGORIES.forEach((c) => (spendByCategory[c.id] = 0));
  expenses.forEach((e) => {
    spendByCategory[e.categoryId] = (spendByCategory[e.categoryId] || 0) + e.amount;
  });

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Handler for individual percentage adjustment
  const handlePercentageChange = (categoryId: string, newPercentage: number) => {
    const nextAllocations = budgetConfig.allocations.map((a) => {
      if (a.categoryId === categoryId) {
        return { ...a, percentage: newPercentage };
      }
      return a;
    });

    onUpdateBudgetConfig({
      ...budgetConfig,
      allocations: nextAllocations,
    });
  };

  // Toggle lock state
  const handleToggleLock = (categoryId: string) => {
    const nextAllocations = budgetConfig.allocations.map((a) => {
      if (a.categoryId === categoryId) {
        return { ...a, isLocked: !a.isLocked };
      }
      return a;
    });

    onUpdateBudgetConfig({
      ...budgetConfig,
      allocations: nextAllocations,
    });
  };

  // Switch earnings pool source
  const handleSourceChange = (source: 'received' | 'projected' | 'custom') => {
    onUpdateBudgetConfig({
      ...budgetConfig,
      earningsSource: source,
    });
  };

  const handleCustomAmountSave = () => {
    const val = parseFloat(customAmountInput);
    if (!isNaN(val) && val >= 0) {
      onUpdateBudgetConfig({
        ...budgetConfig,
        earningsSource: 'custom',
        customPoolAmount: val,
      });
    }
  };

  // Auto-distribute remainder equally among unlocked categories
  const handleAutoDistribute = () => {
    const unlocked = budgetConfig.allocations.filter((a) => !a.isLocked);
    if (unlocked.length === 0) return;

    const lockedSum = budgetConfig.allocations
      .filter((a) => a.isLocked)
      .reduce((sum, a) => sum + a.percentage, 0);

    const remainingToShare = Math.max(0, 100 - lockedSum);
    const perCategory = Math.floor(remainingToShare / unlocked.length);
    const remainder = remainingToShare % unlocked.length;

    let index = 0;
    const nextAllocations = budgetConfig.allocations.map((a) => {
      if (a.isLocked) return a;
      const extra = index < remainder ? 1 : 0;
      index++;
      return {
        ...a,
        percentage: perCategory + extra,
      };
    });

    onUpdateBudgetConfig({
      ...budgetConfig,
      allocations: nextAllocations,
    });
  };

  // Reset to Recommended percentages
  const handleResetDefaults = () => {
    const defaultAllocations = DEFAULT_CATEGORIES.map((c) => ({
      categoryId: c.id,
      percentage: c.defaultPercentage,
      isLocked: false,
    }));

    onUpdateBudgetConfig({
      ...budgetConfig,
      allocations: defaultAllocations,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Pool Control Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {/* Earnings Pool Header */}
        <div className="p-6 bg-gradient-to-br from-stone-900 to-stone-800 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <Wallet className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold tracking-tight">
                  Earnings Budget Allocation
                </h2>
              </div>
              <p className="text-xs text-stone-300 mt-1 max-w-xl">
                Distribute your total shift earnings across specific lifestyle and living budgets using interactive radial sliders.
              </p>
            </div>

            {/* Source Selector Buttons */}
            <div className="flex items-center gap-1.5 bg-stone-800/80 p-1.5 rounded-xl border border-stone-700/60">
              <button
                type="button"
                onClick={() => handleSourceChange('received')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  budgetConfig.earningsSource === 'received'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                Received ({formatCurrency(receivedTotal)})
              </button>
              <button
                type="button"
                onClick={() => handleSourceChange('projected')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  budgetConfig.earningsSource === 'projected'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                Projected ({formatCurrency(projectedTotal)})
              </button>
              <button
                type="button"
                onClick={() => handleSourceChange('custom')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  budgetConfig.earningsSource === 'custom'
                    ? 'bg-amber-500 text-stone-900 shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                Custom Pool
              </button>
            </div>
          </div>

          {/* Large Pool Readout Banner */}
          <div className="mt-6 pt-5 border-t border-stone-700/60 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            {/* Total Pool */}
            <div className="bg-white/5 rounded-xl p-3.5 border border-white/10">
              <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold block">
                Total Available Earnings Pool
              </span>
              <div className="text-3xl font-extrabold text-white mt-1">
                {formatCurrency(effectivePool)}
              </div>
              {budgetConfig.earningsSource === 'custom' ? (
                <div className="flex items-center gap-2 mt-2">
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400">$</span>
                    <input
                      type="number"
                      value={customAmountInput}
                      onChange={(e) => setCustomAmountInput(e.target.value)}
                      className="w-full pl-6 pr-2 py-1 text-xs rounded-lg bg-stone-800 border border-stone-600 text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleCustomAmountSave}
                    className="px-2.5 py-1 text-xs font-bold bg-amber-400 text-stone-900 rounded-lg hover:bg-amber-300 transition-colors"
                  >
                    Set
                  </button>
                </div>
              ) : (
                <span className="text-[11px] text-stone-400 mt-1 block">
                  {budgetConfig.earningsSource === 'received'
                    ? 'Based strictly on verified deposited shift earnings'
                    : 'Includes both pending and received work shifts'}
                </span>
              )}
            </div>

            {/* Allocated Total */}
            <div className="bg-white/5 rounded-xl p-3.5 border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold block">
                  Total Allocated
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  totalAllocatedPercentage === 100
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : totalAllocatedPercentage > 100
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {totalAllocatedPercentage}%
                </span>
              </div>
              <div className="text-2xl font-extrabold text-stone-100 mt-1">
                {formatCurrency(totalAllocatedDollars)}
              </div>
              <span className="text-[11px] text-stone-400 mt-1 block">
                Across {budgetConfig.allocations.length} budget buckets
              </span>
            </div>

            {/* Remaining / Over allocation */}
            <div className="bg-white/5 rounded-xl p-3.5 border border-white/10">
              <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold block">
                {totalAllocatedPercentage > 100 ? 'Over-Allocated Deficit' : 'Unallocated Buffer'}
              </span>
              <div className={`text-2xl font-extrabold mt-1 ${
                totalAllocatedPercentage > 100 ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {totalAllocatedPercentage > 100
                  ? `-${formatCurrency(Math.abs(unallocatedAmount))}`
                  : formatCurrency(unallocatedAmount)}
              </div>
              <span className="text-[11px] text-stone-400 mt-1 block">
                {totalAllocatedPercentage === 100
                  ? '100% fully balanced!'
                  : `${Math.abs(unallocatedPercentage)}% remaining`}
              </span>
            </div>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="px-6 py-3 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-stone-700">
            <Info className="w-4 h-4 text-stone-700 shrink-0" />
            <span>
              Tip: Drag radial dials or click <strong className="font-semibold text-stone-800">±5%</strong> to tune allocations. Click lock icons to freeze specific budgets.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAutoDistribute}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-stone-700 hover:text-stone-900 font-semibold shadow-2xs hover:bg-stone-50 transition-colors"
            >
              <Scale className="w-3.5 h-3.5 text-stone-700" />
              Auto-Distribute Remainder
            </button>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-stone-700 hover:text-stone-900 font-semibold shadow-2xs hover:bg-stone-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-700" />
              Reset Defaults
            </button>
          </div>
        </div>

        {/* Over-allocation warning banner */}
        {totalAllocatedPercentage > 100 && (
          <div className="px-6 py-3 bg-rose-50 border-t border-rose-200 text-rose-800 flex items-center gap-2 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              Total allocations exceed 100% by {totalAllocatedPercentage - 100}%. Reduce some categories to balance your cashflow.
            </span>
          </div>
        )}
      </div>

      {/* Grid of Radial Category Sliders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-stone-900">
              Interactive Category Dial Sliders
            </h3>
            <p className="text-xs text-stone-700">
              Drag each ring to assign a portion of your total earnings pool.
            </p>
          </div>
          <div className="text-xs font-semibold text-stone-700">
            Total Spend Logged: <strong className="text-stone-900">{formatCurrency(totalSpent)}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {DEFAULT_CATEGORIES.map((category) => {
            const allocation = budgetConfig.allocations.find((a) => a.categoryId === category.id) || {
              categoryId: category.id,
              percentage: category.defaultPercentage,
              isLocked: false,
            };

            const allocatedAmount = (allocation.percentage / 100) * effectivePool;
            const spentAmount = spendByCategory[category.id] || 0;

            return (
              <RadialSlider
                key={category.id}
                category={category}
                percentage={allocation.percentage}
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
