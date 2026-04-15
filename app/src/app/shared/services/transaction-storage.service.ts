import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import {
  CreateTransactionInput,
  Transaction,
  TRANSACTION_CATEGORIES,
} from '../models/transaction.model';

const STORAGE_KEY = 'fintrack.transactions.v1';

const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: 't01',
    name: 'Whole Foods Market',
    category: 'food',
    date: '2026-04-10',
    amount: -84,
    type: 'expense',
    syncStatus: 'synced',
    synced: true,
    syncedAt: '2026-04-10T10:00:00.000Z',
    updatedAt: '2026-04-10T10:00:00.000Z',
    deletedAt: null,
  },
  {
    id: 't02',
    name: 'Uber ride',
    category: 'transport',
    date: '2026-04-10',
    amount: -12.5,
    type: 'expense',
    syncStatus: 'pending',
    synced: false,
    syncedAt: null,
    updatedAt: '2026-04-10T11:00:00.000Z',
    deletedAt: null,
  },
  {
    id: 't03',
    name: 'Freelance payment',
    category: 'freelance',
    date: '2026-04-10',
    amount: 850,
    type: 'income',
    syncStatus: 'synced',
    synced: true,
    syncedAt: '2026-04-10T12:00:00.000Z',
    updatedAt: '2026-04-10T12:00:00.000Z',
    deletedAt: null,
  },
  {
    id: 't04',
    name: 'CVS Pharmacy',
    category: 'health',
    date: '2026-04-09',
    amount: -32,
    type: 'expense',
    syncStatus: 'synced',
    synced: true,
    syncedAt: '2026-04-09T15:00:00.000Z',
    updatedAt: '2026-04-09T15:00:00.000Z',
    deletedAt: null,
  },
  {
    id: 't05',
    name: 'Amazon order',
    category: 'shopping',
    date: '2026-04-09',
    amount: -67.99,
    type: 'expense',
    syncStatus: 'pending',
    synced: false,
    syncedAt: null,
    updatedAt: '2026-04-09T18:00:00.000Z',
    deletedAt: null,
  },
  {
    id: 't06',
    name: 'Electric bill',
    category: 'utilities',
    date: '2026-04-09',
    amount: -110,
    type: 'expense',
    syncStatus: 'synced',
    synced: true,
    syncedAt: '2026-04-09T20:00:00.000Z',
    updatedAt: '2026-04-09T20:00:00.000Z',
    deletedAt: null,
  },
  {
    id: 't07',
    name: 'Netflix',
    category: 'entertainment',
    date: '2026-04-08',
    amount: -15,
    type: 'expense',
    syncStatus: 'synced',
    synced: true,
    syncedAt: '2026-04-08T10:00:00.000Z',
    updatedAt: '2026-04-08T10:00:00.000Z',
    deletedAt: null,
  },
  {
    id: 't08',
    name: 'Flight to Madrid',
    category: 'travel',
    date: '2026-04-08',
    amount: -340,
    type: 'expense',
    syncStatus: 'pending',
    synced: false,
    syncedAt: null,
    updatedAt: '2026-04-08T13:00:00.000Z',
    deletedAt: null,
  },
  {
    id: 't09',
    name: 'Spotify',
    category: 'entertainment',
    date: '2026-04-08',
    amount: -9.99,
    type: 'expense',
    syncStatus: 'synced',
    synced: true,
    syncedAt: '2026-04-08T16:00:00.000Z',
    updatedAt: '2026-04-08T16:00:00.000Z',
    deletedAt: null,
  },
  {
    id: 't10',
    name: 'Metro card top-up',
    category: 'transport',
    date: '2026-04-07',
    amount: -40,
    type: 'expense',
    syncStatus: 'synced',
    synced: true,
    syncedAt: '2026-04-07T08:00:00.000Z',
    updatedAt: '2026-04-07T08:00:00.000Z',
    deletedAt: null,
  },
  {
    id: 't11',
    name: 'Salary deposit',
    category: 'salary',
    date: '2026-04-07',
    amount: 4500,
    type: 'income',
    syncStatus: 'synced',
    synced: true,
    syncedAt: '2026-04-07T09:00:00.000Z',
    updatedAt: '2026-04-07T09:00:00.000Z',
    deletedAt: null,
  },
  {
    id: 't12',
    name: 'Gym membership',
    category: 'health',
    date: '2026-04-05',
    amount: -45,
    type: 'expense',
    syncStatus: 'synced',
    synced: true,
    syncedAt: '2026-04-05T10:00:00.000Z',
    updatedAt: '2026-04-05T10:00:00.000Z',
    deletedAt: null,
  },
  {
    id: 't13',
    name: 'Zara',
    category: 'shopping',
    date: '2026-04-05',
    amount: -129,
    type: 'expense',
    syncStatus: 'pending',
    synced: false,
    syncedAt: null,
    updatedAt: '2026-04-05T14:00:00.000Z',
    deletedAt: null,
  },
  {
    id: 't14',
    name: 'Rent payment',
    category: 'housing',
    date: '2026-04-03',
    amount: -1130,
    type: 'expense',
    syncStatus: 'synced',
    synced: true,
    syncedAt: '2026-04-03T08:00:00.000Z',
    updatedAt: '2026-04-03T08:00:00.000Z',
    deletedAt: null,
  },
  {
    id: 't15',
    name: 'Side project income',
    category: 'freelance',
    date: '2026-04-03',
    amount: 200,
    type: 'income',
    syncStatus: 'synced',
    synced: true,
    syncedAt: '2026-04-03T12:00:00.000Z',
    updatedAt: '2026-04-03T12:00:00.000Z',
    deletedAt: null,
  },
];

