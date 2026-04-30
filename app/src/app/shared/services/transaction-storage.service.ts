import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import {
  CreateTransactionInput,
  Transaction,
} from '../models/transaction.model';
import { CategoryStorageService } from './category-storage.service';

const STORAGE_KEY = 'fintrack.transactions.v2';

@Injectable({
  providedIn: 'root',
})
export class TransactionStorageService {
  private readonly initialAllTransactions = this.loadAllTransactions();
  private readonly allTransactionsSubject = new BehaviorSubject<Transaction[]>(
    this.initialAllTransactions,
  );
  private readonly transactionsSubject = new BehaviorSubject<Transaction[]>(
    this.initialAllTransactions.filter((transaction) => !transaction.deletedAt),
  );
  private readonly deletedTransactionsSubject = new BehaviorSubject<
    Transaction[]
  >(
    this.initialAllTransactions.filter((transaction) => !!transaction.deletedAt),
  );

  readonly allTransactions$ = this.allTransactionsSubject.asObservable();
  readonly transactions$ = this.transactionsSubject.asObservable();
  readonly deletedTransactions$ = this.deletedTransactionsSubject.asObservable();

  constructor(private readonly categoryStorage: CategoryStorageService) {}

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

    this.persistAll([transaction, ...this.loadAllTransactions()]);
    return transaction;
  }

  updateTransaction(
    transactionId: string,
    input: CreateTransactionInput,
  ): Transaction | null {
    const current = this.loadAllTransactions().find(
      (transaction) => transaction.id === transactionId,
    );

    if (!current) {
      return null;
    }

    const now = new Date().toISOString();
    const amount =
      input.type === 'expense'
        ? -Math.abs(input.amount)
        : Math.abs(input.amount);

    const updatedTransaction: Transaction = {
      ...current,
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

    const next = this.loadAllTransactions().map((transaction) =>
      transaction.id === transactionId ? updatedTransaction : transaction,
    );

    this.persistAll(next);
    return updatedTransaction;
  }

  softDeleteTransaction(transactionId: string): void {
    const now = new Date().toISOString();
    this.persistAll(
      this.loadAllTransactions().map((transaction) =>
        transaction.id === transactionId
          ? {
              ...transaction,
              deletedAt: now,
              updatedAt: now,
              synced: false,
              syncStatus: 'pending',
            }
          : transaction,
      ),
    );
  }

  restoreTransaction(transactionId: string): void {
    const now = new Date().toISOString();
    this.persistAll(
      this.loadAllTransactions().map((transaction) =>
        transaction.id === transactionId
          ? {
              ...transaction,
              deletedAt: null,
              updatedAt: now,
              synced: false,
              syncStatus: 'pending',
            }
          : transaction,
      ),
    );
  }

  markAllSynced(): void {
    const syncedAt = new Date().toISOString();
    this.persistAll(
      this.loadAllTransactions().map((transaction) => ({
        ...transaction,
        syncStatus: 'synced',
        synced: true,
        syncedAt,
      })),
    );
  }

  private loadAllTransactions(): Transaction[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }

    try {
      return (JSON.parse(raw) as Partial<Transaction>[]).map((transaction) =>
        this.normalizeTransaction(transaction),
      );
    } catch {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }
  }

  private persistAll(transactions: Transaction[]): void {
    this.allTransactionsSubject.next(transactions);
    this.transactionsSubject.next(
      transactions.filter((transaction) => !transaction.deletedAt),
    );
    this.deletedTransactionsSubject.next(
      transactions
        .filter((transaction) => !!transaction.deletedAt)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    );

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
    return this.categoryStorage.getCategoryMap()[categoryId]?.label ?? 'Other';
  }

  private normalizeTransaction(raw: Partial<Transaction>): Transaction {
    const updatedAt = raw.updatedAt ?? new Date().toISOString();

    return {
      id: raw.id ?? this.createId(),
      name: raw.name ?? 'Transaction',
      category: raw.category ?? 'other',
      date: raw.date ?? new Date().toISOString().slice(0, 10),
      amount: typeof raw.amount === 'number' ? raw.amount : 0,
      type: raw.type === 'income' ? 'income' : 'expense',
      syncStatus: raw.synced === true ? 'synced' : raw.syncStatus ?? 'pending',
      synced: raw.synced ?? raw.syncStatus === 'synced',
      syncedAt: raw.syncedAt ?? null,
      updatedAt,
      deletedAt: raw.deletedAt ?? null,
    };
  }
}
