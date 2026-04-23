import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { IonActionSheet, IonAlert } from '@ionic/angular/standalone';

import { AppShellComponent } from '../../shared/components/app-shell/app-shell.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { Budget } from '../../shared/models/budget.model';
import { CategoryDefinition } from '../../shared/models/category.model';
import {
  Transaction,
  TransactionCategory,
} from '../../shared/models/transaction.model';
import { BudgetStorageService } from '../../shared/services/budget-storage.service';
import { CategoryStorageService } from '../../shared/services/category-storage.service';
import { TransactionStorageService } from '../../shared/services/transaction-storage.service';

interface BudgetView {
  id: string;
  categoryId: TransactionCategory;
  icon: string;
  name: string;
  spent: number;
  limit: number;
}

export type UsageLevel = 'safe' | 'warning' | 'danger';

@Component({
  selector: 'app-budget',
  templateUrl: './budget.page.html',
  styleUrls: ['./budget.page.scss'],
  standalone: true,
  host: {
    class: 'ion-page',
  },
  imports: [
    CommonModule,
    IonActionSheet,
    IonAlert,
    AppShellComponent,
    EmptyStateComponent,
  ],
})
export class BudgetPage implements OnInit, OnDestroy {
  readonly addAction = {
    label: 'Add budget',
    icon: 'M12 5V19M5 12H19',
    variant: 'ghost' as const,
  };

  private readonly today = new Date();
  private budgetsSubscription?: Subscription;
  private transactionsSubscription?: Subscription;
  private categoriesSubscription?: Subscription;
  private budgets: Budget[] = [];
  private transactions: Transaction[] = [];
  private categories: CategoryDefinition[] = [];
  private categoryMeta: Record<string, CategoryDefinition> = {};

  currentDate = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
  budgetItems: BudgetView[] = [];

  categoryPickerOpen = false;
  pendingDeleteBudget: BudgetView | null = null;
  budgetFormOpen = false;
  budgetFormCategoryId: TransactionCategory | null = null;
  budgetFormCategoryLabel = '';
  budgetFormLimit = '';
  budgetFormMode: 'create' | 'edit' = 'create';

  readonly deleteAlertButtons = [
    {
      text: 'Cancel',
      role: 'cancel',
    },
    {
      text: 'Delete',
      role: 'destructive',
      handler: () => this.confirmDeleteBudget(),
    },
  ];

  get monthLabel(): string {
    return this.currentDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }

  get isCurrentMonth(): boolean {
    return (
      this.currentDate.getFullYear() === this.today.getFullYear() &&
      this.currentDate.getMonth() === this.today.getMonth()
    );
  }

  get categoryActionButtons() {
    return [
      ...this.availableBudgetCategories.map((categoryId) => ({
        text: this.categoryMeta[categoryId]?.label ?? categoryId,
        handler: () => this.openBudgetForm(categoryId),
      })),
      {
        text: 'Cancel',
        role: 'cancel' as const,
      },
    ];
  }

  get availableBudgetCategories(): TransactionCategory[] {
    return this.categories
      .filter((category) => category.type !== 'income')
      .map((category) => category.id)
      .sort((a, b) =>
        (this.categoryMeta[a]?.label ?? a).localeCompare(
          this.categoryMeta[b]?.label ?? b,
        ),
      );
  }

  get budgetFormButtons() {
    return [
      {
        text: 'Cancel',
        role: 'cancel' as const,
        handler: () => this.closeBudgetForm(),
      },
      {
        text: this.budgetFormMode === 'edit' ? 'Save' : 'Add',
        handler: (value: { limit?: string }) => this.submitBudgetForm(value),
      },
    ];
  }

  constructor(
    private readonly budgetStorage: BudgetStorageService,
    private readonly transactionStorage: TransactionStorageService,
    private readonly categoryStorage: CategoryStorageService,
  ) {
    this.categoryMeta = this.categoryStorage.getCategoryMap();
    this.categories = Object.values(this.categoryMeta);
  }