@Injectable({
  providedIn: 'root',
})
export class TransactionStorageService {
  private readonly initialTransactions = this.loadTransactions();
  private readonly transactionsSubject = new BehaviorSubject<Transaction[]>(
    this.initialTransactions,
  );

  readonly transactions$ = this.transactionsSubject.asObservable();

  addTransaction(input: CreateTransactionInput): Transaction {
    const now = new Date().toISOString();
    const amount =
      input.type === 'expense'
        ? -Math.abs(input.amount)
        : Math.abs(input.amount);

    const transaction: Transaction = {
      id: this.createId(),
      name: this.buildName(input.note, input.categoryId),
      category: input.categoryId,
      date: input.date,
      amount,
      type: input.type,
      syncStatus: 'pending',
      synced: false,
      syncedAt: null,
      updatedAt: now,
      deletedAt: null,
    };

    const next = [transaction, ...this.transactionsSubject.value];
    this.persist(next);
    return transaction;
  }

  softDeleteTransaction(transactionId: string): void {
    const now = new Date().toISOString();
    const next = this.transactionsSubject.value.filter(
      (transaction) => transaction.id !== transactionId,
    );

    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      const persisted = raw
        ? (JSON.parse(raw) as Transaction[]).map((transaction) =>
            transaction.id === transactionId
              ? {
                  ...transaction,
                  deletedAt: now,
                  updatedAt: now,
                  synced: false,
                  syncStatus: 'pending',
                }
              : transaction,
          )
        : next;

      localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    }

    this.transactionsSubject.next(next);
  }

  private loadTransactions(): Transaction[] {
    if (typeof localStorage === 'undefined') {
      return [...SEED_TRANSACTIONS];
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_TRANSACTIONS));
      return [...SEED_TRANSACTIONS];
    }

    try {
      const parsed = JSON.parse(raw) as Transaction[];
      return parsed.filter((txn) => !txn.deletedAt);
    } catch {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_TRANSACTIONS));
      return [...SEED_TRANSACTIONS];
    }
  }

  private persist(transactions: Transaction[]): void {
    this.transactionsSubject.next(transactions);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    }
  }

  private createId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }

    return `txn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private buildName(
    note: string,
    categoryId: CreateTransactionInput['categoryId'],
  ): string {
    const trimmed = note.trim();
    if (trimmed) return trimmed;
    return TRANSACTION_CATEGORIES[categoryId].label;
  }
}
