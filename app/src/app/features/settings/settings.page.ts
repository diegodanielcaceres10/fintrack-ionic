import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { IonAlert } from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';

import { AppShellComponent } from '../../shared/components/app-shell/app-shell.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { CategorySheetComponent } from '../../shared/components/category-sheet/category-sheet.component';
import { Budget } from '../../shared/models/budget.model';
import {
  CategoryDefinition,
  SaveCategoryInput,
} from '../../shared/models/category.model';
import { Transaction } from '../../shared/models/transaction.model';
import { BudgetRepository } from '../../shared/repositories/budget.repository';
import { CategoryRepository } from '../../shared/repositories/category.repository';
import { TransactionRepository } from '../../shared/repositories/transaction.repository';

export type SyncMode = 'manual' | 'daily' | 'automatic';
export type SyncState = 'idle' | 'syncing' | 'success' | 'error';

interface SyncOption {
  value: SyncMode;
  label: string;
  subtitle: string;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  host: {
    class: 'ion-page',
  },
  imports: [
    CommonModule,
    IonAlert,
    AppShellComponent,
    BadgeComponent,
    CategorySheetComponent,
  ],
})
export class SettingsPage implements OnInit, OnDestroy {
  private categoriesSubscription?: Subscription;
  private customCategoriesSubscription?: Subscription;
  private transactionsSubscription?: Subscription;
  private budgetsSubscription?: Subscription;
  private deletedTransactionsSubscription?: Subscription;
  private transactionCategoryIds: string[] = [];
  private budgetCategoryIds: string[] = [];
  private usedCategoryIds = new Set<string>();
  private customCategories: CategoryDefinition[] = [];
  private transactions: Transaction[] = [];
  private budgets: Budget[] = [];

  selectedSyncMode: SyncMode = 'daily';

  readonly syncOptions: SyncOption[] = [
    {
      value: 'manual',
      label: 'Manual',
      subtitle: 'Sync only when you tap the button',
    },
    {
      value: 'daily',
      label: 'Daily',
      subtitle: 'Syncs automatically once per day',
    },
    {
      value: 'automatic',
      label: 'Automatic',
      subtitle: 'Syncs in real time as changes happen',
    },
  ];

  lastSyncedAt: Date | null = null;
  pendingRecords = 0;
  syncState: SyncState = 'idle';

  readonly userEmail = 'alex.johnson@email.com';

  categories: CategoryDefinition[] = [];
  deletedTransactions: Transaction[] = [];
  editingCategory: CategoryDefinition | null = null;
  deletingCategory: CategoryDefinition | null = null;

