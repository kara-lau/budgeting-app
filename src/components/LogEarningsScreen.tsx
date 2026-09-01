import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Check, 
  Briefcase, 
  CheckSquare, 
  Square, 
  Sparkles, 
  Clock, 
  DollarSign, 
  Plus, 
  CheckCircle2, 
  Trash2,
  AlertCircle,
  ChevronDown,
  Settings2,
  X,
  Gift
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { JobPreset, Shift, ShiftStatus } from '../types';
import { formatCurrency } from '../utils/storage';

interface LogEarningsScreenProps {
  shifts: Shift[];
  jobPresets: JobPreset[];
  onBack: () => void;
  onAddShift: (shift: Omit<Shift, 'id' | 'createdAt'>) => void;
  onToggleShiftStatus: (id: string, newStatus: ShiftStatus) => void;
  onDeleteShift: (id: string) => void;
  onAddJobPreset: (preset: Omit<JobPreset, 'id'>) => JobPreset;
  onDeleteJobPreset: (id: string) => void;
}

export const LogEarningsScreen: React.FC<LogEarningsScreenProps> = ({
  shifts,
  jobPresets,
  onBack,
  onAddShift,
  onToggleShiftStatus,
  onDeleteShift,
  onAddJobPreset,
  onDeleteJobPreset,
}) => {
  const [activeTab, setActiveTab] = useState<'log' | 'checklist'>('log');
  const [incomeMode, setIncomeMode] = useState<'shift' | 'yippee'>('shift');

  // Selected Job from Dropdown
  const defaultJob = jobPresets[0] || {
    id: 'default',
    title: 'General Shift',
    workplace: 'General Workplace',
    role: 'Staff',
    hourlyRate: 25.00,
    defaultHours: 6.0,
    defaultBonus: 0,
  };

  const [selectedJobId, setSelectedJobId] = useState<string>(defaultJob.id);
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [workplace, setWorkplace] = useState<string>(defaultJob.workplace);
  const [role, setRole] = useState<string>(defaultJob.role || 'Staff');
  const [hoursWorked, setHoursWorked] = useState<string>(String(defaultJob.defaultHours || 6));
  const [hourlyRate, setHourlyRate] = useState<string>(String(defaultJob.hourlyRate || 25));
  const [bonus, setBonus] = useState<string>(String(defaultJob.defaultBonus || 0));
  const [notes, setNotes] = useState<string>('');
  const [status, setStatus] = useState<ShiftStatus>('pending');
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);
  const [showAdjustments, setShowAdjustments] = useState<boolean>(false);

  // Yippee Earnings State
  const [yippeeAmount, setYippeeAmount] = useState<string>('50');
  const [yippeeForm, setYippeeForm] = useState<'bank_transfer' | 'giftcard' | 'cash'>('bank_transfer');
  const [yippeeDate, setYippeeDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [yippeeNotes, setYippeeNotes] = useState<string>('');
  const [yippeeStatus, setYippeeStatus] = useState<ShiftStatus>('received');

  // New Job Creator Modal / Drawer State
  const [isCreatingJob, setIsCreatingJob] = useState<boolean>(false);
  const [newJobTitle, setNewJobTitle] = useState<string>('');
  const [newJobWorkplace, setNewJobWorkplace] = useState<string>('');
  const [newJobRate, setNewJobRate] = useState<string>('25.00');
  const [newJobHours, setNewJobHours] = useState<string>('6.0');
  const [newJobBonus, setNewJobBonus] = useState<string>('0');

  const calculatedHours = parseFloat(hoursWorked) || 0;
  const calculatedRate = parseFloat(hourlyRate) || 0;
  const calculatedBonus = parseFloat(bonus) || 0;
  const previewTotal = calculatedHours * calculatedRate + calculatedBonus;

  const yippeeTotal = parseFloat(yippeeAmount) || 0;

  // Earnings calculations
  const pendingShifts = shifts.filter((s) => s.status === 'pending');
  const receivedShifts = shifts.filter((s) => s.status === 'received');
  const pendingTotal = pendingShifts.reduce((sum, s) => sum + s.totalEarnings, 0);
  const receivedTotal = receivedShifts.reduce((sum, s) => sum + s.totalEarnings, 0);

  // Handle Dropdown Selection
  const handleJobSelect = (jobId: string) => {
    if (jobId === '__new__') {
      setIsCreatingJob(true);
      return;
    }

    if (jobId === '__yippee__') {
      setIncomeMode('yippee');
      return;
    }

    setSelectedJobId(jobId);
    const found = jobPresets.find((j) => j.id === jobId);
    if (found) {
      setWorkplace(found.workplace);
      setRole(found.role || 'Staff');
      setHourlyRate(String(found.hourlyRate));
      setHoursWorked(String(found.defaultHours || 6));
      setBonus(String(found.defaultBonus || 0));
    }
  };

  // Handle Creating a New Job Preset
  const handleSaveNewJobPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle.trim() && !newJobWorkplace.trim()) return;

    const rate = parseFloat(newJobRate) || 20;
    const hours = parseFloat(newJobHours) || 6;
    const b = parseFloat(newJobBonus) || 0;
    const title = newJobTitle.trim() || newJobWorkplace.trim();
    const wp = newJobWorkplace.trim() || newJobTitle.trim();

    const created = onAddJobPreset({
      title,
      workplace: wp,
      role: 'Staff',
      hourlyRate: rate,
      defaultHours: hours,
      defaultBonus: b,
    });

    setSelectedJobId(created.id);
    setWorkplace(created.workplace);
    setRole(created.role || 'Staff');
    setHourlyRate(String(created.hourlyRate));
    setHoursWorked(String(created.defaultHours || 6));
    setBonus(String(created.defaultBonus || 0));

    // Reset creator fields
    setNewJobTitle('');
    setNewJobWorkplace('');
    setNewJobRate('25.00');
    setNewJobHours('6.0');
    setNewJobBonus('0');
    setIsCreatingJob(false);
  };

  // Handle Saving Shift
  const handleSaveShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (calculatedHours <= 0 || calculatedRate <= 0) return;

    // If no date is provided or date is empty, automatically record for current day
    const effectiveDate = date && date.trim() ? date.trim() : new Date().toISOString().split('T')[0];
    const finalWorkplace = workplace.trim() || 'Work Shift';

    onAddShift({
      date: effectiveDate,
      workplace: finalWorkplace,
      role: role.trim() || 'Staff',
      hoursWorked: calculatedHours,
      hourlyRate: calculatedRate,
      bonus: calculatedBonus,
      totalEarnings: previewTotal,
      status,
      receivedDate: status === 'received' ? new Date().toISOString().split('T')[0] : undefined,
      notes: notes.trim() || undefined,
      incomeType: 'shift',
    });

    if (status === 'received') {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    }

    setSavedSuccessMsg(`Logged ${finalWorkplace} shift: ${formatCurrency(previewTotal)}`);
    setTimeout(() => setSavedSuccessMsg(null), 3000);
    setNotes('');
  };

  // Handle Saving Yippee Earnings
  const handleSaveYippee = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(yippeeAmount) || 0;
    if (amt <= 0) return;

    const effectiveDate = yippeeDate && yippeeDate.trim() ? yippeeDate.trim() : new Date().toISOString().split('T')[0];
    const formLabel = yippeeForm === 'giftcard' ? 'Giftcard' : yippeeForm === 'cash' ? 'Cash' : 'Bank Transfer';

    onAddShift({
      date: effectiveDate,
      workplace: 'Yippee Earnings',
      role: formLabel,
      hoursWorked: 1,
      hourlyRate: amt,
      bonus: 0,
      totalEarnings: amt,
      status: yippeeStatus,
      receivedDate: yippeeStatus === 'received' ? effectiveDate : undefined,
      notes: yippeeNotes.trim() ? `${formLabel} • ${yippeeNotes.trim()}` : formLabel,
      incomeType: 'yippee',
      paymentMethod: yippeeForm,
    });

    confetti({
      particleCount: 50,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#FF006E', '#8338EC', '#FB5607', '#FFBE0B', '#3A86FF'],
    });

    setSavedSuccessMsg(`Logged Yippee earnings (${formLabel}): ${formatCurrency(amt)}`);
    setTimeout(() => setSavedSuccessMsg(null), 3000);
    setYippeeNotes('');
  };

  const handleToggle = (shift: Shift) => {
    const nextStatus: ShiftStatus = shift.status === 'pending' ? 'received' : 'pending';
    onToggleShiftStatus(shift.id, nextStatus);

    if (nextStatus === 'received') {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FB5607', '#3A86FF', '#FF006E', '#8338EC', '#FFBE0B'],
      });
    }
  };

  const handleCollectAll = () => {
    if (pendingShifts.length === 0) return;
    pendingShifts.forEach((s) => {
      onToggleShiftStatus(s.id, 'received');
    });

    confetti({
      particleCount: 65,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#FB5607', '#3A86FF', '#FF006E', '#8338EC', '#FFBE0B'],
    });

    setSavedSuccessMsg(`Collected all ${pendingShifts.length} shifts (${formatCurrency(pendingTotal)})!`);
    setTimeout(() => setSavedSuccessMsg(null), 3000);
  };

  return (
    <div className="flex-1 flex flex-col px-5 py-6 justify-between animate-fadeIn relative">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors p-1.5 -ml-1.5 rounded-lg hover:bg-stone-100 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">
            Earnings & Shifts
          </span>
          <div className="w-12" />
        </div>

        {/* Vibrant Tab Switcher */}
        <div className="bg-stone-200/80 p-1 rounded-2xl flex items-center mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('log')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'log'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Shift</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('checklist')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'checklist'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 text-orange-500" />
            <span>Check Off</span>
            {pendingShifts.length > 0 && (
              <span 
                className="px-2 py-0.5 rounded-full text-white text-[10px] font-extrabold shadow-xs"
                style={{ backgroundColor: '#FB5607' }}
              >
                {pendingShifts.length}
              </span>
            )}
          </button>
        </div>

        {/* Success Toast */}
        {savedSuccessMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-slideDown">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{savedSuccessMsg}</span>
          </div>
        )}

        {/* VIEW 1: Log Earnings & Shifts */}
        {activeTab === 'log' && (
          <div className="flex flex-col gap-3.5 animate-fadeIn">
            {/* Income Sub-Type Switcher: Shift vs Yippee */}
            <div className="bg-stone-100 p-1 rounded-xl flex items-center">
              <button
                type="button"
                onClick={() => setIncomeMode('shift')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  incomeMode === 'shift'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Work Shift</span>
              </button>
              <button
                type="button"
                onClick={() => setIncomeMode('yippee')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  incomeMode === 'yippee'
                    ? 'bg-white text-pink-600 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                <span>Yippee Earnings</span>
              </button>
            </div>

            {/* Standard Shift Form */}
            {incomeMode === 'shift' ? (
              <form onSubmit={handleSaveShift} className="flex flex-col gap-4 animate-fadeIn">
                {/* 1. Job Drop-Down Menu Selection */}
                <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                      Select Job / Shift
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCreatingJob(true)}
                      className="text-xs font-bold flex items-center gap-1 hover:underline cursor-pointer"
                      style={{ color: '#8338EC' }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Job</span>
                    </button>
                  </div>

                  <div className="relative">
                    <select
                      id="job-select-dropdown"
                      value={selectedJobId}
                      onChange={(e) => handleJobSelect(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-3 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 appearance-none cursor-pointer"
                    >
                      {jobPresets.map((job) => (
                        <option key={job.id} value={job.id}>
                          {job.title} — ${job.hourlyRate.toFixed(2)}/hr ({job.defaultHours || 6}h)
                        </option>
                      ))}
                      <option value="__new__">+ Add a new job type...</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-stone-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 2. Live Earnings Calculation Box */}
                <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs text-center">
                  <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider block mb-1">
                    Shift Earnings
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight my-1">
                    {formatCurrency(previewTotal)}
                  </div>
                  <div className="text-xs text-stone-700 mt-1 flex items-center justify-center gap-2">
                    <span>{calculatedHours} hrs @ ${calculatedRate.toFixed(2)}/hr</span>
                    {calculatedBonus > 0 && <span>+ ${calculatedBonus} tips</span>}
                  </div>
                </div>

                {/* 3. Shift Date (Automatic Today Default) & Quick Details */}
                <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-xs flex flex-col gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-stone-700 block">
                        Shift Date
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

                  {/* Toggle to adjust hours, rate, tips */}
                  <button
                    type="button"
                    onClick={() => setShowAdjustments(!showAdjustments)}
                    className="w-full pt-2 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
                  >
                    <span>{showAdjustments ? 'Hide custom hours & rate' : '⚙️ Customise hours or rate for this shift'}</span>
                    <span className="text-stone-400">{showAdjustments ? '▲' : '▼'}</span>
                  </button>

                  {showAdjustments && (
                    <div className="pt-2 flex flex-col gap-3 animate-fadeIn">
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[10px] font-semibold text-stone-700 block mb-1">
                            Hours Worked
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={hoursWorked}
                            onChange={(e) => setHoursWorked(e.target.value)}
                            className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:ring-1 focus:ring-stone-400 text-stone-900"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-stone-700 block mb-1">
                            Hourly Rate ($/hr)
                          </label>
                          <input
                            type="number"
                            step="0.50"
                            min="1"
                            value={hourlyRate}
                            onChange={(e) => setHourlyRate(e.target.value)}
                            className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:ring-1 focus:ring-stone-400 text-stone-900"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[10px] font-semibold text-stone-700 block mb-1">
                            Tips / Bonus ($)
                          </label>
                          <input
                            type="number"
                            step="1"
                            min="0"
                            value={bonus}
                            onChange={(e) => setBonus(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:ring-1 focus:ring-stone-400 text-stone-900"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-stone-700 block mb-1">
                            Payment Status
                          </label>
                          <div className="flex items-center gap-1.5 pt-0.5">
                            <button
                              type="button"
                              onClick={() => setStatus('pending')}
                              className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold cursor-pointer text-center ${
                                status === 'pending'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                                  : 'bg-stone-100 text-stone-600'
                              }`}
                            >
                              Pending
                            </button>
                            <button
                              type="button"
                              onClick={() => setStatus('received')}
                              className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold cursor-pointer text-center ${
                                status === 'received'
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold'
                                  : 'bg-stone-100 text-stone-600'
                              }`}
                            >
                              Received
                            </button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-semibold text-stone-700 block mb-1">
                          Notes (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Training, double shift, extra tips"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:ring-1 focus:ring-stone-400 text-stone-900"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. One-Tap Save Shift Button */}
                <button
                  id="btn-save-shift"
                  type="submit"
                  disabled={previewTotal <= 0}
                  className="w-full py-4 px-6 rounded-2xl text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
                  style={{
                    backgroundColor: previewTotal > 0 ? '#FF006E' : '#94A3B8',
                    boxShadow: previewTotal > 0 ? '0 4px 14px 0 rgba(255, 0, 110, 0.35)' : 'none',
                  }}
                >
                  <span>Save Shift</span>
                  <span>({formatCurrency(previewTotal)})</span>
                </button>
              </form>
            ) : (
              /* Yippee Miscellaneous Income Form */
              <form onSubmit={handleSaveYippee} className="flex flex-col gap-4 animate-fadeIn">
                {/* 1. Yippee Display Card */}
                <div 
                  className="rounded-2xl p-5 text-white shadow-sm text-center flex flex-col items-center justify-center"
                  style={{ backgroundColor: '#FF006E' }}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-white/90 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Yippee Earnings</span>
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold tracking-tight my-1">
                    {formatCurrency(yippeeTotal)}
                  </div>
                  <span className="text-[11px] font-medium text-white/85">
                    Form: {yippeeForm === 'giftcard' ? 'Giftcard' : yippeeForm === 'cash' ? 'Cash' : 'Bank Transfer (Default)'}
                  </span>
                </div>

                {/* 2. Amount Input & Quick Chips */}
                <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-xs flex flex-col gap-3">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-stone-700 block mb-1.5">
                      Amount ($)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-extrabold text-lg">
                        $
                      </span>
                      <input
                        id="input-yippee-amount"
                        type="number"
                        step="1"
                        min="1"
                        placeholder="0.00"
                        value={yippeeAmount}
                        onChange={(e) => setYippeeAmount(e.target.value)}
                        className="w-full pl-8 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 font-black text-xl text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    {[20, 50, 100, 200].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setYippeeAmount(String(preset))}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          yippeeAmount === String(preset)
                            ? 'bg-pink-100 text-pink-700 border border-pink-300'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                        }`}
                      >
                        ${preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Form Dropdown (Giftcard, Cash, Defaults to Bank Transfer) */}
                <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-xs flex flex-col gap-3">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-stone-700 block mb-1.5">
                      Form of Income
                    </label>
                    <div className="relative">
                      <select
                        id="yippee-form-dropdown"
                        value={yippeeForm}
                        onChange={(e) => setYippeeForm(e.target.value as any)}
                        className="w-full pl-3.5 pr-10 py-3 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 appearance-none cursor-pointer"
                      >
                        <option value="bank_transfer">Bank Transfer (Default)</option>
                        <option value="giftcard">Giftcard</option>
                        <option value="cash">Cash</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-stone-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Date & Payment Status */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <div>
                      <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={yippeeDate}
                        onChange={(e) => setYippeeDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-pink-400 text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                        Status
                      </label>
                      <div className="flex items-center gap-1 pt-0.5">
                        <button
                          type="button"
                          onClick={() => setYippeeStatus('received')}
                          className={`flex-1 py-1.5 px-1 rounded-lg text-[11px] font-bold cursor-pointer text-center ${
                            yippeeStatus === 'received'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          Received
                        </button>
                        <button
                          type="button"
                          onClick={() => setYippeeStatus('pending')}
                          className={`flex-1 py-1.5 px-1 rounded-lg text-[11px] font-bold cursor-pointer text-center ${
                            yippeeStatus === 'pending'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          Pending
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Optional Description */}
                  <div>
                    <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                      Source / Note (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Birthday gift, selling secondhand clothes, cash rebate"
                      value={yippeeNotes}
                      onChange={(e) => setYippeeNotes(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:ring-1 focus:ring-pink-400 text-stone-900"
                    />
                  </div>
                </div>

                {/* 4. Save Yippee Earnings Button */}
                <button
                  id="btn-save-yippee"
                  type="submit"
                  disabled={yippeeTotal <= 0}
                  className="w-full py-4 px-6 rounded-2xl text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
                  style={{
                    backgroundColor: yippeeTotal > 0 ? '#FF006E' : '#94A3B8',
                    boxShadow: yippeeTotal > 0 ? '0 4px 14px 0 rgba(255, 0, 110, 0.35)' : 'none',
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Save Yippee Earnings ({formatCurrency(yippeeTotal)})</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* VIEW 2: Check Off Received */}
        {activeTab === 'checklist' && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            {/* Colorful Dual Summary Capsules */}
            <div className="grid grid-cols-2 gap-3">
              <div 
                className="rounded-2xl p-4 text-white shadow-sm flex flex-col justify-between"
                style={{ backgroundColor: '#FB5607' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/90">
                    Pending
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {formatCurrency(pendingTotal)}
                </div>
                <div className="text-[11px] font-medium text-white/85 mt-1">
                  {pendingShifts.length} unpaid shift{pendingShifts.length !== 1 ? 's' : ''}
                </div>
              </div>

              <div 
                className="rounded-2xl p-4 text-white shadow-sm flex flex-col justify-between"
                style={{ backgroundColor: '#FFBE0E' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/90">
                    Banked
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {formatCurrency(receivedTotal)}
                </div>
                <div className="text-[11px] font-medium text-white/85 mt-1">
                  {receivedShifts.length} shift{receivedShifts.length !== 1 ? 's' : ''} collected
                </div>
              </div>
            </div>

            {/* Pending Shifts Section */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2.5 px-1 flex items-center justify-between">
                <span>Pending Shifts (Tap to check off)</span>
                {pendingShifts.length > 0 && (
                  <span 
                    className="px-2 py-0.5 rounded-full text-white text-[10px] font-extrabold shadow-xs"
                    style={{ backgroundColor: '#FB5607' }}
                  >
                    {pendingShifts.length}
                  </span>
                )}
              </div>

              {pendingShifts.length === 0 ? (
                <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs text-center flex flex-col items-center">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xs mb-3"
                    style={{ backgroundColor: '#8338EC' }}
                  >
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-extrabold text-stone-900">All shifts collected!</div>
                  <div className="text-xs text-stone-600 mt-1 max-w-xs">
                    You have no pending shifts waiting to be paid. Everything is banked and accounted for.
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('log')}
                    className="mt-4 px-4 py-2 rounded-xl text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
                    style={{ backgroundColor: '#FF006E' }}
                  >
                    + Log Next Shift
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {pendingShifts.map((shift, idx) => {
                    const isYippee = shift.incomeType === 'yippee' || shift.workplace.toLowerCase().includes('yippee');
                    const shiftColors = ['#FFBE0B', '#FB5607', '#FF006E', '#8338EC'];
                    const cardTheme = isYippee ? '#FF006E' : shiftColors[idx % shiftColors.length];

                    return (
                      <div
                        key={shift.id}
                        className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-xs hover:shadow-md transition-all flex flex-col gap-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                              style={{ backgroundColor: cardTheme }}
                            >
                              {isYippee ? (
                                <Sparkles className="w-5 h-5" />
                              ) : (
                                <Briefcase className="w-5 h-5" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-stone-900 truncate flex items-center gap-1.5">
                                <span>{shift.workplace}</span>
                                {isYippee && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-pink-100 text-pink-700 text-[9px] font-extrabold uppercase">
                                    Misc
                                  </span>
                                )}
                              </h4>
                              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-stone-600 font-semibold mt-0.5">
                                <span>{shift.date}</span>
                                <span>•</span>
                                {isYippee ? (
                                  <span>Form: {shift.role || 'Bank Transfer'}{shift.notes && !shift.notes.startsWith(shift.role) ? ` (${shift.notes})` : ''}</span>
                                ) : (
                                  <>
                                    <span>{shift.hoursWorked}h @ ${shift.hourlyRate}/h</span>
                                    {shift.bonus > 0 && (
                                      <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                        +${shift.bonus} tip
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-base font-extrabold text-stone-900">
                              {formatCurrency(shift.totalEarnings)}
                            </div>
                            <span
                              className="inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold text-white mt-0.5"
                              style={{ backgroundColor: isYippee ? '#FF006E' : '#FB5607' }}
                            >
                              Unpaid
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-stone-100">
                          <button
                            type="button"
                            onClick={() => onDeleteShift(shift.id)}
                            className="px-2.5 py-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Delete shift"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggle(shift)}
                            className="px-4 py-2.5 rounded-xl text-white font-bold text-xs shadow-xs hover:shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                            style={{ backgroundColor: '#8338EC' }}
                          >
                            <Check className="w-4 h-4 stroke-[2.5]" />
                            <span>Check Off & Bank</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Bulk Collect Button if 2 or more pending shifts */}
                  {pendingShifts.length > 1 && (
                    <button
                      type="button"
                      onClick={handleCollectAll}
                      className="w-full py-3.5 px-4 rounded-2xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] mt-1"
                      style={{
                        backgroundColor: '#FF006E',
                        boxShadow: '0 4px 14px 0 rgba(251, 86, 7, 0.35)',
                      }}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Check Off All ({formatCurrency(pendingTotal)})</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Collected Shifts Section */}
            {receivedShifts.length > 0 && (
              <div className="mt-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2.5 px-1 flex items-center justify-between">
                  <span>Banked & Received History</span>
                  <span className="text-xs font-bold text-emerald-700">{receivedShifts.length}</span>
                </div>
                <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
                  {receivedShifts.map((shift) => {
                    const isYippee = shift.incomeType === 'yippee' || shift.workplace.toLowerCase().includes('yippee');
                    return (
                      <div
                        key={shift.id}
                        className="bg-white rounded-2xl p-3 border border-stone-200/90 shadow-xs flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-stone-900 truncate flex items-center gap-1.5">
                              <span>{shift.workplace}</span>
                              {isYippee && (
                                <span className="px-1.5 py-0.2 rounded bg-pink-100 text-pink-700 text-[9px] font-extrabold uppercase">
                                  Misc
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-stone-500 font-semibold">
                              {shift.date} • {isYippee ? `Banked (${shift.role || 'Bank Transfer'})` : 'Banked'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-black text-emerald-700">
                            {formatCurrency(shift.totalEarnings)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggle(shift)}
                            className="text-[10px] font-bold text-stone-400 hover:text-stone-700 hover:underline cursor-pointer"
                            title="Move back to pending"
                          >
                            Undo
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* NEW JOB PRESET MODAL / OVERLAY */}
      {isCreatingJob && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm border border-stone-200 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-stone-900">Add New Job Type</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingJob(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-700 mb-4">
              Set up a job once with its wage and default shift length. Then log shifts with a single tap from the drop-down.
            </p>

            <form onSubmit={handleSaveNewJobPreset} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                  Job Title / Workplace
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Coaching, Tutoring, Waitressing"
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:ring-1 focus:ring-stone-400 text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                    Rate ($/hr)
                  </label>
                  <input
                    type="number"
                    step="0.50"
                    min="1"
                    required
                    placeholder="25.00"
                    value={newJobRate}
                    onChange={(e) => setNewJobRate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:ring-1 focus:ring-stone-400 text-stone-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                    Default Hours
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="6.00"
                    value={newJobHours}
                    onChange={(e) => setNewJobHours(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:ring-1 focus:ring-stone-400 text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                  Default Tips / Bonus ($)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  placeholder="0"
                  value={newJobBonus}
                  onChange={(e) => setNewJobBonus(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:ring-1 focus:ring-stone-400 text-stone-900"
                />
              </div>

              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsCreatingJob(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-semibold text-xs hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-white font-bold text-xs shadow-xs cursor-pointer"
                  style={{ backgroundColor: '#3A86FF' }}
                >
                  Save Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
