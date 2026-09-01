import { db, doc, getDoc, setDoc } from '../lib/firebase';
import { AppState, DEFAULT_SAVINGS_PROJECTS, DEFAULT_JOB_PRESETS } from '../types';
import { getSampleAppState, getEmptyAppState } from '../utils/storage';

export const getUserStorageKey = (userId: string) => `yippee_planner_data_${userId}`;

// Load user state from Firestore, fallback to local cache or sample
export const loadUserAppState = async (userId: string): Promise<AppState> => {
  const localKey = getUserStorageKey(userId);
  let localData: AppState | null = null;
  
  try {
    const raw = localStorage.getItem(localKey);
    if (raw) {
      localData = JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading local user data cache:', e);
  }

  try {
    const stateDocRef = doc(db, 'users', userId, 'userData', 'state');
    const snapshot = await getDoc(stateDocRef);

    if (snapshot.exists()) {
      const remoteData = snapshot.data() as AppState;
      // Sanitize fields to ensure completeness
      const sanitized: AppState = {
        expenses: remoteData.expenses || [],
        shifts: remoteData.shifts || [],
        budgetConfig: remoteData.budgetConfig || {
          earningsSource: 'received',
          customPoolAmount: 0,
          allocations: [],
        },
        jobPresets: remoteData.jobPresets && remoteData.jobPresets.length > 0 
          ? remoteData.jobPresets 
          : DEFAULT_JOB_PRESETS,
        savingsProjects: remoteData.savingsProjects || DEFAULT_SAVINGS_PROJECTS,
        generalSavings: typeof remoteData.generalSavings === 'number' ? remoteData.generalSavings : 0,
        monthlyBudgetLimit: remoteData.monthlyBudgetLimit || 1200,
        categoryLimits: remoteData.categoryLimits || {
          eating_out: 200,
          leisure: 200,
          groceries: 100,
          other: 100,
        },
      };

      // Update local cache
      try {
        localStorage.setItem(localKey, JSON.stringify(sanitized));
      } catch (err) {
        console.error('Error saving local cache:', err);
      }

      return sanitized;
    } else {
      // First time user: If local cache exists, push it to Firestore; otherwise use clean seed
      const initialState = localData || getSampleAppState();
      await saveUserAppState(userId, initialState);
      return initialState;
    }
  } catch (err) {
    console.error('Error loading Firestore user data, using local cache:', err);
    return localData || getSampleAppState();
  }
};

// Save user state both to Firestore and local user cache
export const saveUserAppState = async (userId: string, state: AppState): Promise<void> => {
  const localKey = getUserStorageKey(userId);
  try {
    localStorage.setItem(localKey, JSON.stringify(state));
  } catch (err) {
    console.error('Error saving to localStorage:', err);
  }

  try {
    const stateDocRef = doc(db, 'users', userId, 'userData', 'state');
    await setDoc(stateDocRef, {
      ...state,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.error('Error persisting user data to Firestore:', err);
  }
};

// Save user profile document
export const saveUserProfile = async (user: {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}) => {
  try {
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      id: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Yippee Planner User',
      photoURL: user.photoURL || '',
      lastLogin: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.error('Error saving user profile to Firestore:', err);
  }
};
