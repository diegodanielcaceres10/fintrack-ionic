import { Injectable } from '@angular/core';

import {
  CreateTransactionInput,
  Transaction,
} from '../models/transaction.model';
import { TransactionStorageService } from '../services/transaction-storage.service';

@Injectable({
  providedIn: 'root',
})
export class TransactionRepository {
  readonly allTransactions$ = this.transactionStorage.allTransactions$;
  readonly transactions$ = this.transactionStorage.transactions$;
  readonly deletedTransactions$ = this.transactionStorage.deletedTransactions$;

  constructor(
    private readonly transactionStorage: TransactionStorageService,
  ) {}

  add(input: CreateTransactionInput): Transaction {
    return this.transactionStorage.addTransaction(input);
  }

  update(
    transactionId: string,
    input: CreateTransactionInput,
  ): Transaction | null {
    return this.transactionStorage.updateTransaction(transactionId, input);
  }

  softDelete(transactionId: string): void {
    this.transactionStorage.softDeleteTransaction(transactionId);
  }

  restore(transactionId: string): void {
    this.transactionStorage.restoreTransaction(transactionId);
  }

  markAllSynced(): void {
    this.transactionStorage.markAllSynced();
  }
}
