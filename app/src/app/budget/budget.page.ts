import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonToolbar } from '@ionic/angular/standalone';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BudgetCategory {
  id: string;
  icon: string;
  name: string;
  spent: number;
  limit: number;
}

export type UsageLevel = 'safe' | 'warning' | 'danger';

// ─── Component ───────────────────────────────────────────────────────────────

@Component({
  selector: 'app-budget',
  templateUrl: './budget.page.html',
  styleUrls: ['./budget.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonToolbar],
})
export class BudgetPage implements OnInit {
  // ── Nav state ──────────────────────────────────────────────────────────────
  activeTab: 'home' | 'cards' | 'analytics' | 'profile' = 'analytics';

  // ── Month navigation ───────────────────────────────────────────────────────
  private readonly today = new Date();
  currentDate = new Date(this.today.getFullYear(), this.today.getMonth(), 1);

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

  prevMonth(): void {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() - 1,
      1,
    );
  }

  nextMonth(): void {
    if (this.isCurrentMonth) return;
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1,
      1,
    );
  }

  // ── Mock budget data ───────────────────────────────────────────────────────
  readonly categories: BudgetCategory[] = [
    { id: 'housing', icon: '🏠', name: 'Housing', spent: 1130, limit: 1200 },
    { id: 'food', icon: '🛒', name: 'Food', spent: 480, limit: 600 },
    { id: 'transport', icon: '🚇', name: 'Transport', spent: 95, limit: 160 },
    {
      id: 'entertainment',
      icon: '🎬',
      name: 'Entertainment',
      spent: 78,
      limit: 90,
    },
    { id: 'health', icon: '💊', name: 'Health', spent: 32, limit: 150 },
    { id: 'shopping', icon: '🛍️', name: 'Shopping', spent: 197, limit: 230 },
    { id: 'utilities', icon: '⚡', name: 'Utilities', spent: 110, limit: 130 },
    { id: 'travel', icon: '✈️', name: 'Travel', spent: 340, limit: 400 },
    { id: 'savings', icon: '🏦', name: 'Savings', spent: 200, limit: 500 },
    { id: 'other', icon: '📦', name: 'Other', spent: 58, limit: 100 },
  ];

  // ── Derived helpers ────────────────────────────────────────────────────────
  pct(cat: BudgetCategory): number {
    return Math.min(Math.round((cat.spent / cat.limit) * 100), 100);
  }

  level(cat: BudgetCategory): UsageLevel {
    const p = this.pct(cat);
    if (p >= 85) return 'danger';
    if (p >= 60) return 'warning';
    return 'safe';
  }

  formatMoney(value: number): string {
    return `$${value.toLocaleString('en-US')}`;
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  get totalSpent(): number {
    return this.categories.reduce((s, c) => s + c.spent, 0);
  }
  get totalLimit(): number {
    return this.categories.reduce((s, c) => s + c.limit, 0);
  }
  get totalPct(): number {
    return Math.min(Math.round((this.totalSpent / this.totalLimit) * 100), 100);
  }
  get totalLevel(): UsageLevel {
    return this.level({
      id: '',
      icon: '',
      name: '',
      spent: this.totalSpent,
      limit: this.totalLimit,
    });
  }
  get remaining(): number {
    return this.totalLimit - this.totalSpent;
  }

  // ── Nav ────────────────────────────────────────────────────────────────────
  setTab(t: typeof this.activeTab): void {
    this.activeTab = t;
  }

  ngOnInit(): void {}
}
