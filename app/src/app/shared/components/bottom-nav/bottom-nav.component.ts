import {
  Component,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonRouterLinkWithHref } from '@ionic/angular/standalone';

// ─── Component ───────────────────────────────────────────────────────────────
// Navigation is now driven entirely by Angular Router:
//   - RouterLink        handles clicks + navigation
//   - RouterLinkActive  applies .nav-item--active automatically
//   - No @Input() activeTab, no manual isActive(), no tabChange @Output()
// The only remaining @Output is fabTap — the FAB has no route of its own.

@Component({
  selector: 'app-bottom-nav',
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.scss'],
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IonRouterLinkWithHref],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomNavComponent {
  /** Emits when the center FAB (+) is tapped — parent opens the add-transaction sheet */
  @Output() fabTap = new EventEmitter<void>();

  onFabClick(): void {
    this.fabTap.emit();
  }
}
