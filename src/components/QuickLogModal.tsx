import React, { useState } from 'react';
import { X, ReceiptText, Briefcase, PlusCircle, CheckCircle2, UtensilsCrossed, Sparkles } from 'lucide-react';
import { DEFAULT_CATEGORIES, Expense, Shift, ShiftStatus } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { formatCurrency } from '../utils/storage';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  onAddShift: (shift: Omit<Shift, 'id' | 'createdAt'>) => void;
}

export const QuickLogModal: React.FC<QuickLogModalProps> = ({
  isOpen,
  onClose,
  onAddExpense,
  onAddShift,
}) => {
  const [activeMode, setActiveMode] = useState<'expense' | 'shift'>('expense');

  // Expense form state
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState('dining_out');
  const [expNote, setExpNote] = useState('');
  const [expDate, setExpDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isFood, setIsFood] = useState(true);
  const [isLeisure, setIsLeisure] = useState(false);

  // Shift form state
  const [shiftWorkplace, setShiftWorkplace] = useState('Apex Cafe & Roasters');
  const [shiftHours, setShiftHours] = useState('6.5');
  const [shiftRate, setShiftRate] = useState('24.00');
  const [shiftBonus, setShiftBonus] = useState('0');
  const [shiftDate, setShiftDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [shiftStatus, setShiftStatus] = useState<ShiftStatus>('pending');

  if (!isOpen) return null;

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(expAmount);
    if (isNaN(num) || num <= 0) return;

    const cat = DEFAULT_CATEGORIES.find((c) => c.id === expCategory);
    onAddExpense({
      amount: num,
      categoryId: expCategory,
      categoryName: cat ? cat.name : 'Expense',
      date: expDate,
      note: expNote.trim() || (cat ? cat.name : 'Expense'),
      isOutsideFood: isFood,
      isLeisure: isLeisure,
      paymentMethod: 'card',
    });

    onClose();
  };

  const handleShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseFloat(shiftHours) || 0;
    const r = parseFloat(shiftRate) || 0;
    const b = parseFloat(shiftBonus) || 0;
    if (h <= 0 || r <= 0) return;

    const total = h * r + b;

    onAddShift({
      workplace: shiftWorkplace.trim() || 'Work Shift',
      role: 'Team Member',
      date: shiftDate,
      hoursWorked: h,
      hourlyRate: r,
      bonus: b,
      totalEarnings: total,
      status: shiftStatus,
      receivedDate: shiftStatus === 'received' ? shiftDate : undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold">Quick Entry</h3>
            <span className="text-xs text-stone-300">Fast transaction logger</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 p-2 bg-stone-100 border-b border-stone-200">
          <button
            type="button"
            onClick={() => setActiveMode('expense')}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMode === 'expense'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <ReceiptText className="w-4 h-4 text-amber-600" />
            Record Expense
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('shift')}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMode === 'shift'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <Briefcase className="w-4 h-4 text-emerald-600" />
            Record Work Shift
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {activeMode === 'expense' ? (
            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Amount Spent ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  className="w-full px-4 py-2.5 text-xl font-bold rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-200 focus:border-amber-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Category *
                </label>
                <select
                  value={expCategory}
                  onChange={(e) => {
                    setExpCategory(e.target.value);
                    const cat = DEFAULT_CATEGORIES.find((c) => c.id === e.target.value);
                    if (cat?.isOutsideFood) {
                      setIsFood(true);
                      setIsLeisure(false);
                    } else if (cat?.isLeisure) {
                      setIsFood(false);
                      setIsLeisure(true);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50"
                >
                  {DEFAULT_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Item / Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lunch with friend"
                  value={expNote}
                  onChange={(e) => setExpNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsFood(!isFood)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-1 ${
                    isFood ? 'bg-orange-100 border-orange-300 text-orange-800 font-bold' : 'bg-stone-50 border-stone-200 text-stone-700'
                  }`}
                >
                  <UtensilsCrossed className="w-3 h-3" />
                  Outside Food
                </button>
                <button
                  type="button"
                  onClick={() => setIsLeisure(!isLeisure)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-1 ${
                    isLeisure ? 'bg-purple-100 border-purple-300 text-purple-800 font-bold' : 'bg-stone-50 border-stone-200 text-stone-700'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  Leisure Activity
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Save Expense
              </button>
            </form>
          ) : (
            <form onSubmit={handleShiftSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Workplace / Employer *
                </label>
                <input
                  type="text"
                  required
                  value={shiftWorkplace}
                  onChange={(e) => setShiftWorkplace(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">Hours</label>
                  <input
                    type="number"
                    step="0.25"
                    value={shiftHours}
                    onChange={(e) => setShiftHours(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">Rate ($/hr)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={shiftRate}
                    onChange={(e) => setShiftRate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">Tips/Bonus</label>
                  <input
                    type="number"
                    step="1"
                    value={shiftBonus}
                    onChange={(e) => setShiftBonus(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-stone-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Initial Payment Status
                </label>
                <select
                  value={shiftStatus}
                  onChange={(e) => setShiftStatus(e.target.value as ShiftStatus)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 font-medium"
                >
                  <option value="pending">⏳ Pending (To check off later)</option>
                  <option value="received">✓ Already Received / Paid</option>
                </select>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex justify-between items-center text-xs">
                <span className="text-stone-700">Calculated Earnings:</span>
                <span className="font-extrabold text-emerald-600 text-sm">
                  {formatCurrency((parseFloat(shiftHours) || 0) * (parseFloat(shiftRate) || 0) + (parseFloat(shiftBonus) || 0))}
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Save Shift
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
