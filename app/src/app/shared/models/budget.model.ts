import { TransactionCategory } from './transaction.model';

export interface Budget {
  id: string;
  categoryId: TransactionCategory;
  monthKey: string;
  limit: number;
  updatedAt: string;
}

export interface SaveBudgetInput {
  categoryId: TransactionCategory;
  monthKey: string;
  limit: number;
}
