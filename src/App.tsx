import React, { useState, useEffect, useRef } from 'react';
import { PhoneFrame } from './components/PhoneFrame';
import { HomeScreen } from './components/HomeScreen';
import { RecordExpenseScreen } from './components/RecordExpenseScreen';
import { LogEarningsScreen } from './components/LogEarningsScreen';
import { AllocateMoneyScreen } from './components/AllocateMoneyScreen';
import { CategoryUsageScreen } from './components/CategoryUsageScreen';
import { HabitsHistoryScreen } from './components/HabitsHistoryScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { AuthLoginScreen } from './components/AuthLoginScreen';
import { 
  AppState, 
  DEFAULT_JOB_PRESETS, 
  DEFAULT_SAVINGS_PROJECTS, 
  Expense, 
  JobPreset, 
  SavingsProject, 
  Shift, 
  ShiftStatus 
} from './types';
import { getSampleAppState, getEmptyAppState } from './utils/storage';
import { auth, onAuthStateChanged, signOutUser, User } from './lib/firebase';
import { loadUserAppState, saveUserAppState, saveUserProfile } from './services/firestoreSync';

export type AppScreen = 
  | 'home'
  | 'record_expense'
  | 'log_earnings'
  | 'allocate_money'
  | 'category_usage'
  | 'habits_history'
  | 'settings';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [appState, setAppState] = useState<AppState>(() => getSampleAppState());
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home');
  const [isFramed, setIsFramed] = useState<boolean>(true);
  const isInitialLoadRef = useRef<boolean>(true);

  // 1. Listen for Google Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        saveUserProfile(user);
        
        try {
          const userState = await loadUserAppState(user.uid);
          setAppState(userState);
        } catch (err) {
          console.error('Error fetching user data from Firestore:', err);
        }
      } else {
        setCurrentUser(null);
        setCurrentScreen('home');
      }
      setIsAuthChecking(false);
      isInitialLoadRef.current = false;
    });

    return () => unsubscribe();
  }, []);

  // 2. Persist state changes to Firestore & local storage for current user
  useEffect(() => {
    if (isInitialLoadRef.current || !currentUser) return;

    const timeoutId = setTimeout(() => {
      saveUserAppState(currentUser.uid, appState);
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [appState, currentUser]);

  // Sign out handler
  const handleSignOut = async () => {
    try {
      await signOutUser();
      setCurrentUser(null);
      setAppState(getEmptyAppState());
      setCurrentScreen('home');
    } catch (err) {
      console.error('Failed to sign out:', err);
    }
  };

  // Expense Handlers
  const handleAddExpense = (newExpData: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...newExpData,
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: Date.now(),
    };

    setAppState((prev) => ({
      ...prev,
      expenses: [newExpense, ...prev.expenses],
    }));
  };

  const handleDeleteExpense = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
    }));
  };

  // Shift Handlers
  const handleAddShift = (newShiftData: Omit<Shift, 'id' | 'createdAt'>) => {
    const newShift: Shift = {
      ...newShiftData,
      id: `shift-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: Date.now(),
    };

    setAppState((prev) => ({
      ...prev,
      shifts: [newShift, ...prev.shifts],
    }));
  };

  const handleToggleShiftStatus = (id: string, newStatus: ShiftStatus) => {
    setAppState((prev) => ({
      ...prev,
      shifts: prev.shifts.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            status: newStatus,
            receivedDate: newStatus === 'received' ? new Date().toISOString().split('T')[0] : undefined,
          };
        }
        return s;
      }),
    }));
  };

  const handleDeleteShift = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      shifts: prev.shifts.filter((s) => s.id !== id),
    }));
  };

  // Job Preset Handlers
  const handleAddJobPreset = (presetData: Omit<JobPreset, 'id'>) => {
    const newPreset: JobPreset = {
      ...presetData,
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setAppState((prev) => ({
      ...prev,
      jobPresets: [...(prev.jobPresets || DEFAULT_JOB_PRESETS), newPreset],
    }));
    return newPreset;
  };

  const handleUpdateJobPreset = (updatedPreset: JobPreset) => {
    setAppState((prev) => ({
      ...prev,
      jobPresets: (prev.jobPresets || DEFAULT_JOB_PRESETS).map((j) =>
        j.id === updatedPreset.id ? updatedPreset : j
      ),
    }));
  };

  const handleDeleteJobPreset = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      jobPresets: (prev.jobPresets || DEFAULT_JOB_PRESETS).filter((p) => p.id !== id),
    }));
  };

  // Savings & Projects Handlers
  const handleSaveToGeneralSavings = (amount: number) => {
    setAppState((prev) => ({
      ...prev,
      generalSavings: (prev.generalSavings || 0) + amount,
    }));
  };

  const handleAddToProject = (projectId: string, amount: number) => {
    setAppState((prev) => ({
      ...prev,
      savingsProjects: (prev.savingsProjects || DEFAULT_SAVINGS_PROJECTS).map((proj) => {
        if (proj.id === projectId) {
          return {
            ...proj,
            currentAmount: proj.currentAmount + amount,
          };
        }
        return proj;
      }),
    }));
  };

  const handleAddProject = (projectData: Omit<SavingsProject, 'id' | 'createdAt'>) => {
    const newProject: SavingsProject = {
      ...projectData,
      id: `proj-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: Date.now(),
    };
    setAppState((prev) => ({
      ...prev,
      savingsProjects: [...(prev.savingsProjects || DEFAULT_SAVINGS_PROJECTS), newProject],
    }));
  };

  const handleDeleteProject = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      savingsProjects: (prev.savingsProjects || DEFAULT_SAVINGS_PROJECTS).filter((p) => p.id !== id),
    }));
  };

  // Category Limits & Budget Handlers
  const handleUpdateCategoryLimits = (newLimits: Record<string, number>, newTotalBudget: number) => {
    setAppState((prev) => ({
      ...prev,
      categoryLimits: newLimits,
      monthlyBudgetLimit: newTotalBudget,
    }));
  };

  // Clear all data including expenses, shifts, and savings
  const handleResetData = () => {
    if (window.confirm('Clear all data? This will permanently delete all recorded expenses, work shifts, and reset your savings.')) {
      const emptyState = getEmptyAppState();
      setAppState(emptyState);
      if (currentUser) {
        saveUserAppState(currentUser.uid, emptyState);
      }
      setCurrentScreen('home');
    }
  };

  // Aggregate Metrics
  const receivedEarnings = appState.shifts
    .filter((s) => s.status === 'received')
    .reduce((sum, s) => sum + s.totalEarnings, 0);

  const pendingShiftCount = appState.shifts.filter((s) => s.status === 'pending').length;
  const totalExpenses = appState.expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <PhoneFrame isFramed={isFramed} onToggleFrame={() => setIsFramed(!isFramed)}>
      {isAuthChecking ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-stone-50 text-stone-600">
          <div className="w-10 h-10 border-3 border-amber-400 border-t-amber-600 rounded-full animate-spin mb-3" />
          <span className="text-xs font-bold text-stone-500 tracking-wide uppercase">Connecting Yippee Planner...</span>
        </div>
      ) : !currentUser ? (
        <AuthLoginScreen onSuccess={() => setCurrentScreen('home')} />
      ) : (
        <>
          {currentScreen === 'home' && (
            <HomeScreen
              onNavigate={(screen) => setCurrentScreen(screen)}
              receivedEarnings={receivedEarnings}
              totalExpenses={totalExpenses}
              monthlyBudgetLimit={appState.monthlyBudgetLimit || 1200}
              pendingShiftCount={pendingShiftCount}
              currentUser={currentUser}
            />
          )}

          {currentScreen === 'category_usage' && (
            <CategoryUsageScreen
              expenses={appState.expenses}
              categoryLimits={appState.categoryLimits}
              onBack={() => setCurrentScreen('home')}
            />
          )}

          {currentScreen === 'record_expense' && (
            <RecordExpenseScreen
              onBack={() => setCurrentScreen('home')}
              onAddExpense={handleAddExpense}
            />
          )}

          {currentScreen === 'log_earnings' && (
            <LogEarningsScreen
              shifts={appState.shifts}
              jobPresets={appState.jobPresets || DEFAULT_JOB_PRESETS}
              onBack={() => setCurrentScreen('home')}
              onAddShift={handleAddShift}
              onToggleShiftStatus={handleToggleShiftStatus}
              onDeleteShift={handleDeleteShift}
              onAddJobPreset={handleAddJobPreset}
              onDeleteJobPreset={handleDeleteJobPreset}
            />
          )}

          {currentScreen === 'allocate_money' && (
            <AllocateMoneyScreen
              shifts={appState.shifts}
              savingsProjects={appState.savingsProjects || DEFAULT_SAVINGS_PROJECTS}
              generalSavings={appState.generalSavings ?? 0}
              onBack={() => setCurrentScreen('home')}
              onSaveToGeneralSavings={handleSaveToGeneralSavings}
              onAddToProject={handleAddToProject}
              onAddProject={handleAddProject}
              onDeleteProject={handleDeleteProject}
            />
          )}

          {currentScreen === 'habits_history' && (
            <HabitsHistoryScreen
              expenses={appState.expenses}
              shifts={appState.shifts}
              onBack={() => setCurrentScreen('home')}
              onDeleteExpense={handleDeleteExpense}
              onResetData={handleResetData}
            />
          )}

          {currentScreen === 'settings' && (
            <SettingsScreen
              categoryLimits={appState.categoryLimits}
              monthlyBudgetLimit={appState.monthlyBudgetLimit}
              jobPresets={appState.jobPresets || DEFAULT_JOB_PRESETS}
              currentUser={currentUser}
              onBack={() => setCurrentScreen('home')}
              onUpdateCategoryLimits={handleUpdateCategoryLimits}
              onAddJobPreset={handleAddJobPreset}
              onUpdateJobPreset={handleUpdateJobPreset}
              onDeleteJobPreset={handleDeleteJobPreset}
              onSignOut={handleSignOut}
            />
          )}
        </>
      )}
    </PhoneFrame>
  );
}