  prevMonth(): void {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() - 1,
      1,
    );
    this.rebuildBudgetItems();
  }

  nextMonth(): void {
    if (this.isCurrentMonth) return;

    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1,
      1,
    );
    this.rebuildBudgetItems();
  }

  openCreateBudget(): void {
    this.categoryPickerOpen = true;
  }

  closeCategoryPicker(): void {
    this.categoryPickerOpen = false;
  }

  openEditBudget(budget: BudgetView): void {
    this.openBudgetForm(budget.categoryId, budget);
  }

  askDeleteBudget(event: Event, budget: BudgetView): void {
    event.stopPropagation();
    this.pendingDeleteBudget = budget;
  }

  closeDeleteAlert(): void {
    this.pendingDeleteBudget = null;
  }

  deleteAlertMessage(): string {
    if (!this.pendingDeleteBudget) {
      return '';
    }

    return `Delete the ${this.pendingDeleteBudget.name} budget for ${this.monthLabel}?`;
  }

  pct(cat: BudgetView): number {
    if (cat.limit <= 0) return 0;
    return Math.min(Math.round((cat.spent / cat.limit) * 100), 100);
  }

  level(cat: BudgetView): UsageLevel {
    const p = this.pct(cat);
    if (p >= 85) return 'danger';
    if (p >= 60) return 'warning';
    return 'safe';
  }

  progressVariant(cat: BudgetView): 'success' | 'warning' | 'danger' {
    const l = this.level(cat);
    return l === 'safe' ? 'success' : l;
  }

  formatMoney(value: number): string {
    return `$${value.toLocaleString('en-US')}`;
  }

  get totalSpent(): number {
    return this.budgetItems.reduce((sum, item) => sum + item.spent, 0);
  }

  get totalLimit(): number {
    return this.budgetItems.reduce((sum, item) => sum + item.limit, 0);
  }

  get totalPct(): number {
    if (this.totalLimit <= 0) return 0;
    return Math.min(Math.round((this.totalSpent / this.totalLimit) * 100), 100);
  }

  get remaining(): number {
    return this.totalLimit - this.totalSpent;
  }

  get totalLevel(): UsageLevel {
    if (this.totalLimit <= 0) return 'safe';

    const totalUsage = this.totalPct;
    if (totalUsage >= 85) return 'danger';
    if (totalUsage >= 60) return 'warning';
    return 'safe';
  }

  get totalProgressVariant(): 'success' | 'warning' | 'danger' {
    return this.totalLevel === 'safe' ? 'success' : this.totalLevel;
  }

  trackById(_: number, cat: BudgetView): string {
    return cat.id;
  }

  ngOnInit(): void {
    this.categoriesSubscription = this.categoryStorage.categories$.subscribe(
      (categories) => {
        this.categories = categories;
        this.categoryMeta = categories.reduce<Record<string, CategoryDefinition>>(
          (acc, category) => {
            acc[category.id] = category;
            return acc;
          },
          {},
        );
        this.rebuildBudgetItems();
      },
    );

    this.budgetsSubscription = this.budgetStorage.budgets$.subscribe((budgets) => {
      this.budgets = budgets;
      this.rebuildBudgetItems();
    });

    this.transactionsSubscription = this.transactionStorage.transactions$.subscribe(
      (transactions) => {
        this.transactions = transactions;
        this.rebuildBudgetItems();
      },
    );
  }

  ngOnDestroy(): void {
    this.categoriesSubscription?.unsubscribe();
    this.budgetsSubscription?.unsubscribe();
    this.transactionsSubscription?.unsubscribe();
  }

  private openBudgetForm(
    categoryId: TransactionCategory,
    existingBudget?: BudgetView,
  ): void {
    const budgetToEdit =
      existingBudget ??
      this.budgetItems.find((budget) => budget.categoryId === categoryId);

    this.categoryPickerOpen = false;
    this.budgetFormCategoryId = categoryId;
    this.budgetFormCategoryLabel = this.categoryMeta[categoryId]?.label ?? categoryId;
    this.budgetFormMode = budgetToEdit ? 'edit' : 'create';
    this.budgetFormLimit = budgetToEdit ? String(budgetToEdit.limit) : '';
    this.budgetFormOpen = true;
  }

  closeBudgetForm(): void {
    this.budgetFormOpen = false;
    this.budgetFormCategoryId = null;
    this.budgetFormCategoryLabel = '';
    this.budgetFormLimit = '';
  }

  private submitBudgetForm(value: { limit?: string }): boolean {
    if (!this.budgetFormCategoryId) {
      return false;
    }

    const parsedLimit = Number(value.limit);
    if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) {
      return false;
    }

    this.budgetStorage.saveBudget({
      categoryId: this.budgetFormCategoryId,
      monthKey: this.monthKey(this.currentDate),
      limit: parsedLimit,
    });
    this.closeBudgetForm();
    return true;
  }

  private confirmDeleteBudget(): void {
    if (!this.pendingDeleteBudget) {
      return;
    }

    this.budgetStorage.deleteBudget(this.pendingDeleteBudget.id);
    this.pendingDeleteBudget = null;
  }

  private rebuildBudgetItems(): void {
    const monthKey = this.monthKey(this.currentDate);
    const monthBudgets = this.budgets.filter((budget) => budget.monthKey === monthKey);
    const monthTransactions = this.transactions.filter((transaction) => {
      const date = new Date(transaction.date);
      return (
        transaction.type === 'expense' &&
        date.getFullYear() === this.currentDate.getFullYear() &&
        date.getMonth() === this.currentDate.getMonth()
      );
    });

    this.budgetItems = monthBudgets
      .map((budget) => {
        const spent = Math.abs(
          monthTransactions
            .filter((transaction) => transaction.category === budget.categoryId)
            .reduce((sum, transaction) => sum + transaction.amount, 0),
        );

        return {
          id: budget.id,
          categoryId: budget.categoryId,
          icon: this.categoryMeta[budget.categoryId]?.icon ?? '🏷️',
          name: this.categoryMeta[budget.categoryId]?.label ?? budget.categoryId,
          spent,
          limit: budget.limit,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  private monthKey(date: Date): string {
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    return `${date.getFullYear()}-${month}`;
  }
}
