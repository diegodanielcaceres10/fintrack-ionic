import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ft-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FtButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'ghost' | 'danger' = 'primary';
  @Input() size: 'md' | 'lg' = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() expand: 'block' | 'inline' = 'inline';

  @Output() readonly buttonClick = new EventEmitter<MouseEvent>();

  protected onClick(event: MouseEvent): void {
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    this.buttonClick.emit(event);
  }
}
