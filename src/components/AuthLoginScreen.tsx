import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Clock, PieChart, PiggyBank } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';

interface AuthLoginScreenProps {
  onSuccess?: () => void;
}

export const AuthLoginScreen: React.FC<AuthLoginScreenProps> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await signInWithGoogle();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Sign-in error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Sign-in was cancelled. Please try again.');
      } else if (err.code === 'auth/popup-blocked') {
        setErrorMsg('Sign-in popup was blocked by your browser. Please allow popups.');
      } else {
        setErrorMsg(err.message || 'Failed to sign in with Google. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col justify-between p-6 bg-gradient-to-b from-amber-50/70 via-stone-50 to-orange-50/50 text-stone-900 select-none">
      {/* Top Brand Header */}
      <div className="pt-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 text-white shadow-xl shadow-orange-500/20 mb-4 animate-bounce duration-1000">
          <Sparkles className="w-8 h-8" />
        </div>
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 text-xs font-bold mb-2">
          <span>✨</span> Casual & Freelance Budgeting
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-stone-900">
          Yippee Planner
        </h1>
        <p className="text-sm font-medium text-stone-600 mt-1 max-w-xs mx-auto">
          Track irregular shift earnings, manage category budgets, and fund your savings goals.
        </p>
      </div>

      {/* Feature Highlights Grid */}
      <div className="my-6 space-y-2.5">
        <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/90 border border-stone-200/80 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-stone-900">Shift Earnings Logger</div>
            <div className="text-[11px] text-stone-500">Calculate hourly rates, tips, and track unpaid hours</div>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/90 border border-stone-200/80 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <PieChart className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-stone-900">Visual Monthly Budget</div>
            <div className="text-[11px] text-stone-500">Real-time usage rings that reset automatically each month</div>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/90 border border-stone-200/80 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <PiggyBank className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-stone-900">Smart Savings Allocation</div>
            <div className="text-[11px] text-stone-500">Direct cash into custom project buckets with celebratory vibes</div>
          </div>
        </div>
      </div>

      {/* Auth Action Section */}
      <div className="space-y-3 pb-4">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-center">
            {errorMsg}
          </div>
        )}

        <button
          id="google-signin-btn"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full py-3.5 px-4 bg-stone-900 hover:bg-stone-800 active:scale-[0.98] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-3 shadow-lg shadow-stone-900/15 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Signing in...</span>
            </div>
          ) : (
            <>
              {/* Google G SVG */}
              <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Sign in with Google</span>
              <ArrowRight className="w-4 h-4 ml-auto text-stone-400" />
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400 text-center font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Secure Google OAuth • Private cloud sync</span>
        </div>
      </div>
    </div>
  );
};
