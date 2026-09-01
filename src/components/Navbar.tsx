import React from 'react';
import { 
  ReceiptText, 
  Briefcase, 
  PieChart, 
  History, 
  Plus, 
  RotateCcw, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  Wallet
} from 'lucide-react';
import { formatCurrency } from '../utils/storage';

export type ActiveTab = 'expenses' | 'shifts' | 'allocator' | 'history';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  receivedEarnings: number;
  pendingEarnings: number;
  totalExpenses: number;
  pendingShiftCount: number;
  onOpenQuickLog: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  receivedEarnings,
  pendingEarnings,
  totalExpenses,
  pendingShiftCount,
  onOpenQuickLog,
  onResetData,
}) => {
  const netCashflow = receivedEarnings - totalExpenses;

  const navItems: { id: ActiveTab; label: string; priority: string; icon: React.ReactNode; badge?: string | number }[] = [
    {
      id: 'expenses',
      label: 'Record Expenses',
      priority: '#1 Frequent',
      icon: <ReceiptText className="w-4 h-4" />,
    },
    {
      id: 'shifts',
      label: 'Earnings & Shifts',
      priority: '#2 Shifts & Payouts',
      icon: <Briefcase className="w-4 h-4" />,
      badge: pendingShiftCount > 0 ? `${pendingShiftCount} pending` : undefined,
    },
    {
      id: 'allocator',
      label: 'Budget Allocator',
      priority: '#3 Radial Sliders',
      icon: <PieChart className="w-4 h-4" />,
    },
    {
      id: 'history',
      label: 'Habits & History',
      priority: 'Food & Leisure',
      icon: <History className="w-4 h-4" />,
    },
  ];

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-xs">
      {/* Top Utility and Live Metrics Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between py-3 gap-4 border-b border-stone-100">
          {/* Brand & App Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 flex items-center justify-center text-white shadow-xs">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-stone-900 tracking-tight">
                  CashFlow
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-stone-900 text-amber-300">
                  Tracker & Budget
                </span>
              </div>
              <p className="text-xs text-stone-700">
                Visual cashflow, shift payouts & radial category allocator
              </p>
            </div>
          </div>

          {/* Live Cashflow Ribbon */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Net Cashflow Pill */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-[11px] text-stone-700 font-medium uppercase tracking-wider">
                Net Cashflow
              </span>
              <span
                className={`text-sm font-extrabold flex items-center gap-1 ${
                  netCashflow >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {netCashflow >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {formatCurrency(netCashflow)}
              </span>
            </div>

            {/* Inflow Received */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-900 font-semibold">
                +{formatCurrency(receivedEarnings)}
              </span>
              <span className="text-emerald-800 text-[10px]">In</span>
            </div>

            {/* Outflow Spent */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50/70 border border-rose-200 text-xs">
              <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
              <span className="text-rose-900 font-semibold">
                -{formatCurrency(totalExpenses)}
              </span>
              <span className="text-rose-800 text-[10px]">Out</span>
            </div>

            {/* Quick Log Global Action Button */}
            <button
              type="button"
              onClick={onOpenQuickLog}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow-xs hover:shadow transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Quick Log</span>
            </button>

            {/* Reset sample data */}
            <button
              type="button"
              onClick={onResetData}
              title="Reset to sample test data"
              className="p-2 text-stone-700 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Priority Navigation Tabs (Ordered strictly by requested usage frequency) */}
        <nav className="flex items-center space-x-1 overflow-x-auto py-2 scrollbar-none" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    isActive ? 'bg-stone-900 text-amber-300' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
