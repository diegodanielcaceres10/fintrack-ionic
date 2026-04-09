import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'ft-progress-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FtProgressBarComponent {
  @Input() label = 'Budget';
  @Input() value = 0;
  @Input() limit = 0;

  protected get percent(): number {
    if (!this.limit) {
      return 0;
    }

    return Math.round((this.value / this.limit) * 100);
  }

  protected get progressWidth(): number {
    return Math.min(this.percent, 100);
  }

  protected get tone(): 'normal' | 'warning' | 'danger' {
    if (this.percent > 100) {
      return 'danger';
    }

    if (this.percent > 80) {
      return 'warning';
    }

    return 'normal';
  }
}
