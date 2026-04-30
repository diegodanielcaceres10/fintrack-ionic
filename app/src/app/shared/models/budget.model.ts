import { TransactionCategory } from './transaction.model';
import { SyncMeta } from './sync.model';

export interface Budget extends SyncMeta {
  id: string;
  categoryId: TransactionCategory;
  monthKey: string;
  limit: number;
}

export interface SaveBudgetInput {
  categoryId: TransactionCategory;
  monthKey: string;
  limit: number;
}
