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
  X
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
    });

    if (status === 'received') {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    }

    setSavedSuccessMsg(`Logged ${finalWorkplace} shift: ${formatCurrency(previewTotal)}`);
    setTimeout(() => setSavedSuccessMsg(null), 3000);
    setNotes('');
  };

  const handleToggle = (shift: Shift) => {
    const nextStatus: ShiftStatus = shift.status === 'pending' ? 'received' : 'pending';
    onToggleShiftStatus(shift.id, nextStatus);

    if (nextStatus === 'received') {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#3B82F6', '#F59E0B'],
      });
    }
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

        {/* Minimal Tab Switcher */}
        <div className="bg-stone-200/70 p-1 rounded-xl flex items-center mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('log')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'log'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            + Log Shift
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('checklist')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'checklist'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>Check Off</span>
            {pendingShifts.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold">
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

        {/* VIEW 1: Log Shift */}
        {activeTab === 'log' && (
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
                  style={{ color: '#FB5607' }}
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
                        step="0.25"
                        min="0.25"
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
                boxShadow: previewTotal > 0 ? '0 4px 14px 0 rgba(58, 134, 255, 0.35)' : 'none',
              }}
            >
              <span>Save Shift</span>
              <span>({formatCurrency(previewTotal)})</span>
            </button>
          </form>
        )}

        {/* VIEW 2: Check Off Received */}
        {activeTab === 'checklist' && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            {/* Minimal Summary Capsule */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-white rounded-2xl p-3.5 border border-stone-200/90 shadow-xs">
                <span className="text-[11px] font-medium text-stone-700 block">
                  Received in Bank
                </span>
                <span className="text-lg font-bold text-emerald-700 block">
                  {formatCurrency(receivedTotal)}
                </span>
                <span className="text-[10px] text-stone-700">
                  {receivedShifts.length} shift{receivedShifts.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="bg-white rounded-2xl p-3.5 border border-stone-200/90 shadow-xs">
                <span className="text-[11px] font-medium text-stone-700 block">
                  Pending Collection
                </span>
                <span className="text-lg font-bold text-amber-700 block">
                  {formatCurrency(pendingTotal)}
                </span>
                <span className="text-[10px] text-stone-700">
                  {pendingShifts.length} unpaid shift{pendingShifts.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Pending Shifts Section */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2 px-1 flex items-center justify-between">
                <span>Pending Shifts (Tap to check off)</span>
                <span className="text-amber-800 font-bold">{pendingShifts.length}</span>
              </div>

              {pendingShifts.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 border border-dashed border-stone-200 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
                  <div className="text-xs font-bold text-stone-800">All shifts collected!</div>
                  <div className="text-[11px] text-stone-700 mt-0.5">
                    No outstanding earnings waiting to be paid.
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {pendingShifts.map((shift) => (
                    <div
                      key={shift.id}
                      className="bg-white rounded-2xl p-3.5 border border-stone-200/90 shadow-xs flex items-center justify-between gap-3 hover:border-amber-300 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => handleToggle(shift)}
                        className="w-7 h-7 rounded-lg border-2 border-amber-400 hover:bg-amber-100 flex items-center justify-center shrink-0 text-amber-600 transition-colors cursor-pointer"
                        title="Mark as received / paid"
                      >
                        <Square className="w-4 h-4 opacity-0 hover:opacity-50" />
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-stone-900 truncate">
                            {shift.workplace}
                          </h4>
                          <span className="text-xs font-black text-stone-900">
                            {formatCurrency(shift.totalEarnings)}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-700 truncate mt-0.5">
                          {shift.date} • {shift.hoursWorked}h @ ${shift.hourlyRate}/h
                          {shift.bonus > 0 ? ` + $${shift.bonus} tips` : ''}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onDeleteShift(shift.id)}
                        className="p-1.5 text-stone-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete shift"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Collected Shifts Section */}
            {receivedShifts.length > 0 && (
              <div className="mt-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2 px-1">
                  Received & Collected
                </div>
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                  {receivedShifts.map((shift) => (
                    <div
                      key={shift.id}
                      className="bg-stone-50 rounded-xl p-3 border border-stone-200/70 flex items-center justify-between gap-3 text-stone-600"
                    >
                      <button
                        type="button"
                        onClick={() => handleToggle(shift)}
                        className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 cursor-pointer"
                        title="Unmark as received"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-stone-700 truncate">
                            {shift.workplace}
                          </span>
                          <span className="text-xs font-bold text-emerald-800">
                            {formatCurrency(shift.totalEarnings)}
                          </span>
                        </div>
                        <div className="text-[10px] text-stone-700">
                          {shift.date} • Collected
                        </div>
                      </div>
                    </div>
                  ))}
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
                    step="0.5"
                    min="0.5"
                    placeholder="6.0"
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
