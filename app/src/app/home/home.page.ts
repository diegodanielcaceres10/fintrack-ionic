import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

import { FtAmountInputComponent } from '../shared/components/amount-input/amount-input.component';
import { FtBalanceCardComponent } from '../shared/components/balance-card/balance-card.component';
import { FtButtonComponent } from '../shared/components/button/button.component';
import { FtCardComponent } from '../shared/components/card/card.component';
import { FtProgressBarComponent } from '../shared/components/progress-bar/progress-bar.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    FtButtonComponent,
    FtCardComponent,
    FtAmountInputComponent,
    FtBalanceCardComponent,
    FtProgressBarComponent,
  ],
})
export class HomePage {
  protected readonly amount = signal<number | null>(1240.75);
  protected readonly syncStatus = signal<'pending' | 'synced' | 'error'>('pending');

  protected setAmount(value: number | null): void {
    this.amount.set(value);
  }

  protected markSynced(): void {
    this.syncStatus.set('synced');
  }
}
