import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type ListRowAmountVariant = 'default' | 'income' | 'expense';

@Component({
  selector: 'app-list-row',
  templateUrl: './list-row.component.html',
  styleUrls: ['./list-row.component.scss'],
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListRowComponent {
  /** Emoji or text shown in the icon container */
  @Input() icon = '';

  /** Optional tint color for the icon background (hex or CSS var) */
  @Input() iconBg?: string;

  /** Primary row label */
  @Input() name = '';

  /** Secondary line below the name (date, category, subtitle…) */
  @Input() sub?: string;

  /** Formatted amount string — e.g. "-$84" or "+$4,500". Pass pre-formatted. */
  @Input() amount?: string;

  /** Controls amount text color */
  @Input() amountVariant: ListRowAmountVariant = 'default';

  /** Reduced opacity — used for paid/completed items */
  @Input() muted = false;

  /** Makes the row interactive (hover state + pointer cursor) */
  @Input() interactive = false;

  /** Emits when the row is clicked (only when interactive = true) */
  @Output() rowClick = new EventEmitter<void>();

  onClick(): void {
    if (this.interactive) this.rowClick.emit();
  }
}
