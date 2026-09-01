import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Briefcase, 
  Calendar, 
  Plus, 
  Trash2, 
  ArrowRight, 
  CheckSquare, 
  Square, 
  Sparkles, 
  AlertCircle,
  Building,
  UserCheck,
  Percent
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Shift, ShiftStatus } from '../types';
import { formatCurrency } from '../utils/storage';

interface ShiftTrackerProps {
  shifts: Shift[];
  onAddShift: (shift: Omit<Shift, 'id' | 'createdAt'>) => void;
  onToggleShiftStatus: (id: string, newStatus: ShiftStatus) => void;
  onDeleteShift: (id: string) => void;
}

export const ShiftTracker: React.FC<ShiftTrackerProps> = ({
  shifts,
  onAddShift,
  onToggleShiftStatus,
  onDeleteShift,
}) => {
  // Subview toggle: 'checklist' vs 'all_shifts'
  const [activeTab, setActiveTab] = useState<'checklist' | 'all_shifts'>('checklist');

  // Form State for inputting shifts
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [workplace, setWorkplace] = useState<string>('Apex Cafe & Roasters');
  const [role, setRole] = useState<string>('Barista');
  const [hoursWorked, setHoursWorked] = useState<string>('6.5');
  const [hourlyRate, setHourlyRate] = useState<string>('24.00');
  const [bonus, setBonus] = useState<string>('0');
  const [notes, setNotes] = useState<string>('');
  const [status, setStatus] = useState<ShiftStatus>('pending');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filter state in checklist
  const [checklistFilter, setChecklistFilter] = useState<'all' | 'pending' | 'received'>('pending');

  // Common workplace presets for convenience
  const workplacePresets = [
    { name: 'Apex Cafe & Roasters', role: 'Barista', rate: '24.00' },
    { name: 'Event Staffing Pro', role: 'Event Host', rate: '28.00' },
    { name: 'Freelance Design / Tutoring', role: 'Contractor', rate: '35.00' },
  ];

  const handleApplyPreset = (preset: typeof workplacePresets[0]) => {
    setWorkplace(preset.name);
    setRole(preset.role);
    setHourlyRate(preset.rate);
  };

  const calculatedHours = parseFloat(hoursWorked) || 0;
  const calculatedRate = parseFloat(hourlyRate) || 0;
  const calculatedBonus = parseFloat(bonus) || 0;
  const previewTotal = calculatedHours * calculatedRate + calculatedBonus;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workplace.trim() || calculatedHours <= 0 || calculatedRate <= 0) return;

    onAddShift({
      date,
      workplace: workplace.trim(),
      role: role.trim() || 'Team Member',
      hoursWorked: calculatedHours,
      hourlyRate: calculatedRate,
      bonus: calculatedBonus,
      totalEarnings: previewTotal,
      status,
      receivedDate: status === 'received' ? new Date().toISOString().split('T')[0] : undefined,
      notes: notes.trim() || undefined,
    });

    if (status === 'received') {
      triggerConfetti();
    }

    setSuccessMsg(`Recorded shift at ${workplace} for ${formatCurrency(previewTotal)}!`);
    setTimeout(() => setSuccessMsg(null), 3000);

    // Reset notes and hours
    setNotes('');
  };

  const handleToggle = (shift: Shift) => {
    const newStatus: ShiftStatus = shift.status === 'pending' ? 'received' : 'pending';
    onToggleShiftStatus(shift.id, newStatus);
    
    if (newStatus === 'received') {
      triggerConfetti();
    }
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10B981', '#F59E0B', '#3B82F6', '#10B981'],
      });
    } catch {
      // safe fallback
    }
  };

  // Metrics
  const pendingShifts = shifts.filter((s) => s.status === 'pending');
  const receivedShifts = shifts.filter((s) => s.status === 'received');

  const pendingTotal = pendingShifts.reduce((sum, s) => sum + s.totalEarnings, 0);
  const receivedTotal = receivedShifts.reduce((sum, s) => sum + s.totalEarnings, 0);
  const projectedTotal = pendingTotal + receivedTotal;
  const totalHours = shifts.reduce((sum, s) => sum + s.hoursWorked, 0);

  const displayedShifts = shifts.filter((s) => {
    if (activeTab === 'checklist') {
      if (checklistFilter === 'pending') return s.status === 'pending';
      if (checklistFilter === 'received') return s.status === 'received';
      return true;
    }
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Received Earnings */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Received Earnings
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900 mt-2">
            {formatCurrency(receivedTotal)}
          </div>
          <div className="text-xs text-stone-700 mt-1 flex items-center gap-1">
            <span className="font-semibold text-emerald-700">{receivedShifts.length}</span> shifts deposited into bank
          </div>
        </div>

        {/* Pending Payout */}
        <div className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
              Pending Payout
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900 mt-2">
            {formatCurrency(pendingTotal)}
          </div>
          <div className="text-xs text-stone-700 mt-1 flex items-center gap-1">
            <span className="font-semibold text-amber-700">{pendingShifts.length}</span> shifts awaiting payout
          </div>
        </div>

        {/* Projected Total */}
        <div className="bg-white rounded-2xl p-5 border border-blue-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider">
              Total Projected
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900 mt-2">
            {formatCurrency(projectedTotal)}
          </div>
          <div className="text-xs text-stone-700 mt-1">
            Received + pending shift total
          </div>
        </div>

        {/* Total Hours Worked */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
              Hours Logged
            </span>
            <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900 mt-2">
            {totalHours.toFixed(1)} hrs
          </div>
          <div className="text-xs text-stone-700 mt-1">
            Across {shifts.length} total work shifts
          </div>
        </div>
      </div>

      {/* Record Work Shift Form */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-stone-900 text-white flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <h2 className="text-lg font-bold tracking-tight">Record Completed Work Shift</h2>
            </div>
            <p className="text-xs text-stone-300 mt-0.5">
              Log when you completed a work shift, hours clocked, and track when payment arrives.
            </p>
          </div>
          {successMsg && (
            <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-medium rounded-full animate-fade-in">
              ✓ {successMsg}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Preset Workplace Selection */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-stone-700">Quick Roles:</span>
            {workplacePresets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="text-xs px-3 py-1 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 font-medium transition-colors"
              >
                {p.name} (${p.rate}/hr)
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date */}
            <div>
              <label htmlFor="shift-date-input" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-700" />
                Shift Date *
              </label>
              <input
                id="shift-date-input"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 text-stone-900"
              />
            </div>

            {/* Workplace / Employer */}
            <div>
              <label htmlFor="shift-workplace-input" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-stone-700" />
                Workplace / Client *
              </label>
              <input
                id="shift-workplace-input"
                type="text"
                required
                placeholder="e.g. Apex Cafe & Roasters"
                value={workplace}
                onChange={(e) => setWorkplace(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 text-stone-900"
              />
            </div>

            {/* Role */}
            <div>
              <label htmlFor="shift-role-input" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-stone-700" />
                Role / Task
              </label>
              <input
                id="shift-role-input"
                type="text"
                placeholder="e.g. Barista / Shift Leader"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 text-stone-900"
              />
            </div>

            {/* Initial Payment Status */}
            <div>
              <label htmlFor="shift-initial-status-select" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Initial Payout Status
              </label>
              <select
                id="shift-initial-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as ShiftStatus)}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 text-stone-900 font-medium"
              >
                <option value="pending">⏳ Pending (Money Not Received Yet)</option>
                <option value="received">✓ Received (Already Paid Out)</option>
              </select>
            </div>
          </div>

          {/* Numerical Inputs: Hours, Rate, Bonus & Earnings Calculation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200 items-end">
            <div>
              <label htmlFor="shift-hours-input" className="block text-xs font-medium text-stone-700 mb-1">
                Hours Worked *
              </label>
              <input
                id="shift-hours-input"
                type="number"
                step="0.25"
                min="0.25"
                required
                value={hoursWorked}
                onChange={(e) => setHoursWorked(e.target.value)}
                className="w-full px-3 py-2 text-base font-bold rounded-lg border border-stone-300 bg-white text-stone-900 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label htmlFor="shift-hourly-rate-input" className="block text-xs font-medium text-stone-700 mb-1">
                Hourly Rate ($) *
              </label>
              <input
                id="shift-hourly-rate-input"
                type="number"
                step="0.50"
                min="0"
                required
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="w-full px-3 py-2 text-base font-bold rounded-lg border border-stone-300 bg-white text-stone-900 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label htmlFor="shift-bonus-tips-input" className="block text-xs font-medium text-stone-700 mb-1">
                Tips / Flat Bonus ($)
              </label>
              <input
                id="shift-bonus-tips-input"
                type="number"
                step="1.00"
                min="0"
                value={bonus}
                onChange={(e) => setBonus(e.target.value)}
                className="w-full px-3 py-2 text-base font-bold rounded-lg border border-stone-300 bg-white text-stone-900 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Calculated Preview & Submit */}
            <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0">
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-stone-700 block">Total Shift Earned</span>
                <span className="text-xl font-extrabold text-emerald-600">
                  {formatCurrency(previewTotal)}
                </span>
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-xs hover:shadow transition-all"
              >
                <Plus className="w-4 h-4" />
                Record Shift
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Main Shifts & Checklist Section */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {/* Navigation Bar inside Shift Tracker */}
        <div className="p-5 border-b border-stone-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('checklist')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'checklist'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              Payout Checklist ({pendingShifts.length} Pending)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('all_shifts')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'all_shifts'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              All Shifts Log ({shifts.length})
            </button>
          </div>

          {/* Sub-filters for Checklist */}
          {activeTab === 'checklist' && (
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setChecklistFilter('pending')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  checklistFilter === 'pending'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-amber-800 hover:text-amber-900'
                }`}
              >
                Pending Owed ({pendingShifts.length})
              </button>
              <button
                type="button"
                onClick={() => setChecklistFilter('received')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  checklistFilter === 'received'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-800 hover:text-emerald-900'
                }`}
              >
                Received ({receivedShifts.length})
              </button>
              <button
                type="button"
                onClick={() => setChecklistFilter('all')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  checklistFilter === 'all'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                Show All
              </button>
            </div>
          )}
        </div>

        {/* Checklist / Shifts List */}
        {displayedShifts.length === 0 ? (
          <div className="py-16 text-center text-stone-700">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-400 mb-3" />
            <p className="text-base font-bold text-stone-800">
              {activeTab === 'checklist' && checklistFilter === 'pending'
                ? 'All shifts have been paid and checked off!'
                : 'No shifts found matching this view.'}
            </p>
            <p className="text-xs text-stone-700 mt-1">
              Record shifts above to track hourly income and check them off when deposited.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {displayedShifts.map((shift) => {
              const isReceived = shift.status === 'received';

              return (
                <div
                  key={shift.id}
                  className={`p-5 flex flex-wrap items-center justify-between gap-4 transition-colors ${
                    isReceived ? 'bg-emerald-50/20 hover:bg-emerald-50/40' : 'bg-white hover:bg-stone-50'
                  }`}
                >
                  {/* Left Column: Interactive Checkbox & Details */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    {/* Big Tap Target for Checking off shift */}
                    <button
                      type="button"
                      onClick={() => handleToggle(shift)}
                      className={`mt-0.5 p-1 rounded-xl transition-transform active:scale-95 ${
                        isReceived
                          ? 'text-emerald-600 hover:text-emerald-700 bg-emerald-100/60'
                          : 'text-stone-700 hover:text-amber-600 bg-stone-100 hover:bg-amber-50'
                      }`}
                      title={isReceived ? 'Mark as Pending (Not paid yet)' : 'Check off: Money Received!'}
                    >
                      {isReceived ? (
                        <CheckSquare className="w-6 h-6" />
                      ) : (
                        <Square className="w-6 h-6 text-stone-700" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-bold text-stone-900">
                          {shift.workplace}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium">
                          {shift.role}
                        </span>
                        {isReceived ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Money Received
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                            <Clock className="w-3 h-3" />
                            Awaiting Payment
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-stone-700 mt-1 flex-wrap">
                        <span className="flex items-center gap-1 font-medium text-stone-700">
                          <Calendar className="w-3.5 h-3.5 text-stone-700" />
                          Shift: {shift.date}
                        </span>
                        <span>•</span>
                        <span>
                          {shift.hoursWorked} hrs @ ${shift.hourlyRate.toFixed(2)}/hr
                        </span>
                        {shift.bonus > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-700 font-semibold">
                              +${shift.bonus.toFixed(2)} tips/bonus
                            </span>
                          </>
                        )}
                        {shift.receivedDate && isReceived && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-700 font-medium">
                              Paid on {shift.receivedDate}
                            </span>
                          </>
                        )}
                      </div>

                      {shift.notes && (
                        <p className="text-xs text-stone-700 mt-1.5 italic bg-stone-50 px-2 py-1 rounded border border-stone-200 inline-block">
                          “{shift.notes}”
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Total Amount & Check Action */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-lg font-extrabold text-stone-900">
                        {formatCurrency(shift.totalEarnings)}
                      </div>
                      <span className="text-[11px] text-stone-700">
                        {isReceived ? 'Deposited' : 'Pending'}
                      </span>
                    </div>

                    {/* Quick Button to toggle status */}
                    <button
                      type="button"
                      onClick={() => handleToggle(shift)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        isReceived
                          ? 'border border-stone-200 text-stone-700 hover:bg-stone-100'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                      }`}
                    >
                      {isReceived ? 'Mark Pending' : '✓ Check Off Paid'}
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteShift(shift.id)}
                      title="Delete shift"
                      className="p-1.5 text-stone-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
