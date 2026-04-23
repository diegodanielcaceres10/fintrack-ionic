import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import {
  CreateTransactionInput,
  Transaction,
  TRANSACTION_CATEGORIES,
} from '../models/transaction.model';

const STORAGE_KEY = 'fintrack.transactions.v2';

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

  updateTransaction(
    transactionId: string,
    input: CreateTransactionInput,
  ): Transaction | null {
    const current = this.transactionsSubject.value.find(
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

    const next = this.transactionsSubject.value.map((transaction) =>
      transaction.id === transactionId ? updatedTransaction : transaction,
    );

    this.persist(next);
    return updatedTransaction;
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
      return [];
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as Transaction[];
      return parsed.filter((txn) => !txn.deletedAt);
    } catch {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
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
