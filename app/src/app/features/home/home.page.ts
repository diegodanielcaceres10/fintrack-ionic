import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, DoughnutController, ArcElement, Tooltip } from 'chart.js';

import { AppShellComponent } from '../../shared/components/app-shell/app-shell.component';
import { ListRowComponent } from '../../shared/components/list-row/list-row.component';

Chart.register(DoughnutController, ArcElement, Tooltip);

// ─── Types ───────────────────────────────────────────────────────────────────

interface Transaction {
  icon: string;
  iconBg: string;
  name: string;
  date: string;
  amount: number;
}

interface CategoryStat {
  name: string;
  color: string;
  percentage: number;
}

// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  host: {
    class: 'ion-page',
  },
  imports: [
    CommonModule,
    AppShellComponent, // replaces IonHeader + IonToolbar + BottomNavComponent
    ListRowComponent, // replaces .txn-item markup
  ],
})
export class HomePage implements OnInit, AfterViewInit {
  @ViewChild('donutCanvas', { static: false })
  donutCanvas!: ElementRef<HTMLCanvasElement>;

  // ── Data ──────────────────────────────────────────────────────────────────

  balance = 12840;
  monthlySpend = 3240;

  categories: CategoryStat[] = [
    { name: 'Housing', color: '#4F46E5', percentage: 35 },
    { name: 'Food', color: '#818CF8', percentage: 22 },
    { name: 'Transport', color: '#34D399', percentage: 18 },
    { name: 'Entertainment', color: '#FBBF24', percentage: 14 },
    { name: 'Health', color: '#F87171', percentage: 11 },
  ];

  transactions: Transaction[] = [
    {
      icon: '🏠',
      iconBg: '#EEF2FF',
      name: 'Rent payment',
      date: 'Apr 1, 2026',
      amount: -1130,
    },
    {
      icon: '🛒',
      iconBg: '#F0FDF4',
      name: 'Whole Foods Market',
      date: 'Apr 3, 2026',
      amount: -84,
    },
    {
      icon: '💰',
      iconBg: '#F0FDF4',
      name: 'Salary deposit',
      date: 'Apr 5, 2026',
      amount: 4500,
    },
    {
      icon: '🚇',
      iconBg: '#FFFBEB',
      name: 'Metro card top-up',
      date: 'Apr 6, 2026',
      amount: -40,
    },
    {
      icon: '🎬',
      iconBg: '#FFF1F2',
      name: 'Netflix subscription',
      date: 'Apr 7, 2026',
      amount: -15,
    },
    {
      icon: '💊',
      iconBg: '#FFF1F2',
      name: 'CVS Pharmacy',
      date: 'Apr 9, 2026',
      amount: -32,
    },
  ];

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {}

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

  // ── Handlers ──────────────────────────────────────────────────────────────

  onTransactionSaved(payload: unknown): void {
    console.log('Transaction saved:', payload);
    // TODO: push to your data service
  }

  // ── Formatters ────────────────────────────────────────────────────────────

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
}
