export type CategoryUsageType = 'expense' | 'income' | 'both';

export interface CategoryDefinition {
  id: string;
  label: string;
  icon: string;
  bg: string;
  color: string;
  type: CategoryUsageType;
  isSystem: boolean;
}

export interface SaveCategoryInput {
  id?: string;
  label: string;
  icon: string;
  color: string;
  type: CategoryUsageType;
}

export const BASE_CATEGORY_DEFINITIONS: Record<string, CategoryDefinition> = {
  housing: {
    id: 'housing',
    label: 'Housing',
    icon: '🏠',
    bg: '#EEF2FF',
    color: '#4F46E5',
    type: 'expense',
    isSystem: true,
  },
  food: {
    id: 'food',
    label: 'Food',
    icon: '🛒',
    bg: '#F0FDF4',
    color: '#16A34A',
    type: 'expense',
    isSystem: true,
  },
  transport: {
    id: 'transport',
    label: 'Transport',
    icon: '🚇',
    bg: '#FFFBEB',
    color: '#D97706',
    type: 'expense',
    isSystem: true,
  },
  entertainment: {
    id: 'entertainment',
    label: 'Entertainment',
    icon: '🎬',
    bg: '#FFF1F2',
    color: '#E11D48',
    type: 'expense',
    isSystem: true,
  },
  health: {
    id: 'health',
    label: 'Health',
    icon: '💊',
    bg: '#FFF1F2',
    color: '#E11D48',
    type: 'expense',
    isSystem: true,
  },
  salary: {
    id: 'salary',
    label: 'Salary',
    icon: '💰',
    bg: '#F0FDF4',
    color: '#16A34A',
    type: 'income',
    isSystem: true,
  },
  shopping: {
    id: 'shopping',
    label: 'Shopping',
    icon: '🛍️',
    bg: '#FDF4FF',
    color: '#9333EA',
    type: 'expense',
    isSystem: true,
  },
  utilities: {
    id: 'utilities',
    label: 'Utilities',
    icon: '⚡',
    bg: '#FFFBEB',
    color: '#D97706',
    type: 'expense',
    isSystem: true,
  },
  travel: {
    id: 'travel',
    label: 'Travel',
    icon: '✈️',
    bg: '#EFF6FF',
    color: '#2563EB',
    type: 'expense',
    isSystem: true,
  },
  freelance: {
    id: 'freelance',
    label: 'Freelance',
    icon: '💻',
    bg: '#EFF6FF',
    color: '#2563EB',
    type: 'income',
    isSystem: true,
  },
  gift: {
    id: 'gift',
    label: 'Gift',
    icon: '🎁',
    bg: '#FFF7ED',
    color: '#EA580C',
    type: 'income',
    isSystem: true,
  },
  refund: {
    id: 'refund',
    label: 'Refund',
    icon: '↩️',
    bg: '#ECFDF5',
    color: '#059669',
    type: 'income',
    isSystem: true,
  },
  other: {
    id: 'other',
    label: 'Other',
    icon: '📦',
    bg: '#F8F9FB',
    color: '#6B7280',
    type: 'both',
    isSystem: true,
  },
};
