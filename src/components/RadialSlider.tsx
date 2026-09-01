import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Lock, Unlock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { CategoryInfo } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { formatCurrency } from '../utils/storage';

interface RadialSliderProps {
  category: CategoryInfo;
  percentage: number;
  allocatedAmount: number;
  spentAmount: number;
  totalPool: number;
  isLocked: boolean;
  onPercentageChange: (newPercentage: number) => void;
  onToggleLock: () => void;
}

export const RadialSlider: React.FC<RadialSliderProps> = ({
  category,
  percentage,
  allocatedAmount,
  spentAmount,
  totalPool,
  isLocked,
  onPercentageChange,
  onToggleLock,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // SVG Geometry
  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const center = size / 2;
  
  // Angle definitions: Start from bottom-left (135 deg) to bottom-right (405 / 45 deg) - 270 degree arc
  const startAngle = 135;
  const sweepAngle = 270;

  // Convert angle (degrees) to coordinates on the circle
  const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, r: number, start: number, end: number) => {
    const startCoord = polarToCartesian(x, y, r, start);
    const endCoord = polarToCartesian(x, y, r, end);
    const largeArcFlag = end - start <= 180 ? '0' : '1';
    return `M ${startCoord.x} ${startCoord.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${endCoord.x} ${endCoord.y}`;
  };

  const currentAngle = startAngle + (Math.max(0, Math.min(100, percentage)) / 100) * sweepAngle;
  const trackPath = describeArc(center, center, radius, startAngle, startAngle + sweepAngle);
  const valuePath = describeArc(center, center, radius, startAngle, Math.max(startAngle + 0.1, currentAngle));
  const thumbPos = polarToCartesian(center, center, radius, currentAngle);

  // Calculate angle from client coordinates
  const calculateAngle = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current || isLocked) return;
    const rect = svgRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = clientX - cx;
    const dy = clientY - cy;

    // Angle in degrees from 12 o'clock (standard polar)
    let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (deg < 0) deg += 360;

    // Map 135 -> 405 range
    let shifted = deg - 135;
    if (shifted < 0) shifted += 360;

    if (shifted > sweepAngle) {
      // In the dead zone at the bottom (between 45 and 135)
      // Snap to closest edge
      const distToStart = 360 - shifted;
      const distToEnd = shifted - sweepAngle;
      if (distToStart < distToEnd) {
        onPercentageChange(0);
      } else {
        onPercentageChange(100);
      }
      return;
    }

    const newPct = Math.round((shifted / sweepAngle) * 100);
    onPercentageChange(Math.max(0, Math.min(100, newPct)));
  }, [isLocked, onPercentageChange, sweepAngle]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isLocked) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setIsDragging(true);
    calculateAngle(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || isLocked) return;
    calculateAngle(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // Ignore if not captured
    }
  };

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isLocked) return;
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault();
      onPercentageChange(Math.min(100, percentage + 1));
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault();
      onPercentageChange(Math.max(0, percentage - 1));
    }
  };

  const isOverBudget = spentAmount > allocatedAmount && allocatedAmount > 0;
  const spentPercentOfAllocation = allocatedAmount > 0 ? (spentAmount / allocatedAmount) * 100 : 0;

  return (
    <div className="flex flex-col items-center bg-white rounded-2xl p-5 border border-stone-200 shadow-sm hover:shadow transition-shadow relative select-none">
      {/* Category Header */}
      <div className="w-full flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: category.bgColor, color: category.color }}
          >
            <CategoryIcon name={category.iconName} className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-stone-900 truncate leading-tight">
              {category.name}
            </h4>
            <span className="text-xs text-stone-700 block truncate">
              {category.isOutsideFood ? 'Dining & Snacks' : category.isLeisure ? 'Fun & Events' : category.description.slice(0, 24)}
            </span>
          </div>
        </div>

        {/* Lock toggle button */}
        <button
          type="button"
          onClick={onToggleLock}
          title={isLocked ? 'Unlock allocation percentage' : 'Lock percentage'}
          className={`p-1.5 rounded-lg border transition-colors ${
            isLocked
              ? 'bg-amber-50 border-amber-300 text-amber-700'
              : 'bg-stone-50 border-stone-200 text-stone-700 hover:text-stone-700 hover:bg-stone-100'
          }`}
        >
          {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* SVG Radial Slider Container */}
      <div
        className="relative my-1 flex items-center justify-center"
        tabIndex={isLocked ? -1 : 0}
        onKeyDown={handleKeyDown}
        role="slider"
        aria-label={`${category.name} budget allocation slider`}
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <svg
          ref={svgRef}
          width={size}
          height={size}
          className={`cursor-pointer touch-none ${isLocked ? 'cursor-not-allowed opacity-90' : 'cursor-grab active:cursor-grabbing'}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Background Track */}
          <path
            d={trackPath}
            fill="none"
            stroke="#F1F5F9"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active Colored Arc */}
          <path
            d={valuePath}
            fill="none"
            stroke={category.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="transition-all duration-75"
          />

          {/* Thumb handle */}
          {!isLocked && (
            <g transform={`translate(${thumbPos.x}, ${thumbPos.y})`}>
              <circle
                r={10}
                fill="#FFFFFF"
                stroke={category.color}
                strokeWidth={3}
                className="filter drop-shadow-md cursor-grab active:cursor-grabbing"
              />
              <circle r={3.5} fill={category.color} />
            </g>
          )}
        </svg>

        {/* Center Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none mt-2">
          <div className="text-2xl font-bold text-stone-900 tracking-tight">
            {percentage}%
          </div>
          <div className="text-xs font-semibold text-stone-700 mt-0.5">
            {formatCurrency(allocatedAmount)}
          </div>
          <div className="text-[10px] text-stone-700 mt-0.5 uppercase tracking-wider font-mono">
            of pool
          </div>
        </div>
      </div>

      {/* Quick Adjustment Controls & Input */}
      <div className="w-full flex items-center justify-between gap-1.5 mt-1 pt-2 border-t border-stone-100">
        <button
          type="button"
          disabled={isLocked || percentage <= 0}
          onClick={() => onPercentageChange(Math.max(0, percentage - 5))}
          className="px-2 py-1 text-xs font-semibold rounded bg-stone-100 text-stone-700 hover:bg-stone-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          -5%
        </button>

        <div className="flex items-center gap-1">
          <input
            type="number"
            min={0}
            max={100}
            disabled={isLocked}
            value={percentage}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              onPercentageChange(isNaN(val) ? 0 : Math.max(0, Math.min(100, val)));
            }}
            className="w-12 text-center text-xs font-bold py-1 border border-stone-200 rounded bg-stone-50 text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-60"
          />
          <span className="text-xs font-semibold text-stone-700">%</span>
        </div>

        <button
          type="button"
          disabled={isLocked || percentage >= 100}
          onClick={() => onPercentageChange(Math.min(100, percentage + 5))}
          className="px-2 py-1 text-xs font-semibold rounded bg-stone-100 text-stone-700 hover:bg-stone-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          +5%
        </button>
      </div>

      {/* Budget vs Actual Spend Comparison */}
      <div className="w-full mt-3 bg-stone-50 rounded-xl p-2.5 border border-stone-100 text-xs">
        <div className="flex justify-between items-center text-stone-700 mb-1">
          <span>Actual Spent</span>
          <span className="font-semibold text-stone-900">{formatCurrency(spentAmount)}</span>
        </div>
        
        {/* Progress Bar of Spent vs Allocated */}
        <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden mb-1.5">
          <div
            className={`h-full rounded-full transition-all ${
              isOverBudget
                ? 'bg-rose-500'
                : spentPercentOfAllocation > 80
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, spentPercentOfAllocation)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px]">
          {isOverBudget ? (
            <span className="text-rose-600 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              Over by {formatCurrency(spentAmount - allocatedAmount)}
            </span>
          ) : (
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 shrink-0" />
              {formatCurrency(Math.max(0, allocatedAmount - spentAmount))} remaining
            </span>
          )}
          <span className="text-stone-700 font-mono">
            {spentPercentOfAllocation.toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
};
