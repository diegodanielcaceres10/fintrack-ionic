import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'notice'
  | 'accent'
  | 'neutral';
export type BadgeSize = 'sm' | 'md';

@Component({
  selector: 'app-badge',
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss'],
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent {
  /** Semantic color variant */
  @Input() variant: BadgeVariant = 'neutral';

  /** Text or number to display — leave empty to use ng-content instead */
  @Input() label?: string | number;

  /** Size: sm (18px) or md (22px — default) */
  @Input() size: BadgeSize = 'md';

  /** Show a checkmark icon before the label */
  @Input() check = false;
}
