import {
  BASE_CATEGORY_DEFINITIONS,
  CategoryDefinition,
  CategoryUsageType,
} from './category.model';

export type TransactionType = 'expense' | 'income';
export type SyncStatus = 'synced' | 'pending';
export type TransactionCategory = string;

export interface TransactionCategoryMeta {
  label: string;
  icon: string;
  bg: string;
  color: string;
  type: CategoryUsageType;
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

export const TRANSACTION_CATEGORIES: Record<string, CategoryDefinition> =
  BASE_CATEGORY_DEFINITIONS;
