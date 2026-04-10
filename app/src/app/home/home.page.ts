import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonToolbar } from '@ionic/angular/standalone';
import { Chart, DoughnutController, ArcElement, Tooltip } from 'chart.js';
import { AddTransactionComponent } from '../add-transaction/add-transaction.component';

Chart.register(DoughnutController, ArcElement, Tooltip);

interface Transaction {
  icon: string;
  iconVariant: 'indigo' | 'green' | 'amber' | 'red';
  name: string;
  date: string;
  amount: number;
}

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
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    AddTransactionComponent,
  ],
})
export class HomePage implements OnInit, AfterViewInit {
  @ViewChild('donutCanvas', { static: false })
  donutCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('addSheet') addSheet!: AddTransactionComponent;
  activeTab: 'home' | 'cards' | 'analytics' | 'profile' = 'home';

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
      iconVariant: 'indigo',
      name: 'Rent payment',
      date: 'Apr 1, 2026',
      amount: -1130,
    },
    {
      icon: '🛒',
      iconVariant: 'green',
      name: 'Whole Foods Market',
      date: 'Apr 3, 2026',
      amount: -84,
    },
    {
      icon: '💰',
      iconVariant: 'green',
      name: 'Salary deposit',
      date: 'Apr 5, 2026',
      amount: 4500,
    },
    {
      icon: '🚇',
      iconVariant: 'amber',
      name: 'Metro card top-up',
      date: 'Apr 6, 2026',
      amount: -40,
    },
    {
      icon: '🎬',
      iconVariant: 'red',
      name: 'Netflix subscription',
      date: 'Apr 7, 2026',
      amount: -15,
    },
    {
      icon: '💊',
      iconVariant: 'red',
      name: 'CVS Pharmacy',
      date: 'Apr 9, 2026',
      amount: -32,
    },
  ];

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

  setTab(tab: typeof this.activeTab): void {
    this.activeTab = tab;
  }

  formatAmount(amount: number): string {
    const abs = Math.abs(amount).toLocaleString('en-US');
    return amount < 0 ? `-$${abs}` : `+$${abs}`;
  }

  formatBalance(value: number): string {
    return `$${value.toLocaleString('en-US')}`;
  }

  onSheetClosed(): void {
    // Placeholder for any actions needed when the add transaction sheet is closed
  }

  onTransactionSaved(payload: any): void {
    // Placeholder for handling the saved transaction data
    console.log('Transaction saved:', payload);
  }
}