  readonly deleteCategoryButtons = [
    {
      text: 'Cancel',
      role: 'cancel',
    },
    {
      text: 'Delete',
      role: 'destructive',
      handler: () => this.confirmDeleteCategory(),
    },
  ];

  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly budgetRepository: BudgetRepository,
  ) {}

  get lastSyncLabel(): string {
    if (!this.lastSyncedAt) {
      return 'Never';
    }

    const diffMs = Date.now() - this.lastSyncedAt.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin} min ago`;

    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return this.lastSyncedAt.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  get syncBtnLabel(): string {
    switch (this.syncState) {
      case 'syncing':
        return 'Syncing...';
      case 'success':
        return 'All caught up';
      case 'error':
        return 'Retry sync';
      default:
        return this.pendingRecords > 0 ? 'Sync now' : 'Refresh status';
    }
  }

  get syncBtnVariant(): string {
    switch (this.syncState) {
      case 'syncing':
        return 'btn-primary--syncing';
      case 'success':
        return 'btn-primary--success';
      case 'error':
        return 'btn-primary--danger';
      default:
        return '';
    }
  }

  setSyncMode(mode: SyncMode): void {
    this.selectedSyncMode = mode;
  }

  syncNow(): void {
    if (this.syncState === 'syncing') {
      return;
    }

    this.syncState = 'syncing';

    setTimeout(() => {
      this.transactionRepository.markAllSynced();
      this.budgetRepository.markAllSynced();
      this.categoryRepository.markAllCustomSynced();
      this.syncState = 'success';

      setTimeout(() => {
        this.syncState = 'idle';
      }, 2500);
    }, 600);
  }

  logout(): void {
    console.log('logout');
  }

  openCreateCategory(): void {
    this.editingCategory = {
      id: '',
      label: '',
      icon: '',
      bg: '#4F46E51A',
      color: '#4F46E5',
      type: 'expense',
      isSystem: false,
      syncStatus: 'pending',
      synced: false,
      syncedAt: null,
      updatedAt: new Date().toISOString(),
    };
  }

  openEditCategory(category: CategoryDefinition): void {
    if (category.isSystem) {
      return;
    }

    this.editingCategory = category;
  }

  closeCategorySheet(): void {
    this.editingCategory = null;
  }

  saveCategory(input: SaveCategoryInput): void {
    this.categoryRepository.save(input);
    this.closeCategorySheet();
  }

  askDeleteCategory(category: CategoryDefinition): void {
    if (category.isSystem || !this.canDeleteCategory(category)) {
      return;
    }

    this.deletingCategory = category;
  }

  closeDeleteCategoryAlert(): void {
    this.deletingCategory = null;
  }

  deleteCategoryMessage(): string {
    if (!this.deletingCategory) {
      return '';
    }

    return `Delete "${this.deletingCategory.label}"? Existing transactions will keep the saved category id, so remove only unused custom categories.`;
  }

  trackByCategory(_: number, category: CategoryDefinition): string {
    return category.id;
  }

  trackByTransaction(_: number, transaction: Transaction): string {
    return transaction.id;
  }

  canDeleteCategory(category: CategoryDefinition): boolean {
    return !category.isSystem && !this.usedCategoryIds.has(category.id);
  }

  ngOnInit(): void {
    this.categoriesSubscription = this.categoryRepository.categories$.subscribe(
      (categories) => {
        this.categories = [...categories].sort((a, b) => {
          if (a.isSystem !== b.isSystem) {
            return a.isSystem ? -1 : 1;
          }

          return a.label.localeCompare(b.label);
        });
      },
    );

    this.customCategoriesSubscription =
      this.categoryRepository.customCategories$.subscribe((categories) => {
        this.customCategories = categories;
        this.refreshSyncStatus();
      });

    this.transactionsSubscription = this.transactionRepository.transactions$.subscribe(
      (transactions) => {
        this.transactions = transactions;
        this.transactionCategoryIds = transactions.map(
          (transaction) => transaction.category,
        );
        this.syncUsedCategoryIds();
        this.refreshSyncStatus();
      },
    );

    this.budgetsSubscription = this.budgetRepository.budgets$.subscribe((budgets) => {
      this.budgets = budgets;
      this.budgetCategoryIds = budgets.map((budget) => budget.categoryId);
      this.syncUsedCategoryIds();
      this.refreshSyncStatus();
    });

    this.deletedTransactionsSubscription =
      this.transactionRepository.deletedTransactions$.subscribe((transactions) => {
        this.deletedTransactions = transactions;
        this.refreshSyncStatus();
      });
  }

  ngOnDestroy(): void {
    this.categoriesSubscription?.unsubscribe();
    this.customCategoriesSubscription?.unsubscribe();
    this.transactionsSubscription?.unsubscribe();
    this.budgetsSubscription?.unsubscribe();
    this.deletedTransactionsSubscription?.unsubscribe();
  }

  restoreTransaction(transactionId: string): void {
    this.transactionRepository.restore(transactionId);
  }

  private confirmDeleteCategory(): void {
    if (!this.deletingCategory) {
      return;
    }

    this.categoryRepository.delete(this.deletingCategory.id);
    this.deletingCategory = null;
  }

  private syncUsedCategoryIds(): void {
    this.usedCategoryIds = new Set([
      ...this.transactionCategoryIds,
      ...this.budgetCategoryIds,
    ]);
  }

  private refreshSyncStatus(): void {
    const allTransactions = [...this.transactions, ...this.deletedTransactions];
    const syncedAtValues = [
      ...allTransactions.map((transaction) => transaction.syncedAt),
      ...this.budgets.map((budget) => budget.syncedAt),
      ...this.customCategories.map((category) => category.syncedAt),
    ].filter((value): value is string => !!value);

    this.pendingRecords =
      allTransactions.filter((transaction) => transaction.syncStatus === 'pending')
        .length +
      this.budgets.filter((budget) => budget.syncStatus === 'pending').length +
      this.customCategories.filter((category) => category.syncStatus === 'pending')
        .length;

    this.lastSyncedAt = syncedAtValues.length
      ? new Date(syncedAtValues.sort()[syncedAtValues.length - 1])
      : null;
  }
}
