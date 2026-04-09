import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'ft-amount-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './amount-input.component.html',
  styleUrl: './amount-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FtAmountInputComponent {
  @Input() label = 'Monto';
  @Input() placeholder = '0.00';
  @Input() helperText = '';
  @Input() errorText = '';
  @Input() currencySymbol = '€';
  @Input() value: number | null = null;

  @Output() readonly valueChange = new EventEmitter<number | null>();

  protected readonly displayValue = signal('');
  protected readonly isFocused = signal(false);

  ngOnChanges(): void {
    this.displayValue.set(this.value === null ? '' : this.formatAmount(this.value));
  }

  protected handleInput(rawValue: string): void {
    const sanitized = rawValue.replace(/[^0-9.,]/g, '').replace(',', '.');
    this.displayValue.set(sanitized);

    const parsedValue = sanitized === '' ? null : Number(sanitized);
    const nextValue = Number.isNaN(parsedValue) ? null : parsedValue;

    this.value = nextValue;
    this.valueChange.emit(nextValue);
  }

  protected onBlur(): void {
    this.isFocused.set(false);
    this.displayValue.set(this.value === null ? '' : this.formatAmount(this.value));
  }

  protected onFocus(): void {
    this.isFocused.set(true);
  }

  private formatAmount(value: number): string {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
}
