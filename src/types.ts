export type ExpenseCategory = 
  | 'eating_out' 
  | 'leisure' 
  | 'groceries' 
  | 'other'
  | 'rent_housing' 
  | 'savings' 
  | 'transport' 
  | 'utilities';

export interface CategoryInfo {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  iconName: string;
  isOutsideFood?: boolean;
  isLeisure?: boolean;
  defaultPercentage: number;
  description: string;
}

export interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  date: string; // YYYY-MM-DD
  note: string;
  isOutsideFood: boolean;
  isLeisure: boolean;
  location?: string;
  paymentMethod?: 'card' | 'cash' | 'transfer' | 'digital_wallet';
  createdAt: number;
}

export type ShiftStatus = 'pending' | 'received';

export interface Shift {
  id: string;
  date: string; // YYYY-MM-DD
  workplace: string;
  role: string;
  hoursWorked: number;
  hourlyRate: number;
  bonus: number;
  totalEarnings: number;
  status: ShiftStatus;
  receivedDate?: string;
  notes?: string;
  incomeType?: 'shift' | 'yippee';
  paymentMethod?: 'bank_transfer' | 'giftcard' | 'cash';
  createdAt: number;
}

export interface JobPreset {
  id: string;
  title: string;
  workplace: string;
  role?: string;
  hourlyRate: number;
  defaultHours?: number;
  defaultBonus?: number;
}

export interface SavingsProject {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  createdAt: number;
}

export const DEFAULT_SAVINGS_PROJECTS: SavingsProject[] = [
  {
    id: 'proj-1',
    title: 'Concert tickets',
    targetAmount: 220,
    currentAmount: 120,
    createdAt: Date.now() - 86400000 * 10,
  },
  {
    id: 'proj-2',
    title: 'Weekend road trip',
    targetAmount: 500,
    currentAmount: 350,
    createdAt: Date.now() - 86400000 * 20,
  },
];

export const DEFAULT_JOB_PRESETS: JobPreset[] = [
  {
    id: 'job-1',
    title: 'Apex Cafe',
    workplace: 'Apex Cafe & Roasters',
    role: 'Barista',
    hourlyRate: 24.00,
    defaultHours: 6.5,
    defaultBonus: 15.00,
  },
  {
    id: 'job-2',
    title: 'Event Staffing Pro',
    workplace: 'Event Staffing Pro',
    role: 'Event Assistant',
    hourlyRate: 28.00,
    defaultHours: 7.0,
    defaultBonus: 0,
  },
  {
    id: 'job-3',
    title: 'Private Tutoring',
    workplace: 'Tutoring Academy / Clients',
    role: 'Tutor',
    hourlyRate: 35.00,
    defaultHours: 3.0,
    defaultBonus: 0,
  },
];

export interface CategoryAllocation {
  categoryId: string;
  percentage: number; // 0 - 100
  isLocked?: boolean;
}

export interface BudgetConfig {
  earningsSource: 'received' | 'projected' | 'custom';
  customPoolAmount: number;
  allocations: CategoryAllocation[];
}

export interface AppState {
  expenses: Expense[];
  shifts: Shift[];
  budgetConfig?: BudgetConfig;
  jobPresets?: JobPreset[];
  savingsProjects?: SavingsProject[];
  generalSavings?: number;
  monthlyBudgetLimit?: number;
  categoryLimits?: Record<string, number>;
}

export const DEFAULT_CATEGORIES: CategoryInfo[] = [
  {
    id: 'eating_out',
    name: 'Eating Out',
    color: '#FB5607', // Blaze Orange
    bgColor: '#FFF3EB',
    borderColor: '#FFD7C2',
    iconName: 'UtensilsCrossed',
    isOutsideFood: true,
    isLeisure: false,
    defaultPercentage: 25,
    description: 'Restaurants, cafes, takeout, fast food, coffee & delivery',
  },
  {
    id: 'leisure',
    name: 'Leisure',
    color: '#FF006E', // Neon Pink
    bgColor: '#FFF0F6',
    borderColor: '#FFCCE0',
    iconName: 'Sparkles',
    isOutsideFood: false,
    isLeisure: true,
    defaultPercentage: 20,
    description: 'Outings, movies, gaming, events, hobbies & recreation',
  },
  {
    id: 'groceries',
    name: 'Groceries',
    color: '#FFBE0B', // Amber Gold
    bgColor: '#FFFBEA',
    borderColor: '#FDE68A',
    iconName: 'ShoppingBag',
    isOutsideFood: false,
    isLeisure: false,
    defaultPercentage: 30,
    description: 'Supermarket food, pantry essentials, fresh produce & home cooking',
  },
  {
    id: 'other',
    name: 'Other',
    color: '#8338EC', // Blue Violet
    bgColor: '#F5F0FF',
    borderColor: '#DDD0FC',
    iconName: 'MoreHorizontal',
    isOutsideFood: false,
    isLeisure: false,
    defaultPercentage: 10,
    description: 'Miscellaneous purchases, personal items & one-off expenses',
  },
];

export const SAVINGS_CATEGORY_INFO: CategoryInfo = {
  id: 'savings',
  name: 'Savings (Banked)',
  color: '#3A86FF', // Azure Blue
  bgColor: '#EDF5FF',
  borderColor: '#BFDBFE',
  iconName: 'PiggyBank',
  isOutsideFood: false,
  isLeisure: false,
  defaultPercentage: 15,
  description: 'Remaining unallocated funds banked into savings',
};

