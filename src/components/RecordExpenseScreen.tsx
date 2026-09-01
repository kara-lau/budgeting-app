import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Check, 
  UtensilsCrossed, 
  Sparkles, 
  ShoppingBag, 
  Tag, 
  Plus, 
  Calendar,
  CreditCard,
  Banknote,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { Expense } from '../types';
import { formatCurrency } from '../utils/storage';

interface RecordExpenseScreenProps {
  onBack: () => void;
  onAddExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
}

type CoreCategory = 'eating_out' | 'leisure' | 'groceries' | 'other';

const CATEGORIES_CONFIG: {
  id: CoreCategory;
  name: string;
  subtitle: string;
  icon: typeof UtensilsCrossed;
  color: string;
  bgColor: string;
  borderColor: string;
  activeBorderColor: string;
  isOutsideFood: boolean;
  isLeisure: boolean;
}[] = [
  {
    id: 'eating_out',
    name: 'Eating Out',
    subtitle: 'Restaurants, cafes, takeout & drinks',
    icon: UtensilsCrossed,
    color: '#FB5607', // Blaze Orange
    bgColor: '#FFF3EB',
    borderColor: '#FFD7C2',
    activeBorderColor: '#FB5607',
    isOutsideFood: true,
    isLeisure: false,
  },
  {
    id: 'leisure',
    name: 'Leisure',
    subtitle: 'Movies, gaming, events & hobbies',
    icon: Sparkles,
    color: '#FF006E', // Neon Pink
    bgColor: '#FFF0F6',
    borderColor: '#FFCCE0',
    activeBorderColor: '#FF006E',
    isOutsideFood: false,
    isLeisure: true,
  },
  {
    id: 'groceries',
    name: 'Groceries',
    subtitle: 'Supermarket food & pantry staples',
    icon: ShoppingBag,
    color: '#FFBE0B', // Amber Gold
    bgColor: '#FFFBEA',
    borderColor: '#FDE68A',
    activeBorderColor: '#FFBE0B',
    isOutsideFood: false,
    isLeisure: false,
  },
  {
    id: 'other',
    name: 'Other',
    subtitle: 'Miscellaneous & general expenses',
    icon: Tag,
    color: '#8338EC', // Blue Violet
    bgColor: '#F5F0FF',
    borderColor: '#DDD0FC',
    activeBorderColor: '#8338EC',
    isOutsideFood: false,
    isLeisure: false,
  },
];

export const RecordExpenseScreen: React.FC<RecordExpenseScreenProps> = ({
  onBack,
  onAddExpense,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CoreCategory>('eating_out');
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [showOptionalFields, setShowOptionalFields] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<{ amount: number; categoryName: string } | null>(null);

  // Quick preset chips
  const quickPresets = [5, 10, 20, 50];

  const handlePresetClick = (presetVal: number) => {
    setAmount(presetVal.toString());
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    const catConfig = CATEGORIES_CONFIG.find((c) => c.id === selectedCategory)!;
    const effectiveDate = date && date.trim() ? date.trim() : new Date().toISOString().split('T')[0];

    onAddExpense({
      amount: numAmount,
      categoryId: selectedCategory,
      categoryName: catConfig.name,
      date: effectiveDate,
      note: note.trim() || catConfig.name,
      isOutsideFood: catConfig.isOutsideFood,
      isLeisure: catConfig.isLeisure,
      paymentMethod: 'card',
    });

    setSavedSuccess({
      amount: numAmount,
      categoryName: catConfig.name,
    });

    // Reset amount and note for next entry
    setAmount('');
    setNote('');
  };

  return (
    <div className="flex-1 flex flex-col px-5 py-6 justify-between animate-fadeIn">
      <div>
        {/* Top Bar with Back Button */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors p-1.5 -ml-1.5 rounded-lg hover:bg-stone-100 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">
            Record Expense
          </span>
          <div className="w-12" /> {/* Balancing spacer */}
        </div>

        {/* Success Modal / Toast Overlay if just saved */}
        {savedSuccess && (
          <div className="mb-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-xs flex items-center justify-between animate-slideDown">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-900">
                  Recorded {formatCurrency(savedSuccess.amount)}!
                </div>
                <div className="text-[11px] text-emerald-700">
                  Saved under {savedSuccess.categoryName}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSavedSuccess(null)}
                className="text-xs font-semibold text-emerald-800 bg-white/80 px-2.5 py-1 rounded-lg border border-emerald-200 hover:bg-white cursor-pointer"
              >
                Add Another
              </button>
              <button
                onClick={onBack}
                className="text-xs font-semibold text-emerald-900 bg-emerald-200/80 px-2.5 py-1 rounded-lg hover:bg-emerald-300 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-5">
          {/* Amount Display & Input */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs text-center">
            <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider block mb-2">
              Type the Amount
            </label>

            <div className="relative inline-flex items-center justify-center w-full">
              <span className="text-3xl font-light text-stone-400 mr-1 select-none">$</span>
              <input
                id="expense-amount-input"
                type="number"
                step="0.01"
                min="0.01"
                autoFocus
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-4xl sm:text-5xl font-extrabold text-stone-900 tracking-tight text-center bg-transparent focus:outline-none w-48 placeholder:text-stone-300"
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-stone-100">
              {quickPresets.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handlePresetClick(val)}
                  className="px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  ${val}
                </button>
              ))}
            </div>
          </div>

          {/* 4 Core Categories Requested */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2.5 block px-1">
              Select Category
            </label>

            <div className="grid grid-cols-2 gap-2.5">
              {CATEGORIES_CONFIG.map((cat) => {
                const IconComponent = cat.icon;
                const isSelected = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-4 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between min-h-[84px] shadow-sm ${
                      isSelected
                        ? 'ring-2 ring-stone-900 ring-offset-2 scale-[1.02]'
                        : 'opacity-90 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: cat.color,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/20 text-white">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full flex items-center justify-center bg-white text-stone-900 font-bold text-[11px] shadow-xs">
                          ✓
                        </span>
                      )}
                    </div>

                    <div className="mt-2.5">
                      <div className="text-sm font-bold text-white leading-tight">
                        {cat.name}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Note & Date Toggle */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-xs">
            <button
              type="button"
              onClick={() => setShowOptionalFields(!showOptionalFields)}
              className="w-full flex items-center justify-between text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
            >
              <span>{showOptionalFields ? 'Hide details' : '+ Add optional note or date'}</span>
              <span className="text-stone-400">{showOptionalFields ? '▲' : '▼'}</span>
            </button>

            {showOptionalFields && (
              <div className="mt-3 pt-3 border-t border-stone-100 flex flex-col gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                    Note or Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lunch sushi, concert ticket, etc."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400 text-stone-900"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-stone-700 block">
                      Date
                    </label>
                    <span className="text-[10px] text-stone-400">Defaults to today</span>
                  </div>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400 text-stone-900"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Large Save Button */}
          <button
            id="btn-save-expense"
            type="submit"
            disabled={!amount || parseFloat(amount) <= 0}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
              amount && parseFloat(amount) > 0
                ? 'text-white hover:opacity-95 active:scale-[0.98]'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
            style={{
              backgroundColor: amount && parseFloat(amount) > 0 ? '#ff006e' : undefined,
              boxShadow: amount && parseFloat(amount) > 0 ? '0 4px 14px 0 rgba(251, 86, 7, 0.35)' : 'none',
            }}
          >
            <span>Save Expense</span>
            {amount && parseFloat(amount) > 0 && (
              <span className="opacity-95">({formatCurrency(parseFloat(amount))})</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
