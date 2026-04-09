import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'ft-balance-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './balance-card.component.html',
  styleUrl: './balance-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FtBalanceCardComponent {
  @Input({ required: true }) income = 0;
  @Input({ required: true }) expense = 0;
  @Input() currencyCode = 'EUR';
  @Input() locale = 'es-ES';

  protected get total(): number {
    return this.income - this.expense;
  }
}
