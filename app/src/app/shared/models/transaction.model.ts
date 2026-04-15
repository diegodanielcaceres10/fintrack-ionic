export type TransactionType = 'expense' | 'income';
export type SyncStatus = 'synced' | 'pending';

export type TransactionCategory =
  | 'housing'
  | 'food'
  | 'transport'
  | 'entertainment'
  | 'health'
  | 'salary'
  | 'shopping'
  | 'utilities'
  | 'travel'
  | 'freelance'
  | 'gift'
  | 'refund'
  | 'other';

export interface TransactionCategoryMeta {
  label: string;
  icon: string;
  bg: string;
  color: string;
  type: TransactionType | 'both';
}

export interface Transaction {
  id: string;
  name: string;
  category: TransactionCategory;
  date: string;
  amount: number;
  type: TransactionType;
  syncStatus: SyncStatus;
  synced: boolean;
  syncedAt: string | null;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateTransactionInput {
  type: TransactionType;
  amount: number;
  categoryId: TransactionCategory;
  note: string;
  date: string;
}

export const TRANSACTION_CATEGORIES: Record<
  TransactionCategory,
  TransactionCategoryMeta
> = {
  housing: {
    label: 'Housing',
    icon: '🏠',
    bg: '#EEF2FF',
    color: '#4F46E5',
    type: 'expense',
  },
  food: {
    label: 'Food',
    icon: '🛒',
    bg: '#F0FDF4',
    color: '#16A34A',
    type: 'expense',
  },
  transport: {
    label: 'Transport',
    icon: '🚇',
    bg: '#FFFBEB',
    color: '#D97706',
    type: 'expense',
  },
  entertainment: {
    label: 'Entertainment',
    icon: '🎬',
    bg: '#FFF1F2',
    color: '#E11D48',
    type: 'expense',
  },
  health: {
    label: 'Health',
    icon: '💊',
    bg: '#FFF1F2',
    color: '#E11D48',
    type: 'expense',
  },
  salary: {
    label: 'Salary',
    icon: '💰',
    bg: '#F0FDF4',
    color: '#16A34A',
    type: 'income',
  },
  shopping: {
    label: 'Shopping',
    icon: '🛍️',
    bg: '#FDF4FF',
    color: '#9333EA',
    type: 'expense',
  },
  utilities: {
    label: 'Utilities',
    icon: '⚡',
    bg: '#FFFBEB',
    color: '#D97706',
    type: 'expense',
  },
  travel: {
    label: 'Travel',
    icon: '✈️',
    bg: '#EFF6FF',
    color: '#2563EB',
    type: 'expense',
  },
  freelance: {
    label: 'Freelance',
    icon: '💻',
    bg: '#EFF6FF',
    color: '#2563EB',
    type: 'income',
  },
  gift: {
    label: 'Gift',
    icon: '🎁',
    bg: '#FFF7ED',
    color: '#EA580C',
    type: 'income',
  },
  refund: {
    label: 'Refund',
    icon: '↩️',
    bg: '#ECFDF5',
    color: '#059669',
    type: 'income',
  },
  other: {
    label: 'Other',
    icon: '📦',
    bg: '#F8F9FB',
    color: '#6B7280',
    type: 'both',
  },
};
