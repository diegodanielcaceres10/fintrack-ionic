import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type GroupHeaderVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'notice'
  | 'accent'
  | 'neutral';

@Component({
  selector: 'app-group-header',
  templateUrl: './group-header.component.html',
  styleUrls: ['./group-header.component.scss'],
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupHeaderComponent {
  /** Text label shown next to the dot */
  @Input() label = '';

  /** Dot and accent color */
  @Input() variant: GroupHeaderVariant = 'neutral';

  /** Optional count shown on the right (e.g. number of items) */
  @Input() count?: number;

  /** Optional total amount shown on the right instead of count */
  @Input() total?: number;

  /** Whether total should be colored as income (positive) */
  @Input() totalPositive = false;

  get showTotal(): boolean {
    return this.total !== undefined;
  }
  get showCount(): boolean {
    return !this.showTotal && this.count !== undefined;
  }

  formatTotal(v: number): string {
    const abs = Math.abs(v).toLocaleString('en-US', {
      minimumFractionDigits: v % 1 !== 0 ? 2 : 0,
      maximumFractionDigits: 2,
    });
    return v < 0 ? `-$${abs}` : `+$${abs}`;
  }
}
