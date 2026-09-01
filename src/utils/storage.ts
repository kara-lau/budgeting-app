import { AppState, DEFAULT_CATEGORIES, DEFAULT_JOB_PRESETS, DEFAULT_SAVINGS_PROJECTS, Expense, JobPreset, SavingsProject, Shift } from '../types';

const STORAGE_KEY = 'cashflow_tracker_app_data_v1';

// Generate realistic mock data around current date
const generateSeedData = (): AppState => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  const formatDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  const initialExpenses: Expense[] = [
    {
      id: 'exp-1',
      amount: 18.50,
      categoryId: 'eating_out',
      categoryName: 'Eating Out',
      date: formatDate(0),
      note: 'Ramen bowl & iced green tea lunch',
      isOutsideFood: true,
      isLeisure: false,
      location: 'Ichiraku Noodle Bar',
      paymentMethod: 'card',
      createdAt: Date.now() - 3600000 * 4,
    },
    {
      id: 'exp-2',
      amount: 6.25,
      categoryId: 'eating_out',
      categoryName: 'Eating Out',
      date: formatDate(1),
      note: 'Morning oat milk latte & croissant',
      isOutsideFood: true,
      isLeisure: false,
      location: 'Artisan Cafe',
      paymentMethod: 'digital_wallet',
      createdAt: Date.now() - 86400000 * 1,
    },
    {
      id: 'exp-3',
      amount: 32.00,
      categoryId: 'leisure',
      categoryName: 'Leisure',
      date: formatDate(2),
      note: 'Cinema ticket & snacks for movie night',
      isOutsideFood: false,
      isLeisure: true,
      location: 'Grand Cinema',
      paymentMethod: 'card',
      createdAt: Date.now() - 86400000 * 2,
    },
    {
      id: 'exp-4',
      amount: 74.80,
      categoryId: 'groceries',
      categoryName: 'Groceries',
      date: formatDate(3),
      note: 'Weekly fresh produce, pasta, veggies & eggs',
      isOutsideFood: false,
      isLeisure: false,
      location: 'Trader Market',
      paymentMethod: 'card',
      createdAt: Date.now() - 86400000 * 3,
    },
    {
      id: 'exp-5',
      amount: 42.00,
      categoryId: 'eating_out',
      categoryName: 'Eating Out',
      date: formatDate(4),
      note: 'Dinner with friends at taco grill',
      isOutsideFood: true,
      isLeisure: false,
      location: 'La Cantina',
      paymentMethod: 'card',
      createdAt: Date.now() - 86400000 * 4,
    },
    {
      id: 'exp-6',
      amount: 25.00,
      categoryId: 'leisure',
      categoryName: 'Leisure',
      date: formatDate(6),
      note: 'Bouldering gym day pass',
      isOutsideFood: false,
      isLeisure: true,
      location: 'Summit Climbing Hub',
      paymentMethod: 'transfer',
      createdAt: Date.now() - 86400000 * 6,
    },
    {
      id: 'exp-7',
      amount: 45.00,
      categoryId: 'other',
      categoryName: 'Other',
      date: formatDate(8),
      note: 'Phone screen protector & charging cable',
      isOutsideFood: false,
      isLeisure: false,
      location: 'Tech Depot',
      paymentMethod: 'card',
      createdAt: Date.now() - 86400000 * 8,
    },
    {
      id: 'exp-8',
      amount: 14.50,
      categoryId: 'eating_out',
      categoryName: 'Eating Out',
      date: formatDate(9),
      note: 'Quick burrito bowl on lunch break',
      isOutsideFood: true,
      isLeisure: false,
      location: 'Chipotle Express',
      paymentMethod: 'card',
      createdAt: Date.now() - 86400000 * 9,
    },
  ];

  const initialShifts: Shift[] = [
    {
      id: 'shift-1',
      date: formatDate(0),
      workplace: 'Apex Cafe & Roasters',
      role: 'Head Barista',
      hoursWorked: 6.5,
      hourlyRate: 24.00,
      bonus: 20.00, // Tips
      totalEarnings: 6.5 * 24.00 + 20.00,
      status: 'pending',
      notes: 'Sunday rush shift + good cash tips pool',
      createdAt: Date.now() - 3600000 * 6,
    },
    {
      id: 'shift-2',
      date: formatDate(2),
      workplace: 'Apex Cafe & Roasters',
      role: 'Barista',
      hoursWorked: 8.0,
      hourlyRate: 24.00,
      bonus: 15.00,
      totalEarnings: 8.0 * 24.00 + 15.00,
      status: 'pending',
      notes: 'Closing shift with stock inventory',
      createdAt: Date.now() - 86400000 * 2,
    },
    {
      id: 'shift-3',
      date: formatDate(4),
      workplace: 'Event Staffing Pro',
      role: 'Exhibition Host',
      hoursWorked: 7.0,
      hourlyRate: 28.00,
      bonus: 0,
      totalEarnings: 7.0 * 28.00,
      status: 'received',
      receivedDate: formatDate(1),
      notes: 'Design expo visitor registration desk (Paid via direct deposit)',
      createdAt: Date.now() - 86400000 * 4,
    },
    {
      id: 'shift-4',
      date: formatDate(7),
      workplace: 'Apex Cafe & Roasters',
      role: 'Barista',
      hoursWorked: 7.5,
      hourlyRate: 24.00,
      bonus: 18.00,
      totalEarnings: 7.5 * 24.00 + 18.00,
      status: 'received',
      receivedDate: formatDate(3),
      notes: 'Morning rush shift',
      createdAt: Date.now() - 86400000 * 7,
    },
    {
      id: 'shift-5',
      date: formatDate(9),
      workplace: 'Apex Cafe & Roasters',
      role: 'Barista',
      hoursWorked: 8.0,
      hourlyRate: 24.00,
      bonus: 25.00,
      totalEarnings: 8.0 * 24.00 + 25.00,
      status: 'received',
      receivedDate: formatDate(5),
      notes: 'Full Saturday double shift',
      createdAt: Date.now() - 86400000 * 9,
    },
    {
      id: 'shift-6',
      date: formatDate(13),
      workplace: 'Event Staffing Pro',
      role: 'Event Assistant',
      hoursWorked: 6.0,
      hourlyRate: 28.00,
      bonus: 30.00,
      totalEarnings: 6.0 * 28.00 + 30.00,
      status: 'received',
      receivedDate: formatDate(10),
      notes: 'Corporate networking gala setup',
      createdAt: Date.now() - 86400000 * 13,
    },
    {
      id: 'shift-7',
      date: formatDate(16),
      workplace: 'Apex Cafe & Roasters',
      role: 'Barista',
      hoursWorked: 8.0,
      hourlyRate: 24.00,
      bonus: 12.00,
      totalEarnings: 8.0 * 24.00 + 12.00,
      status: 'received',
      receivedDate: formatDate(12),
      notes: 'Midweek training shift',
      createdAt: Date.now() - 86400000 * 16,
    }
  ];

  const initialAllocations = DEFAULT_CATEGORIES.map(cat => ({
    categoryId: cat.id,
    percentage: cat.defaultPercentage,
    isLocked: false,
  }));

  return {
    expenses: initialExpenses,
    shifts: initialShifts,
    budgetConfig: {
      earningsSource: 'received',
      customPoolAmount: 2000,
      allocations: initialAllocations,
    },
    jobPresets: DEFAULT_JOB_PRESETS,
    savingsProjects: DEFAULT_SAVINGS_PROJECTS,
    generalSavings: 450.00,
    monthlyBudgetLimit: 1200.00,
    categoryLimits: {
      eating_out: 350,
      leisure: 250,
      groceries: 450,
      other: 150,
    },
  };
};

export const loadAppState = (): AppState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = generateSeedData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw);
    
    // Ensure savingsProjects exist
    if (!parsed.savingsProjects || parsed.savingsProjects.length === 0) {
      parsed.savingsProjects = DEFAULT_SAVINGS_PROJECTS;
    }

    if (typeof parsed.generalSavings !== 'number') {
      parsed.generalSavings = 450.00;
    }

    if (!parsed.monthlyBudgetLimit) {
      parsed.monthlyBudgetLimit = 1200.00;
    }

    if (!parsed.categoryLimits) {
      parsed.categoryLimits = {
        eating_out: 350,
        leisure: 250,
        groceries: 450,
        other: 150,
      };
    }

    if (!parsed.jobPresets || parsed.jobPresets.length === 0) {
      parsed.jobPresets = DEFAULT_JOB_PRESETS;
    }

    return parsed;
  } catch (err) {
    console.error('Failed to load state from localStorage:', err);
    return generateSeedData();
  }
};

export const saveAppState = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatShortCurrency = (amount: number): string => {
  if (Math.abs(amount) >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`;
  }
  return `$${amount.toFixed(0)}`;
};
