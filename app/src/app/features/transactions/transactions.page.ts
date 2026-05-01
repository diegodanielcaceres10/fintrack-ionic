import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { IonActionSheet, IonAlert } from '@ionic/angular/standalone';

import { AppShellComponent } from '../../shared/components/app-shell/app-shell.component';
import { GroupHeaderComponent } from '../../shared/components/group-header/group-header.component';
import { ListRowComponent } from '../../shared/components/list-row/list-row.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { AddTransactionComponent } from '../add-transaction/add-transaction.component';
import { CategoryRepository } from '../../shared/repositories/category.repository';
import { TransactionRepository } from '../../shared/repositories/transaction.repository';
import { GroupTotalPipe, PositiveTotalPipe } from './transaction.pipes';
import { SyncStatus } from '../../shared/models/sync.model';
import {
  CreateTransactionInput,
  Transaction,
  TransactionCategoryMeta,
} from '../../shared/models/transaction.model';

export type FilterPill = 'all' | 'expenses' | 'income';

export interface TransactionGroup {
  label: string;
  date: Date;
  items: Transaction[];
}

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.page.html',
  styleUrls: ['./transactions.page.scss'],
  standalone: true,
  host: {
    class: 'ion-page',
  },
  imports: [
    CommonModule,
    FormsModule,
    IonActionSheet,
    IonAlert,
    AppShellComponent,
    GroupHeaderComponent,
    ListRowComponent,
    EmptyStateComponent,
    BadgeComponent,
    AddTransactionComponent,
    GroupTotalPipe,
    PositiveTotalPipe,
  ],
})
export class TransactionsPage implements OnInit, OnDestroy {
  private transactionsSubscription?: Subscription;
  private categoriesSubscription?: Subscription;
  private allTransactions: Transaction[] = [];

  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {
    this.categoryMeta = this.categoryRepository.getCategoryMap();
  }

  searchQuery = '';
  activeFilter: FilterPill = 'all';

  readonly months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  selectedMonth = new Date().getMonth();

  readonly filterAction = {
    label: 'Filter',
    icon: 'M3 6h18M7 12h10M11 18h2',
    variant: 'icon-only' as const,
  };

  categoryMeta: Record<string, TransactionCategoryMeta> = {};
  editingTransaction: Transaction | null = null;
  pendingDeleteTransaction: Transaction | null = null;
  actionMenuTransaction: Transaction | null = null;

  readonly deleteAlertButtons = [
    {
      text: 'Cancel',
      role: 'cancel',
    },
    {
      text: 'Delete',
      role: 'destructive',
      handler: () => this.confirmDelete(),
    },
  ];

  readonly actionSheetButtons = [
    {
      text: 'Edit',
      handler: () => this.editFromActionMenu(),
    },
    {
      text: 'Delete',
      role: 'destructive',
      handler: () => this.deleteFromActionMenu(),
    },
    {
      text: 'Cancel',
      role: 'cancel',
    },
  ];

  get groups(): TransactionGroup[] {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const filtered = this.allTransactions.filter((txn) => {
      const txnDate = new Date(txn.date);
      const matchesMonth = txnDate.getMonth() === this.selectedMonth;
      const matchesFilter =
        this.activeFilter === 'all'
          ? true
          : this.activeFilter === 'expenses'
            ? txn.type === 'expense'
            : txn.type === 'income';
      const q = this.searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        txn.name.toLowerCase().includes(q) ||
        this.categoryMeta[txn.category].label.toLowerCase().includes(q);

      return matchesMonth && matchesFilter && matchesSearch;
    });

    const map = new Map<string, Transaction[]>();
    for (const txn of filtered) {
      const key = new Date(txn.date).toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(txn);
    }

    return Array.from(map.entries())
      .map(([key, items]) => {
        const date = new Date(key);
        let label: string;
        if (date.toDateString() === today.toDateString()) label = 'Today';
        else if (date.toDateString() === yesterday.toDateString()) {
          label = 'Yesterday';
        } else {
          label = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });
        }

        return { label, date, items };
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  formatAmount(amount: number): string {
    const abs = Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: amount % 1 !== 0 ? 2 : 0,
      maximumFractionDigits: 2,
    });
    return amount < 0 ? `-$${abs}` : `+$${abs}`;
  }

  amountVariant(amount: number): 'income' | 'expense' {
    return amount > 0 ? 'income' : 'expense';
  }

  syncVariant(status: SyncStatus): 'success' | 'warning' {
    return status === 'synced' ? 'success' : 'warning';
  }

  groupVariant(items: Transaction[]): 'success' | 'danger' {
    const total = items.reduce((sum, item) => sum + item.amount, 0);
    return total >= 0 ? 'success' : 'danger';
  }

  setFilter(filter: FilterPill): void {
    this.activeFilter = filter;
  }

  setMonth(monthIndex: number): void {
    this.selectedMonth = monthIndex;
  }

  startEdit(transaction: Transaction): void {
    this.editingTransaction = transaction;
  }

  closeEditSheet(): void {
    this.editingTransaction = null;
  }

  saveEditedTransaction(payload: CreateTransactionInput): void {
    if (!this.editingTransaction) {
      return;
    }

    this.transactionRepository.update(this.editingTransaction.id, payload);
    this.closeEditSheet();
  }

  onDeleteClick(event: Event, transaction: Transaction): void {
    event.stopPropagation();
    this.pendingDeleteTransaction = transaction;
  }

  onMenuClick(event: Event, transaction: Transaction): void {
    event.stopPropagation();
    this.actionMenuTransaction = transaction;
  }

  closeActionMenu(): void {
    this.actionMenuTransaction = null;
  }

  actionSheetHeader(): string {
    return this.actionMenuTransaction?.name ?? 'Transaction actions';
  }

  closeDeleteAlert(): void {
    this.pendingDeleteTransaction = null;
  }

  deleteAlertMessage(): string {
    if (!this.pendingDeleteTransaction) {
      return '';
    }

    return `Delete "${this.pendingDeleteTransaction.name}"? This transaction will be removed from the list and marked as pending sync.`;
  }

  private confirmDelete(): void {
    if (!this.pendingDeleteTransaction) {
      return;
    }

    this.transactionRepository.softDelete(this.pendingDeleteTransaction.id);
    this.pendingDeleteTransaction = null;
  }

  private editFromActionMenu(): void {
    if (!this.actionMenuTransaction) {
      return;
    }

    this.editingTransaction = this.actionMenuTransaction;
    this.actionMenuTransaction = null;
  }

  private deleteFromActionMenu(): void {
    if (!this.actionMenuTransaction) {
      return;
    }

    this.pendingDeleteTransaction = this.actionMenuTransaction;
    this.actionMenuTransaction = null;
  }

  trackByGroup(_: number, group: TransactionGroup): string {
    return `${group.label}-${group.date.toISOString()}`;
  }

  trackByTxn(_: number, transaction: Transaction): string {
    return transaction.id;
  }

  ngOnInit(): void {
    this.categoriesSubscription = this.categoryRepository.categories$.subscribe(
      (categories) => {
        this.categoryMeta = categories.reduce<Record<string, TransactionCategoryMeta>>(
          (acc, category) => {
            acc[category.id] = category;
            return acc;
          },
          {},
        );
      },
    );

    this.transactionsSubscription = this.transactionRepository.transactions$.subscribe(
      (transactions) => {
        this.allTransactions = transactions;
      },
    );
  }

  ngOnDestroy(): void {
    this.categoriesSubscription?.unsubscribe();
    this.transactionsSubscription?.unsubscribe();
  }
}
