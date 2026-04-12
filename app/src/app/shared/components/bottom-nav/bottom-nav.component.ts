import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

// ─── Types ───────────────────────────────────────────────────────────────────

export type NavTab = 'home' | 'cards' | 'analytics' | 'profile';

export interface NavItem {
  id: NavTab;
  label: string;
  // SVG path data — keeps the component self-contained, no external icon lib needed
  path: string;
  type: 'fill' | 'stroke'; // whether the SVG uses fill or stroke
}

// ─── Component ───────────────────────────────────────────────────────────────

@Component({
  selector: 'app-bottom-nav',
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.scss'],
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomNavComponent {
  /** Currently active tab — drives active state and dot indicator */
  @Input() activeTab: NavTab = 'home';

  /** Emits the tab id when the user taps a nav item */
  @Output() tabChange = new EventEmitter<NavTab>();

  /** Emits when the center FAB (+) is tapped */
  @Output() fabTap = new EventEmitter<void>();

  // ── Nav items definition ──────────────────────────────────────────────────
  readonly navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      type: 'fill',
      path: 'M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z',
    },
    {
      id: 'cards',
      label: 'Cards',
      type: 'stroke',
      path: '', // uses a dedicated template slot — see HTML
    },
    {
      id: 'analytics',
      label: 'Analytics',
      type: 'stroke',
      path: 'M3 3H10V10H3V3ZM14 3H21V10H14V3ZM3 14H10V21H3V14ZM14 14H21V21H14V14Z',
    },
    {
      id: 'profile',
      label: 'Profile',
      type: 'stroke',
      path: '', // uses a dedicated template slot — see HTML
    },
  ];

  // ── Helpers ───────────────────────────────────────────────────────────────

  isActive(id: NavTab): boolean {
    return this.activeTab === id;
  }

  onTabClick(id: NavTab): void {
    this.tabChange.emit(id);
  }

  onFabClick(): void {
    this.fabTap.emit();
  }

  trackById(_: number, item: NavItem): string {
    return item.id;
  }
}
