import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Settings as SettingsIcon, 
  UtensilsCrossed, 
  Sparkles, 
  ShoppingBag, 
  MoreHorizontal, 
  Check, 
  RotateCcw,
  DollarSign,
  PieChart,
  Save
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DEFAULT_CATEGORIES } from '../types';
import { formatCurrency } from '../utils/storage';

interface SettingsScreenProps {
  categoryLimits?: Record<string, number>;
  monthlyBudgetLimit?: number;
  onBack: () => void;
  onUpdateCategoryLimits: (newLimits: Record<string, number>, newTotalBudget: number) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  categoryLimits = {
    eating_out: 350,
    leisure: 250,
    groceries: 450,
    other: 150,
  },
  monthlyBudgetLimit = 1200,
  onBack,
  onUpdateCategoryLimits,
}) => {
  // Local state for editing category limits
  const [limits, setLimits] = useState<Record<string, number>>({
    eating_out: categoryLimits.eating_out ?? 350,
    leisure: categoryLimits.leisure ?? 250,
    groceries: categoryLimits.groceries ?? 450,
    other: categoryLimits.other ?? 150,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Calculate sum of category allocations
  const totalAllocated: number = Object.keys(limits).reduce(
    (sum: number, key: string) => sum + (Number(limits[key]) || 0),
    0
  );

  const handleLimitChange = (categoryId: string, rawVal: string) => {
    const num = Math.max(0, parseFloat(rawVal) || 0);
    setLimits((prev) => ({
      ...prev,
      [categoryId]: num,
    }));
    setSavedSuccess(false);
  };

  const handleQuickAdjust = (categoryId: string, delta: number) => {
    setLimits((prev) => {
      const current = Number(prev[categoryId]) || 0;
      const updated = Math.max(0, current + delta);
      return {
        ...prev,
        [categoryId]: updated,
      };
    });
    setSavedSuccess(false);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onUpdateCategoryLimits(limits, totalAllocated);
    setSavedSuccess(true);

    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#FB5607', '#3A86FF', '#FF006E', '#8338EC', '#FFBE0B'],
    });

    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  const handleResetToDefaults = () => {
    const defaults = {
      eating_out: 350,
      leisure: 250,
      groceries: 450,
      other: 150,
    };
    setLimits(defaults);
    onUpdateCategoryLimits(defaults, 1200);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const getCategoryMeta = (id: string) => {
    switch (id) {
      case 'eating_out':
        return {
          name: 'Eating Out',
          color: '#FB5607',
          icon: UtensilsCrossed,
          quickPresets: [200, 350, 500],
        };
      case 'leisure':
        return {
          name: 'Leisure',
          color: '#FF006E',
          icon: Sparkles,
          quickPresets: [150, 250, 400],
        };
      case 'groceries':
        return {
          name: 'Groceries',
          color: '#FFBE0B',
          icon: ShoppingBag,
          quickPresets: [300, 450, 600],
        };
      default:
        return {
          name: 'Other',
          color: '#8338EC',
          icon: MoreHorizontal,
          quickPresets: [100, 150, 300],
        };
    }
  };

  const categoriesOrder = ['eating_out', 'leisure', 'groceries', 'other'];

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
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-700">
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>Settings</span>
          </div>
          <div className="w-12" />
        </div>

        {/* Success Toast */}
        {savedSuccess && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-slideDown shadow-xs">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Monthly category budget limits updated!</span>
          </div>
        )}

        {/* Monthly Budget Summary Card */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs mb-5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">
              Total Monthly Allocation
            </span>
            <span className="text-xs font-bold" style={{ color: '#8338EC' }}>
              4 Categories
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight my-1">
            {formatCurrency(totalAllocated)}
          </div>

          {/* Allocation distribution stacked bar */}
          <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden flex my-3">
            {categoriesOrder.map((catId) => {
              const meta = getCategoryMeta(catId);
              const val: number = Number(limits[catId]) || 0;
              const pct: number = totalAllocated > 0 ? (val / totalAllocated) * 100 : 25;
              return (
                <div
                  key={catId}
                  title={`${meta.name}: ${formatCurrency(val)} (${pct.toFixed(0)}%)`}
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: meta.color,
                  }}
                />
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-700">
            <span>Sum of all category limits</span>
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="font-semibold text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to defaults</span>
            </button>
          </div>
        </div>

        {/* Category Limit Sliders & Input Cards */}
        <div className="mb-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-700 mb-3 px-1">
            Category Monthly Limits
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-3.5">
            {categoriesOrder.map((catId) => {
              const meta = getCategoryMeta(catId);
              const IconComp = meta.icon;
              const currentVal: number = Number(limits[catId]) || 0;
              const pctOfTotal: number = totalAllocated > 0 ? Math.round((currentVal / totalAllocated) * 100) : 0;

              return (
                <div
                  key={catId}
                  className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-xs"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                        style={{ backgroundColor: meta.color }}
                      >
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-stone-900 leading-none">
                          {meta.name}
                        </h3>
                        <span className="text-[11px] font-semibold text-stone-700">
                          {pctOfTotal}% of total
                        </span>
                      </div>
                    </div>

                    {/* Number input field */}
                    <div className="relative w-28">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-xs">
                        $
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={currentVal === 0 ? '' : currentVal}
                        onChange={(e) => handleLimitChange(catId, e.target.value)}
                        placeholder="0"
                        className="w-full pl-6 pr-2.5 py-1.5 text-right font-extrabold text-sm rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
                      />
                    </div>
                  </div>

                  {/* Stepper and Quick Presets */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-100">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleQuickAdjust(catId, -50)}
                        className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center justify-center cursor-pointer transition-colors"
                        title="Subtract $50"
                      >
                        -50
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAdjust(catId, 50)}
                        className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center justify-center cursor-pointer transition-colors"
                        title="Add $50"
                      >
                        +50
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {meta.quickPresets.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            setLimits((prev) => ({ ...prev, [catId]: preset }));
                            setSavedSuccess(false);
                          }}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                            currentVal === preset
                              ? 'text-white shadow-xs'
                              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                          }`}
                          style={{
                            backgroundColor: currentVal === preset ? meta.color : undefined,
                          }}
                        >
                          ${preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </form>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 pt-4 border-t border-stone-200/70">
        <button
          id="btn-save-settings"
          type="button"
          onClick={() => handleSave()}
          className="w-full py-4 px-6 rounded-2xl text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          style={{
            backgroundColor: '#8338EC',
            boxShadow: '0 4px 14px 0 rgba(131, 56, 236, 0.35)',
          }}
        >
          <Save className="w-4 h-4" />
          <span>Save Allocations ({formatCurrency(totalAllocated)}/mo)</span>
        </button>
      </div>
    </div>
  );
};
