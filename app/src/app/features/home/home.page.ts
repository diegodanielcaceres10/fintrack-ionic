import {
  AfterViewInit,
  Component,
  ElementRef,
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
  TRANSACTION_CATEGORIES,
} from '../../shared/models/transaction.model';
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
export class HomePage implements OnInit, AfterViewInit {
  @ViewChild('donutCanvas', { static: false })
  donutCanvas!: ElementRef<HTMLCanvasElement>;

  private transactionsSubscription?: Subscription;

  constructor(
    private readonly transactionStorage: TransactionStorageService,
  ) {}

  balance = 12840;
  monthlySpend = 3240;

  categories: CategoryStat[] = [
    { name: 'Housing', color: '#4F46E5', percentage: 35 },
    { name: 'Food', color: '#818CF8', percentage: 22 },
    { name: 'Transport', color: '#34D399', percentage: 18 },
    { name: 'Entertainment', color: '#FBBF24', percentage: 14 },
    { name: 'Health', color: '#F87171', percentage: 11 },
  ];

  transactions: Transaction[] = [];

  ngOnInit(): void {
    this.transactionsSubscription = this.transactionStorage.transactions$.subscribe(
      (transactions) => {
        this.transactions = [...transactions]
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 6);

        const monthlyTransactions = transactions.filter((txn) => {
          const date = new Date(txn.date);
          return (
            date.getFullYear() === 2026 &&
            date.getMonth() === 3 &&
            txn.type === 'expense'
          );
        });

        this.monthlySpend = Math.abs(
          monthlyTransactions.reduce((sum, txn) => sum + txn.amount, 0),
        );

        const netBalance = transactions.reduce((sum, txn) => sum + txn.amount, 0);
        this.balance = 12840 + netBalance;
      },
    );
  }

  ngAfterViewInit(): void {
    this.initDonutChart();
  }

  private initDonutChart(): void {
    const ctx = this.donutCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
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
    return TRANSACTION_CATEGORIES[txn.category].icon;
  }

  iconBgFor(txn: Transaction): string {
    return TRANSACTION_CATEGORIES[txn.category].bg;
  }

  formattedDate(txn: Transaction): string {
    return new Date(txn.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
