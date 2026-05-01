import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';

import { BudgetRepository } from '../repositories/budget.repository';
import { CategoryRepository } from '../repositories/category.repository';
import { TransactionRepository } from '../repositories/transaction.repository';
import { PersistentStoreService } from './persistent-store.service';
import { SyncMode, SyncState, SyncSummary } from '../models/sync.model';

const SYNC_MODE_KEY = 'fintrack.sync.mode.v1';

@Injectable({
  providedIn: 'root',
})
export class SyncService {
  private readonly syncModeSubject = new BehaviorSubject<SyncMode>(
    this.persistentStore.getJsonSync<SyncMode>(SYNC_MODE_KEY, 'daily'),
  );
  private readonly syncStateSubject = new BehaviorSubject<SyncState>('idle');

  readonly syncMode$ = this.syncModeSubject.asObservable();
  readonly syncState$ = this.syncStateSubject.asObservable();

  readonly summary$ = combineLatest([
    this.transactionRepository.allTransactions$,
    this.budgetRepository.budgets$,
    this.categoryRepository.customCategories$,
    this.syncMode$,
    this.syncState$,
  ]).pipe(
    map(([transactions, budgets, categories, syncMode, syncState]) => {
      const syncedAtValues = [
        ...transactions.map((transaction) => transaction.syncedAt),
        ...budgets.map((budget) => budget.syncedAt),
        ...categories.map((category) => category.syncedAt),
      ].filter((value): value is string => !!value);

      const summary: SyncSummary = {
        pendingRecords:
          transactions.filter((transaction) => transaction.syncStatus === 'pending')
            .length +
          budgets.filter((budget) => budget.syncStatus === 'pending').length +
          categories.filter((category) => category.syncStatus === 'pending').length,
        lastSyncedAt: syncedAtValues.length
          ? new Date(syncedAtValues.sort()[syncedAtValues.length - 1])
          : null,
        syncMode,
        syncState,
      };

      return summary;
    }),
  );

  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly budgetRepository: BudgetRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly persistentStore: PersistentStoreService,
  ) {}

  getCurrentSyncMode(): SyncMode {
    return this.syncModeSubject.value;
  }

  setSyncMode(mode: SyncMode): void {
    this.syncModeSubject.next(mode);
    void this.persistentStore.setJson(SYNC_MODE_KEY, mode);
  }

  async syncNow(): Promise<void> {
    if (this.syncStateSubject.value === 'syncing') {
      return;
    }

    this.syncStateSubject.next('syncing');

    try {
      await this.simulateNetworkLatency();
      this.transactionRepository.markAllSynced();
      this.budgetRepository.markAllSynced();
      this.categoryRepository.markAllCustomSynced();
      this.syncStateSubject.next('success');

      window.setTimeout(() => {
        if (this.syncStateSubject.value === 'success') {
          this.syncStateSubject.next('idle');
        }
      }, 2500);
    } catch (error) {
      console.error('Sync failed', error);
      this.syncStateSubject.next('error');
    }
  }

  private async simulateNetworkLatency(): Promise<void> {
    await new Promise<void>((resolve) => {
      window.setTimeout(() => resolve(), 600);
    });
  }
}
