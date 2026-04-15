import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AppShellComponent } from '../../shared/components/app-shell/app-shell.component';
import { GroupHeaderComponent } from '../../shared/components/group-header/group-header.component';
import { ListRowComponent } from '../../shared/components/list-row/list-row.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { GroupTotalPipe, PositiveTotalPipe } from './transaction.pipes';

// ─── Types ───────────────────────────────────────────────────────────────────

export type TransactionType = 'expense' | 'income';
export type SyncStatus = 'synced' | 'pending';
export type TransactionCategory =
  | 'housing'
  | 'food'
  | 'transport'
  | 'entertainment'
  | 'health'
  | 'salary'
  | 'shopping'
  | 'utilities'
  | 'travel'
  | 'other';

export type FilterPill = 'all' | 'expenses' | 'income';

export interface Transaction {
  id: string;
  name: string;
  category: TransactionCategory;
  date: Date;
  amount: number;
  type: TransactionType;
  syncStatus: SyncStatus;
}

export interface TransactionGroup {
  label: string;
  date: Date;
  items: Transaction[];
}

interface CategoryMeta {
  label: string;
  icon: string;
  bg: string;
  color: string;
}

// ─────────────────────────────────────────────────────────────────────────────

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
    AppShellComponent, // replaces IonHeader + IonToolbar + IonContent + bottom-nav
    GroupHeaderComponent, // replaces .day-header markup
    ListRowComponent, // replaces .txn-row markup
    EmptyStateComponent, // replaces inline empty-state markup
    BadgeComponent, // for sync status indicator
    GroupTotalPipe,
    PositiveTotalPipe,
  ],
})
export class TransactionsPage implements OnInit {
  // ── Filter state ───────────────────────────────────────────────────────────
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

  // ── Shell action — icon-only filter button ─────────────────────────────────
  readonly filterAction = {
    label: 'Filter',
    icon: 'M3 6h18M7 12h10M11 18h2',
    variant: 'icon-only' as const,
  };

  // ── Category meta ──────────────────────────────────────────────────────────
  readonly categoryMeta: Record<TransactionCategory, CategoryMeta> = {
    housing: { label: 'Housing', icon: '🏠', bg: '#EEF2FF', color: '#4F46E5' },
    food: { label: 'Food', icon: '🛒', bg: '#F0FDF4', color: '#16A34A' },
    transport: {
      label: 'Transport',
      icon: '🚇',
      bg: '#FFFBEB',
      color: '#D97706',
    },
    entertainment: {
      label: 'Entertainment',
      icon: '🎬',
      bg: '#FFF1F2',
      color: '#E11D48',
    },
    health: { label: 'Health', icon: '💊', bg: '#FFF1F2', color: '#E11D48' },
    salary: { label: 'Salary', icon: '💰', bg: '#F0FDF4', color: '#16A34A' },
    shopping: {
      label: 'Shopping',
      icon: '🛍️',
      bg: '#FDF4FF',
      color: '#9333EA',
    },
    utilities: {
      label: 'Utilities',
      icon: '⚡',
      bg: '#FFFBEB',
      color: '#D97706',
    },
    travel: { label: 'Travel', icon: '✈️', bg: '#EFF6FF', color: '#2563EB' },
    other: { label: 'Other', icon: '📦', bg: '#F8F9FB', color: '#6B7280' },
  };

  // ── Mock data ──────────────────────────────────────────────────────────────
  private readonly allTransactions: Transaction[] = [
    {
      id: 't01',
      name: 'Whole Foods Market',
      category: 'food',
      date: new Date(2026, 3, 10),
      amount: -84,
      type: 'expense',
      syncStatus: 'synced',
    },
    {
      id: 't02',
      name: 'Uber ride',
      category: 'transport',
      date: new Date(2026, 3, 10),
      amount: -12.5,
      type: 'expense',
      syncStatus: 'pending',
    },
    {
      id: 't03',
      name: 'Freelance payment',
      category: 'salary',
      date: new Date(2026, 3, 10),
      amount: 850,
      type: 'income',
      syncStatus: 'synced',
    },
    {
      id: 't04',
      name: 'CVS Pharmacy',
      category: 'health',
      date: new Date(2026, 3, 9),
      amount: -32,
      type: 'expense',
      syncStatus: 'synced',
    },
    {
      id: 't05',
      name: 'Amazon order',
      category: 'shopping',
      date: new Date(2026, 3, 9),
      amount: -67.99,
      type: 'expense',
      syncStatus: 'pending',
    },
    {
      id: 't06',
      name: 'Electric bill',
      category: 'utilities',
      date: new Date(2026, 3, 9),
      amount: -110,
      type: 'expense',
      syncStatus: 'synced',
    },
    {
      id: 't07',
      name: 'Netflix',
      category: 'entertainment',
      date: new Date(2026, 3, 8),
      amount: -15,
      type: 'expense',
      syncStatus: 'synced',
    },
    {
      id: 't08',
      name: 'Flight to Madrid',
      category: 'travel',
      date: new Date(2026, 3, 8),
      amount: -340,
      type: 'expense',
      syncStatus: 'pending',
    },
    {
      id: 't09',
      name: 'Spotify',
      category: 'entertainment',
      date: new Date(2026, 3, 8),
      amount: -9.99,
      type: 'expense',
      syncStatus: 'synced',
    },
    {
      id: 't10',
      name: 'Metro card top-up',
      category: 'transport',
      date: new Date(2026, 3, 7),
      amount: -40,
      type: 'expense',
      syncStatus: 'synced',
    },
    {
      id: 't11',
      name: 'Salary deposit',
      category: 'salary',
      date: new Date(2026, 3, 7),
      amount: 4500,
      type: 'income',
      syncStatus: 'synced',
    },
    {
      id: 't12',
      name: 'Gym membership',
      category: 'health',
      date: new Date(2026, 3, 5),
      amount: -45,
      type: 'expense',
      syncStatus: 'synced',
    },
    {
      id: 't13',
      name: 'Zara',
      category: 'shopping',
      date: new Date(2026, 3, 5),
      amount: -129,
      type: 'expense',
      syncStatus: 'pending',
    },
    {
      id: 't14',
      name: 'Rent payment',
      category: 'housing',
      date: new Date(2026, 3, 3),
      amount: -1130,
      type: 'expense',
      syncStatus: 'synced',
    },
    {
      id: 't15',
      name: 'Side project income',
      category: 'salary',
      date: new Date(2026, 3, 3),
      amount: 200,
      type: 'income',
      syncStatus: 'synced',
    },
  ];

  // ── Derived ────────────────────────────────────────────────────────────────
  get groups(): TransactionGroup[] {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const filtered = this.allTransactions.filter((txn) => {
      const matchesMonth = txn.date.getMonth() === this.selectedMonth;
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
      const key = txn.date.toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(txn);
    }

    return Array.from(map.entries())
      .map(([key, items]) => {
        const date = new Date(key);
        let label: string;
        if (date.toDateString() === today.toDateString()) label = 'Today';
        else if (date.toDateString() === yesterday.toDateString())
          label = 'Yesterday';
        else
          label = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });
        return { label, date, items };
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
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
    const total = items.reduce((s, t) => s + t.amount, 0);
    return total >= 0 ? 'success' : 'danger';
  }

  setFilter(f: FilterPill): void {
    this.activeFilter = f;
  }
  setMonth(i: number): void {
    this.selectedMonth = i;
  }

  trackByGroup(_: number, g: TransactionGroup): string {
    return g.label;
  }
  trackByTxn(_: number, t: Transaction): string {
    return t.id;
  }

  ngOnInit(): void {}
}
