import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, DoughnutController, ArcElement, Tooltip } from 'chart.js';
import { Subscription } from 'rxjs';

import { AppShellComponent } from '../../shared/components/app-shell/app-shell.component';
import { ListRowComponent } from '../../shared/components/list-row/list-row.component';
import {
  Transaction,
  TransactionCategoryMeta,
} from '../../shared/models/transaction.model';
import { CategoryStorageService } from '../../shared/services/category-storage.service';
import { TransactionStorageService } from '../../shared/services/transaction-storage.service';

Chart.register(DoughnutController, ArcElement, Tooltip);

interface CategoryStat {
  name: string;
  color: string;
  percentage: number;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  host: {
    class: 'ion-page',
  },
  imports: [CommonModule, AppShellComponent, ListRowComponent],
})
export class HomePage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('donutCanvas', { static: false })
  donutCanvas!: ElementRef<HTMLCanvasElement>;

  private transactionsSubscription?: Subscription;
  private categoriesSubscription?: Subscription;
  private donutChart?: Chart;
  private categoryMeta: Record<string, TransactionCategoryMeta> = {};
  private allTransactions: Transaction[] = [];

  constructor(
    private readonly transactionStorage: TransactionStorageService,
    private readonly categoryStorage: CategoryStorageService,
  ) {
    this.categoryMeta = this.categoryStorage.getCategoryMap();
  }

  balance = 0;
  monthlySpend = 0;

  categories: CategoryStat[] = [];

  transactions: Transaction[] = [];

  ngOnInit(): void {
    this.categoriesSubscription = this.categoryStorage.categories$.subscribe(
      (categories) => {
        this.categoryMeta = categories.reduce<Record<string, TransactionCategoryMeta>>(
          (acc, category) => {
            acc[category.id] = category;
            return acc;
          },
          {},
        );
        this.categories = this.buildCategoryStats(
          this.currentMonthTransactions(this.allTransactions).filter(
            (txn) => txn.type === 'expense',
          ),
        );
        this.updateDonutChart();
      },
    );

    this.transactionsSubscription = this.transactionStorage.transactions$.subscribe(
      (transactions) => {
        this.allTransactions = transactions;
        this.transactions = [...transactions]
          .sort((a, b) => this.sortTransactionsByRecency(a, b))
          .slice(0, 6);

        const currentMonthTransactions = this.currentMonthTransactions(
          transactions,
        );
        const monthlyExpenses = currentMonthTransactions.filter(
          (txn) => txn.type === 'expense',
        );

        this.monthlySpend = Math.abs(
          monthlyExpenses.reduce((sum, txn) => sum + txn.amount, 0),
        );

        this.balance = transactions.reduce((sum, txn) => sum + txn.amount, 0);
        this.categories = this.buildCategoryStats(monthlyExpenses);
        this.updateDonutChart();
      },
    );
  }

  ngAfterViewInit(): void {
    this.initDonutChart();
    this.updateDonutChart();
  }

  private initDonutChart(): void {
    const ctx = this.donutCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.donutChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        datasets: [
          {
            data: this.categories.map((c) => c.percentage),
            backgroundColor: this.categories.map((c) => c.color),
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: false,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
        },
        animation: { animateRotate: true, duration: 800 },
      },
    });
  }

  private updateDonutChart(): void {
    if (!this.donutChart) {
      return;
    }

    this.donutChart.data.datasets[0].data = this.categories.map(
      (category) => category.percentage,
    );
    this.donutChart.data.datasets[0].backgroundColor = this.categories.map(
      (category) => category.color,
    );
    this.donutChart.update();
  }

  private currentMonthTransactions(transactions: Transaction[]): Transaction[] {
    const now = new Date();

    return transactions.filter((txn) => {
      const date = new Date(txn.date);
      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
      );
    });
  }

  private buildCategoryStats(transactions: Transaction[]): CategoryStat[] {
    if (transactions.length === 0) {
      return [
        {
          name: 'No spending yet',
          color: '#6B7280',
          percentage: 100,
        },
      ];
    }

    const totals = new Map<string, number>();
    for (const transaction of transactions) {
      const nextValue =
        (totals.get(transaction.category) ?? 0) + Math.abs(transaction.amount);
      totals.set(transaction.category, nextValue);
    }

    const totalSpent = Array.from(totals.values()).reduce(
      (sum, amount) => sum + amount,
      0,
    );

    return Array.from(totals.entries())
      .map(([categoryId, amount]) => ({
        name: this.categoryMeta[categoryId]?.label ?? categoryId,
        color: this.categoryMeta[categoryId]?.color ?? '#6B7280',
        percentage: Math.max(1, Math.round((amount / totalSpent) * 100)),
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5);
  }

  private sortTransactionsByRecency(a: Transaction, b: Transaction): number {
    const updatedDiff =
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();

    if (updatedDiff !== 0) {
      return updatedDiff;
    }

    return b.date.localeCompare(a.date);
  }

  chartAriaLabel(): string {
    return `Spending by category: ${this.categories
      .map((category) => `${category.name} ${category.percentage}%`)
      .join(', ')}`;
  }

  ngOnDestroy(): void {
    this.categoriesSubscription?.unsubscribe();
    this.transactionsSubscription?.unsubscribe();
    this.donutChart?.destroy();
  }

  formatAmount(amount: number): string {
    const abs = Math.abs(amount).toLocaleString('en-US');
    return amount < 0 ? `-$${abs}` : `+$${abs}`;
  }

  formatBalance(value: number): string {
    return `$${value.toLocaleString('en-US')}`;
  }

  amountVariant(amount: number): 'income' | 'expense' {
    return amount > 0 ? 'income' : 'expense';
  }

  iconFor(txn: Transaction): string {
    return this.categoryMeta[txn.category]?.icon ?? '🏷️';
  }

  iconBgFor(txn: Transaction): string {
    return this.categoryMeta[txn.category]?.bg ?? '#F8F9FB';
  }

  formattedDate(txn: Transaction): string {
    return new Date(txn.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
