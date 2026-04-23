import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { IonAlert } from '@ionic/angular/standalone';

import { AppShellComponent } from '../../shared/components/app-shell/app-shell.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { CategorySheetComponent } from '../../shared/components/category-sheet/category-sheet.component';
import {
  CategoryDefinition,
  SaveCategoryInput,
} from '../../shared/models/category.model';
import { BudgetStorageService } from '../../shared/services/budget-storage.service';
import { CategoryStorageService } from '../../shared/services/category-storage.service';
import { TransactionStorageService } from '../../shared/services/transaction-storage.service';

// ─── Types ───────────────────────────────────────────────────────────────────

export type SyncMode = 'manual' | 'daily' | 'automatic';
export type SyncState = 'idle' | 'syncing' | 'success' | 'error';

interface SyncOption {
  value: SyncMode;
  label: string;
  subtitle: string;
}

// ─────────────────────────────────────────────────────────────────────────────

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
    AppShellComponent, // replaces IonHeader + IonToolbar + IonContent + bottom-nav
    BadgeComponent, // pending count + synced checkmark badges
    CategorySheetComponent,
  ],
})
export class SettingsPage implements OnInit, OnDestroy {
  private categoriesSubscription?: Subscription;
  private transactionsSubscription?: Subscription;
  private budgetsSubscription?: Subscription;
  private transactionCategoryIds: string[] = [];
  private budgetCategoryIds: string[] = [];
  private usedCategoryIds = new Set<string>();

  constructor(
    private readonly categoryStorage: CategoryStorageService,
    private readonly transactionStorage: TransactionStorageService,
    private readonly budgetStorage: BudgetStorageService,
  ) {}

  // ── Sync mode ──────────────────────────────────────────────────────────────
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

  setSyncMode(mode: SyncMode): void {
    this.selectedSyncMode = mode;
  }

  // ── Sync status ────────────────────────────────────────────────────────────
  lastSyncedAt = new Date(Date.now() - 1000 * 60 * 47); // 47 min ago
  pendingRecords = 3;
  syncState: SyncState = 'idle';

  get lastSyncLabel(): string {
    const diffMs = Date.now() - this.lastSyncedAt.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h ago`;
    return this.lastSyncedAt.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  syncNow(): void {
    if (this.syncState === 'syncing') return;
    this.syncState = 'syncing';

    setTimeout(() => {
      this.syncState = 'success';
      this.lastSyncedAt = new Date();
      this.pendingRecords = 0;
      setTimeout(() => {
        this.syncState = 'idle';
      }, 2500);
    }, 1800);
  }

  get syncBtnLabel(): string {
    switch (this.syncState) {
      case 'syncing':
        return 'Syncing…';
      case 'success':
        return 'All caught up';
      case 'error':
        return 'Retry sync';
      default:
        return 'Sync now';
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

  // ── Account ────────────────────────────────────────────────────────────────
  readonly userEmail = 'alex.johnson@email.com';

  categories: CategoryDefinition[] = [];
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

  logout(): void {
    // TODO: connect to auth service
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
    this.categoryStorage.saveCategory(input);
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

  canDeleteCategory(category: CategoryDefinition): boolean {
    return !category.isSystem && !this.usedCategoryIds.has(category.id);
  }

  ngOnInit(): void {
    this.categoriesSubscription = this.categoryStorage.categories$.subscribe(
      (categories) => {
        this.categories = [...categories].sort((a, b) => {
          if (a.isSystem !== b.isSystem) {
            return a.isSystem ? -1 : 1;
          }

          return a.label.localeCompare(b.label);
        });
      },
    );

    this.transactionsSubscription = this.transactionStorage.transactions$.subscribe(
      (transactions) => {
        this.transactionCategoryIds = transactions.map(
          (transaction) => transaction.category,
        );
        this.syncUsedCategoryIds();
      },
    );

    this.budgetsSubscription = this.budgetStorage.budgets$.subscribe((budgets) => {
      this.budgetCategoryIds = budgets.map((budget) => budget.categoryId);
      this.syncUsedCategoryIds();
    });
  }

  ngOnDestroy(): void {
    this.categoriesSubscription?.unsubscribe();
    this.transactionsSubscription?.unsubscribe();
    this.budgetsSubscription?.unsubscribe();
  }

  private confirmDeleteCategory(): void {
    if (!this.deletingCategory) {
      return;
    }

    this.categoryStorage.deleteCategory(this.deletingCategory.id);
    this.deletingCategory = null;
  }

  private syncUsedCategoryIds(): void {
    this.usedCategoryIds = new Set([
      ...this.transactionCategoryIds,
      ...this.budgetCategoryIds,
    ]);
  }
}
