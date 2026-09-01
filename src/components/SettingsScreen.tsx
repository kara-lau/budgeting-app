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
  Save,
  Briefcase,
  Plus,
  Pencil,
  Trash2,
  X,
  LogOut,
  User as UserIcon,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { JobPreset } from '../types';
import { formatCurrency } from '../utils/storage';
import type { User } from '../lib/firebase';

interface SettingsScreenProps {
  categoryLimits?: Record<string, number>;
  monthlyBudgetLimit?: number;
  jobPresets?: JobPreset[];
  currentUser?: User | null;
  onBack: () => void;
  onUpdateCategoryLimits: (newLimits: Record<string, number>, newTotalBudget: number) => void;
  onAddJobPreset?: (preset: Omit<JobPreset, 'id'>) => JobPreset;
  onUpdateJobPreset?: (updated: JobPreset) => void;
  onDeleteJobPreset?: (id: string) => void;
  onSignOut?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  categoryLimits = {
    eating_out: 350,
    leisure: 250,
    groceries: 450,
    other: 150,
  },
  monthlyBudgetLimit = 1200,
  jobPresets = [],
  currentUser,
  onBack,
  onUpdateCategoryLimits,
  onAddJobPreset,
  onUpdateJobPreset,
  onDeleteJobPreset,
  onSignOut,
}) => {
  const [activeTab, setActiveTab] = useState<'budgets' | 'jobs' | 'account'>('budgets');

  // Local state for editing category limits
  const [limits, setLimits] = useState<Record<string, number>>({
    eating_out: categoryLimits.eating_out ?? 350,
    leisure: categoryLimits.leisure ?? 250,
    groceries: categoryLimits.groceries ?? 450,
    other: categoryLimits.other ?? 150,
  });

  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  // Job Editing State
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [isAddingJob, setIsAddingJob] = useState<boolean>(false);

  // Form fields for Add / Edit Job
  const [jobFormTitle, setJobFormTitle] = useState<string>('');
  const [jobFormWorkplace, setJobFormWorkplace] = useState<string>('');
  const [jobFormRate, setJobFormRate] = useState<string>('25.00');
  const [jobFormHours, setJobFormHours] = useState<string>('6.0');
  const [jobFormBonus, setJobFormBonus] = useState<string>('0');

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
    setSavedSuccess(null);
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
    setSavedSuccess(null);
  };

  const handleSaveBudgets = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onUpdateCategoryLimits(limits, totalAllocated);
    setSavedSuccess('Monthly category budget limits updated!');

    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#FB5607', '#3A86FF', '#FF006E', '#8338EC', '#FFBE0B'],
    });

    setTimeout(() => {
      setSavedSuccess(null);
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
    setSavedSuccess('Reset budget limits to defaults');
    setTimeout(() => setSavedSuccess(null), 2500);
  };

  // Job Handlers
  const handleStartEditJob = (job: JobPreset) => {
    setEditingJobId(job.id);
    setIsAddingJob(false);
    setJobFormTitle(job.title);
    setJobFormWorkplace(job.workplace);
    setJobFormRate(String(job.hourlyRate));
    setJobFormHours(String(job.defaultHours || 6));
    setJobFormBonus(String(job.defaultBonus || 0));
  };

  const handleStartAddJob = () => {
    setEditingJobId(null);
    setIsAddingJob(true);
    setJobFormTitle('');
    setJobFormWorkplace('');
    setJobFormRate('25.00');
    setJobFormHours('6.0');
    setJobFormBonus('0');
  };

  const handleCancelJobForm = () => {
    setEditingJobId(null);
    setIsAddingJob(false);
  };

  const handleSaveJobForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobFormTitle.trim() && !jobFormWorkplace.trim()) return;

    const rate = parseFloat(jobFormRate) || 20;
    const hours = parseFloat(jobFormHours) || 6;
    const bonus = parseFloat(jobFormBonus) || 0;
    const title = jobFormTitle.trim() || jobFormWorkplace.trim();
    const workplace = jobFormWorkplace.trim() || jobFormTitle.trim();

    if (editingJobId && onUpdateJobPreset) {
      onUpdateJobPreset({
        id: editingJobId,
        title,
        workplace,
        role: 'Staff',
        hourlyRate: rate,
        defaultHours: hours,
        defaultBonus: bonus,
      });
      setSavedSuccess(`Updated job: ${title}`);
    } else if (onAddJobPreset) {
      onAddJobPreset({
        title,
        workplace,
        role: 'Staff',
        hourlyRate: rate,
        defaultHours: hours,
        defaultBonus: bonus,
      });
      setSavedSuccess(`Added new job: ${title}`);
    }

    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#FB5607', '#FF006E', '#8338EC'],
    });

    setTimeout(() => setSavedSuccess(null), 3000);
    handleCancelJobForm();
  };

  const handleDeleteJob = (id: string, title: string) => {
    if (onDeleteJobPreset) {
      onDeleteJobPreset(id);
      setSavedSuccess(`Deleted job: ${title}`);
      setTimeout(() => setSavedSuccess(null), 2500);
    }
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
        <div className="flex items-center justify-between mb-3">
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

        {/* Tab Switcher: Budgets vs Jobs vs Account */}
        <div className="bg-stone-100 p-1 rounded-xl flex items-center mb-4 gap-0.5">
          <button
            type="button"
            onClick={() => setActiveTab('budgets')}
            className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'budgets'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <PieChart className="w-3.5 h-3.5 text-indigo-500" />
            <span>Budgets</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('jobs')}
            className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'jobs'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-pink-500" />
            <span>Jobs ({jobPresets.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('account')}
            className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'account'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5 text-amber-500" />
            <span>Account</span>
          </button>
        </div>

        {/* Success Toast */}
        {savedSuccess && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-slideDown shadow-xs">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{savedSuccess}</span>
          </div>
        )}

        {/* TAB 1: CATEGORY BUDGETS */}
        {activeTab === 'budgets' && (
          <div className="animate-fadeIn">
            {/* Monthly Budget Summary Card */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs mb-4">
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

              <form onSubmit={handleSaveBudgets} className="flex flex-col gap-3">
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
                                setSavedSuccess(null);
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
        )}

        {/* TAB 2: JOB LIST & EDITING */}
        {activeTab === 'jobs' && (
          <div className="flex flex-col gap-3.5 animate-fadeIn">
            {/* Header & Add Button */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                Configured Jobs ({jobPresets.length})
              </span>
              {!isAddingJob && !editingJobId && (
                <button
                  type="button"
                  onClick={handleStartAddJob}
                  className="px-3 py-1.5 rounded-xl text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all"
                  style={{ backgroundColor: '#FB5607' }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Job</span>
                </button>
              )}
            </div>

            {/* Add / Edit Job Form Card */}
            {(isAddingJob || editingJobId) && (
              <form 
                onSubmit={handleSaveJobForm}
                className="bg-white rounded-2xl p-4 border-2 border-stone-300 shadow-sm flex flex-col gap-3 animate-slideDown"
              >
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                    {editingJobId ? 'Edit Job Preset' : 'Add New Job Preset'}
                  </h4>
                  <button
                    type="button"
                    onClick={handleCancelJobForm}
                    className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-semibold text-stone-700 block mb-1">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Barista, Tutor"
                      value={jobFormTitle}
                      onChange={(e) => setJobFormTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:ring-1 focus:ring-stone-400 text-stone-900"
                      required
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-stone-700 block mb-1">
                      Workplace *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Café Luna"
                      value={jobFormWorkplace}
                      onChange={(e) => setJobFormWorkplace(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:ring-1 focus:ring-stone-400 text-stone-900"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-stone-700 block mb-1">
                      Rate ($/hr)
                    </label>
                    <input
                      type="number"
                      step="0.50"
                      min="1"
                      value={jobFormRate}
                      onChange={(e) => setJobFormRate(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs font-bold rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:ring-1 focus:ring-stone-400 text-stone-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-stone-700 block mb-1">
                      Default Hours
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={jobFormHours}
                      onChange={(e) => setJobFormHours(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs font-bold rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:ring-1 focus:ring-stone-400 text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-stone-700 block mb-1">
                      Default Tips ($)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={jobFormBonus}
                      onChange={(e) => setJobFormBonus(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs font-bold rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:ring-1 focus:ring-stone-400 text-stone-900"
                    />
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={handleCancelJobForm}
                    className="px-3 py-1.5 text-stone-500 hover:text-stone-800 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
                    style={{ backgroundColor: '#8338EC' }}
                  >
                    {editingJobId ? 'Save Changes' : 'Add Job Preset'}
                  </button>
                </div>
              </form>
            )}

            {/* List of Jobs */}
            <div className="flex flex-col gap-2.5">
              {jobPresets.map((job, idx) => {
                const colors = ['#FB5607', '#8338EC', '#FF006E', '#3A86FF', '#FFBE0B'];
                const cardColor = colors[idx % colors.length];

                return (
                  <div
                    key={job.id}
                    className={`bg-white rounded-2xl p-4 border transition-all shadow-xs ${
                      editingJobId === job.id ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-stone-200/90'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs font-bold text-sm"
                          style={{ backgroundColor: cardColor }}
                        >
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-stone-900 truncate">
                            {job.title}
                          </h4>
                          <p className="text-xs text-stone-500 truncate">
                            {job.workplace}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-stone-600 font-semibold mt-1">
                            <span className="text-stone-900 font-bold">${job.hourlyRate.toFixed(2)}/hr</span>
                            <span>•</span>
                            <span>{job.defaultHours || 6}h shift</span>
                            {job.defaultBonus ? (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                +${job.defaultBonus} tips
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {/* Edit and Delete Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEditJob(job)}
                          className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                          title="Edit job details"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {jobPresets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteJob(job.id, job.title)}
                            className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete job"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Google Account & Cloud Sync */}
        {activeTab === 'account' && (
          <div className="space-y-4 animate-fadeIn">
            {/* User Profile Card */}
            <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs">
              <div className="flex items-center gap-3.5 mb-4">
                {currentUser?.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-14 h-14 rounded-2xl border-2 border-amber-400 shadow-xs object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white font-bold text-xl flex items-center justify-center shadow-xs">
                    {(currentUser?.displayName || currentUser?.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-extrabold text-stone-900 truncate">
                      {currentUser?.displayName || 'Yippee User'}
                    </h3>
                  </div>
                  <p className="text-xs text-stone-500 truncate font-medium">
                    {currentUser?.email || 'Logged in via Google'}
                  </p>
                  <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Google Authenticated</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60 text-xs text-stone-600 space-y-1">
                <div className="font-semibold text-stone-800 flex items-center justify-between">
                  <span>Cloud Database Sync</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">Active</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Your shifts, expenses, job presets, and savings goals are automatically synchronized in real-time to your Google Account.
                </p>
              </div>
            </div>

            {/* Account Actions */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Sign out of your Google Account?')) {
                    if (onSignOut) onSignOut();
                  }
                }}
                className="w-full py-3.5 px-4 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border border-rose-200 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>Sign Out of Google</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Save Button for Category Budgets */}
      {activeTab === 'budgets' && (
        <div className="mt-6 pt-4 border-t border-stone-200/70">
          <button
            id="btn-save-settings"
            type="button"
            onClick={() => handleSaveBudgets()}
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
      )}
    </div>
  );
};
