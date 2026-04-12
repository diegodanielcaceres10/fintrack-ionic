import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss'],
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  /** Emoji icon displayed at the top */
  @Input() icon = '📭';

  /** Bold heading text */
  @Input() title = 'Nothing here';

  /** Muted subtitle text */
  @Input() subtitle?: string;

  /** Optional CTA button label — hidden if not provided */
  @Input() actionLabel?: string;

  /** Emits when the CTA button is tapped */
  @Output() actionClick = new EventEmitter<void>();
}
