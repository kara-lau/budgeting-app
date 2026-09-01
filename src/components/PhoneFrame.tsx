import React from 'react';
import { Smartphone, Monitor } from 'lucide-react';

interface PhoneFrameProps {
  children: React.ReactNode;
  isFramed: boolean;
  onToggleFrame: () => void;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  isFramed,
  onToggleFrame,
}) => {
  return (
    <div className="min-h-screen bg-stone-100/70 flex flex-col items-center justify-start sm:py-6 px-0 sm:px-4 font-sans text-stone-900 selection:bg-amber-200">
      {/* Top frame mode switch for desktop */}
      <div className="w-full max-w-md hidden sm:flex items-center justify-between px-3 py-1.5 mb-2 text-xs text-stone-700">
        <span className="font-medium text-stone-600">Mobile Experience</span>
        <button
          onClick={onToggleFrame}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 border border-stone-200 hover:bg-white text-stone-700 shadow-xs transition-all cursor-pointer text-xs"
          title="Toggle phone frame container"
        >
          {isFramed ? (
            <>
              <Monitor className="w-3.5 h-3.5 text-stone-500" />
              <span>Full View</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5 text-stone-500" />
              <span>Phone Frame</span>
            </>
          )}
        </button>
      </div>

      {/* Main Container */}
      <div
        className={`w-full transition-all duration-300 ${
          isFramed
            ? 'max-w-[420px] bg-[#FAF9F6] sm:rounded-[36px] sm:shadow-2xl sm:border-[7px] sm:border-stone-800/20 sm:ring-1 sm:ring-stone-900/5 min-h-[720px] sm:min-h-[800px] flex flex-col overflow-hidden relative'
            : 'max-w-lg bg-[#FAF9F6] sm:rounded-2xl sm:shadow-md sm:border sm:border-stone-200 min-h-screen flex flex-col overflow-hidden relative'
        }`}
      >
        {/* Dynamic Island / Speaker notch for phone frame */}
        {isFramed && (
          <div className="hidden sm:flex justify-center pt-3 pb-1 shrink-0 select-none">
            <div className="w-24 h-4 bg-stone-800/80 rounded-full flex items-center justify-end px-2 gap-1.5 shadow-inner">
              <div className="w-1.5 h-1.5 rounded-full bg-stone-600/80" />
              <div className="w-2 h-2 rounded-full bg-stone-950 border border-stone-700" />
            </div>
          </div>
        )}

        {/* Inner Screen Content */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
