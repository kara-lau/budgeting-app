import React, { useState } from 'react';
import { 
  ArrowLeft, 
  PiggyBank, 
  Plus, 
  Check, 
  Trash2, 
  X, 
  Target,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SavingsProject, Shift } from '../types';
import { formatCurrency } from '../utils/storage';

interface AllocateMoneyScreenProps {
  shifts: Shift[];
  savingsProjects: SavingsProject[];
  generalSavings: number;
  onBack: () => void;
  onSaveToGeneralSavings: (amount: number) => void;
  onAddToProject: (projectId: string, amount: number) => void;
  onAddProject: (project: Omit<SavingsProject, 'id' | 'createdAt'>) => void;
  onDeleteProject: (id: string) => void;
}

export const AllocateMoneyScreen: React.FC<AllocateMoneyScreenProps> = ({
  shifts,
  savingsProjects,
  generalSavings,
  onBack,
  onSaveToGeneralSavings,
  onAddToProject,
  onAddProject,
  onDeleteProject,
}) => {
  // Calculate total received earnings
  const receivedTotal = shifts
    .filter((s) => s.status === 'received')
    .reduce((sum, s) => sum + s.totalEarnings, 0);

  // Total allocated into projects
  const totalInProjects = savingsProjects.reduce((sum, p) => sum + p.currentAmount, 0);

  // Unallocated received funds pool
  const unallocatedFunds = Math.max(0, receivedTotal - totalInProjects - generalSavings);

  // Local state for allocations
  const [projectAmounts, setProjectAmounts] = useState<Record<string, string>>({});
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New Project Form State
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');

  // 1-TAP SAVE ALL UNALLOCATED FUNDS
  const handleSaveAllUnallocated = () => {
    const amountToSave = unallocatedFunds > 0 ? unallocatedFunds : 50; // fallback if already banked
    onSaveToGeneralSavings(amountToSave);
    
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFBE0B', '#FB5607', '#FF006E', '#8338EC', '#3A86FF'],
    });

    setSuccessToast(`Saved ${formatCurrency(amountToSave)} directly to General Savings!`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Quick Preset Add to Project
  const handleQuickAddProject = (projectId: string, projectTitle: string, amount: number) => {
    onAddToProject(projectId, amount);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#FFBE0B', '#FB5607', '#FF006E', '#8338EC', '#3A86FF'],
    });
    setSuccessToast(`Added ${formatCurrency(amount)} to ${projectTitle}`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Handle Custom Add to a specific project
  const handleAddFundToProject = (projectId: string, projectTitle: string) => {
    const raw = projectAmounts[projectId];
    const amount = parseFloat(raw);
    if (isNaN(amount) || amount <= 0) return;

    onAddToProject(projectId, amount);
    confetti({
      particleCount: 45,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFBE0B', '#FB5607', '#FF006E', '#8338EC', '#3A86FF'],
    });
    setSuccessToast(`Added ${formatCurrency(amount)} to ${projectTitle}`);
    setProjectAmounts((prev) => ({ ...prev, [projectId]: '' }));
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Handle Create Project
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const target = parseFloat(newTarget);
    if (isNaN(target) || target <= 0) return;

    onAddProject({
      title: newTitle.trim(),
      targetAmount: target,
      currentAmount: 0,
    });

    setNewTitle('');
    setNewTarget('');
    setIsCreatingProject(false);
  };

  return (
    <div className="flex-1 flex flex-col px-5 py-6 justify-between animate-fadeIn relative">
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
            Allocate Funds
          </span>
          <div className="w-12" />
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-slideDown shadow-xs">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Available Funds Hero Card with Integrated Save It Action */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs mb-5">
          <div className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
            Unallocated Received Funds
          </div>
          <div className="text-4xl sm:text-5xl font-extrabold text-stone-900 tracking-tight my-2">
            {formatCurrency(unallocatedFunds)}
          </div>

          {/* Simple One-Tap Vibrant "Save It" Button inside the block */}
          <button
            id="btn-simple-save-it"
            type="button"
            onClick={handleSaveAllUnallocated}
            disabled={unallocatedFunds <= 0}
            className="w-full mt-4 py-3.5 px-4 rounded-xl text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            style={{
              backgroundColor: unallocatedFunds > 0 ? '#ff006e' : '#94A3B8',
              boxShadow: unallocatedFunds > 0 ? '0 4px 14px 0 rgba(58, 134, 255, 0.35)' : 'none',
            }}
          >
            <PiggyBank className="w-4 h-4" />
            <span>
              {unallocatedFunds > 0
                ? `Save it (${formatCurrency(unallocatedFunds)})`
                : 'All funds saved'}
            </span>
          </button>
        </div>

        {/* OPTION 2: SAVINGS PROJECTS */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">
              Savings Projects
            </span>
            <button
              type="button"
              onClick={() => setIsCreatingProject(true)}
              className="px-2.5 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-1 cursor-pointer shadow-xs active:scale-95 transition-all"
              style={{ backgroundColor: '#FF006E' }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </button>
          </div>

          {savingsProjects.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 border border-dashed border-stone-200 text-center">
              <Target className="w-6 h-6 text-stone-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-stone-700">No savings projects yet</p>
              <button
                type="button"
                onClick={() => setIsCreatingProject(true)}
                className="mt-2 text-xs font-bold hover:underline cursor-pointer"
                style={{ color: '#FF006E' }}
              >
                + Create "Concert tickets" or goal
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {savingsProjects.map((project, idx) => {
                const progressPct = Math.min(
                  100,
                  Math.round((project.currentAmount / project.targetAmount) * 100)
                );
                const isComplete = project.currentAmount >= project.targetAmount;
                const remaining = Math.max(0, project.targetAmount - project.currentAmount);

                // Alternate vibrant project colors from the palette
                const projectPalette = ['#FB5607', '#8338EC', '#FFBE0B', '#FF006E'];
                const accentColor = projectPalette[idx % projectPalette.length];

                return (
                  <div
                    key={project.id}
                    className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded-lg text-white flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ backgroundColor: accentColor }}
                        >
                          <Target className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="text-xs font-bold text-stone-900">{project.title}</h4>
                      </div>

                      <div className="flex items-center gap-2">
                        {isComplete ? (
                          <span 
                            className="px-2 py-0.5 rounded-full text-white text-[10px] font-bold"
                            style={{ backgroundColor: '#8338EC' }}
                          >
                            Goal reached! 🎉
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-stone-700">
                            {progressPct}%
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => onDeleteProject(project.id)}
                          className="text-stone-300 hover:text-rose-500 p-1 rounded-md transition-colors cursor-pointer"
                          title="Delete project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center justify-between text-xs font-bold text-stone-900 mb-1">
                      <span>{formatCurrency(project.currentAmount)}</span>
                      <span className="text-stone-700 font-normal">
                        Goal: {formatCurrency(project.targetAmount)}
                      </span>
                    </div>

                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden mb-3">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%`, backgroundColor: accentColor }}
                      />
                    </div>

                    {/* Quick Preset Buttons & Input */}
                    <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                      {/* Quick preset chips */}
                      <button
                        type="button"
                        onClick={() => handleQuickAddProject(project.id, project.title, 20)}
                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer transition-colors"
                      >
                        +$20
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAddProject(project.id, project.title, 50)}
                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer transition-colors"
                      >
                        +$50
                      </button>

                      {/* Custom amount input */}
                      <div className="relative flex-1">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-xs">
                          $
                        </span>
                        <input
                          type="number"
                          step="1"
                          min="1"
                          placeholder="Custom"
                          value={projectAmounts[project.id] || ''}
                          onChange={(e) =>
                            setProjectAmounts({
                              ...projectAmounts,
                              [project.id]: e.target.value,
                            })
                          }
                          className="w-full pl-6 pr-2 py-1.5 text-xs font-bold rounded-lg bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400 text-stone-900"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddFundToProject(project.id, project.title)}
                        disabled={
                          !projectAmounts[project.id] ||
                          parseFloat(projectAmounts[project.id]) <= 0
                        }
                        className="py-1.5 px-3 rounded-lg text-white text-xs font-bold transition-all cursor-pointer whitespace-nowrap disabled:opacity-40"
                        style={{ backgroundColor: '#FB5607' }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* CREATE NEW PROJECT MODAL */}
      {isCreatingProject && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm border border-stone-200 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div 
                  className="w-7 h-7 rounded-lg text-white flex items-center justify-center"
                  style={{ backgroundColor: '#ffbe0b' }}
                >
                  <Target className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-stone-900">New Savings Project</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingProject(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Concert tickets, Road trip, New laptop"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:ring-1 focus:ring-stone-400 text-stone-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                  Target Goal ($)
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  placeholder="e.g. 250"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:ring-1 focus:ring-stone-400 text-stone-900"
                />
              </div>

              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsCreatingProject(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-semibold text-xs hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-white font-bold text-xs shadow-xs cursor-pointer"
                  style={{ backgroundColor: '#FF006E' }}
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
