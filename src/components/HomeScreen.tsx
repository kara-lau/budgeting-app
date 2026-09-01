import React from 'react';
import { 
  Receipt, 
  Briefcase, 
  PiggyBank, 
  ChevronRight, 
  History, 
  ArrowRight, 
  Settings 
} from 'lucide-react';
import { formatCurrency } from '../utils/storage';
import type { User } from '../lib/firebase';

interface HomeScreenProps {
  onNavigate: (screen: 'record_expense' | 'log_earnings' | 'allocate_money' | 'category_usage' | 'habits_history' | 'settings') => void;
  receivedEarnings: number;
  totalExpenses: number;
  monthlyBudgetLimit: number;
  pendingShiftCount: number;
  currentUser?: User | null;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  receivedEarnings,
  totalExpenses,
  monthlyBudgetLimit = 1200,
  pendingShiftCount,
  currentUser,
}) => {
  const netBalance = receivedEarnings - totalExpenses;
  const budgetUsagePct = Math.min(100, Math.round((totalExpenses / monthlyBudgetLimit) * 100));
  const remainingBudget = Math.max(0, monthlyBudgetLimit - totalExpenses);

  const todayStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="flex-1 flex flex-col px-5 py-6 justify-between animate-fadeIn">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-stone-700 block">
              {todayStr}
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900">
              Yippee Planner
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('habits_history')}
              className="p-2.5 rounded-full bg-white border border-stone-200/80 shadow-xs hover:bg-stone-50 text-stone-600 transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
              title="View spending history"
            >
              <History className="w-4 h-4 text-stone-600" />
              <span className="hidden xs:inline">History</span>
            </button>
            {currentUser && (
              <button
                onClick={() => onNavigate('settings')}
                className="w-9 h-9 rounded-full overflow-hidden border border-amber-400 shadow-xs hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center bg-amber-100 text-amber-900 font-bold text-xs"
                title={`Signed in as ${currentUser.displayName || currentUser.email}`}
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  (currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()
                )}
              </button>
            )}
          </div>
        </div>

        {/* 1. Dashboard: Overall Monthly Budget Usage */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">
              Monthly Budget Usage
            </span>
            <button
              onClick={() => onNavigate('category_usage')}
              className="text-xs font-bold flex items-center gap-1 hover:underline cursor-pointer transition-colors"
              style={{ color: '#8338EC' }}
            >
              <span>See details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="my-2">
            <div className="flex items-baseline justify-between mb-1.5">
              <div className="text-3xl font-extrabold text-stone-900 tracking-tight">
                {formatCurrency(totalExpenses)}
              </div>
              <div className="text-xs text-stone-700">
                of {formatCurrency(monthlyBudgetLimit)}
              </div>
            </div>

            {/* Clean Progress Bar with Vibrant Color */}
            <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${budgetUsagePct}%`,
                  backgroundColor: budgetUsagePct > 90 ? '#FF006E' : '#3A86FF',
                }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-medium text-stone-700 mt-2">
              <span>{formatCurrency(remainingBudget)} left</span>
              <span>{formatCurrency(netBalance)} cash balance</span>
            </div>
          </div>
        </div>

        {/* 2. Three Clean Action Options with Vibrant Button Accents */}
        <div className="text-xs font-semibold uppercase tracking-wider text-stone-700 mb-3 px-1">
          Actions
        </div>

        <div className="flex flex-col gap-3">
          {/* Action 1: Record an expense - Blaze Orange (#FB5607) */}
          <button
            id="btn-record-expense"
            onClick={() => onNavigate('record_expense')}
            className="group w-full text-left active:scale-[0.98] transition-all p-4 rounded-2xl shadow-sm hover:shadow-md cursor-pointer flex items-center justify-between text-white"
            style={{ backgroundColor: '#FFBE0B' }}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white/20 text-white">
                <Receipt className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-white">
                Record an expense
              </h2>
            </div>
            <div className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0">
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </button>

          {/* Action 2: Log earnings - Azure Blue (#3A86FF) */}
          <button
            id="btn-log-earnings"
            onClick={() => onNavigate('log_earnings')}
            className="group w-full text-left active:scale-[0.98] transition-all p-4 rounded-2xl shadow-sm hover:shadow-md cursor-pointer flex items-center justify-between text-white"
            style={{ backgroundColor: '#FB5607' }}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white/20 text-white">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Log earnings
                </h2>
                {pendingShiftCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-white text-blue-700 text-[10px] font-extrabold shadow-xs">
                    {pendingShiftCount} pending
                  </span>
                )}
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0">
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </button>

          {/* Action 3: Allocate money - Blue Violet (#8338EC) */}
          <button
            id="btn-allocate-money"
            onClick={() => onNavigate('allocate_money')}
            className="group w-full text-left active:scale-[0.98] transition-all p-4 rounded-2xl shadow-sm hover:shadow-md cursor-pointer flex items-center justify-between text-white"
            style={{ backgroundColor: '#FF006E' }}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white/20 text-white">
                <PiggyBank className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-white">
                Allocate funds
              </h2>
            </div>
            <div className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0">
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </button>
        </div>
      </div>

      {/* Clean Bottom Bar with Vibrant Settings Button */}
      <div className="mt-6 pt-4 border-t border-stone-200/70">
        <button
          id="btn-settings"
          onClick={() => onNavigate('settings')}
          className="w-full py-3.5 px-4 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer hover:opacity-95 active:scale-[0.98]"
          style={{ backgroundColor: '#8338EC' }}
        >
          <Settings className="w-4 h-4 text-white" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
};
