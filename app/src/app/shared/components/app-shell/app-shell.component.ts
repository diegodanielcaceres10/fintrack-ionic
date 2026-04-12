import {
  Component,
  Input,
  Output,
  EventEmitter,
  ContentChild,
  TemplateRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonContent } from '@ionic/angular/standalone';

import { BottomNavComponent, NavTab } from '../bottom-nav/bottom-nav.component';
import { AddTransactionComponent } from '../../../add-transaction/add-transaction.component';

// ─── Shell action descriptor ──────────────────────────────────────────────────
// Each page passes an optional action object to render a button in the header.

export interface ShellAction {
  label: string; // button text — e.g. "Add bill"
  icon?: string; // optional SVG path for a leading icon
  variant:
    | 'ghost' // border + accent color (default)
    | 'icon-only'; // square icon button, no text
}

// ─── Route → tab mapping ──────────────────────────────────────────────────────
const ROUTE_TAB_MAP: Record<string, NavTab> = {
  '/home': 'home',
  '/transactions': 'cards',
  '/budget': 'analytics',
  '/bills': 'cards',
  '/settings': 'profile',
};

// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-shell',
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonContent,
    BottomNavComponent,
    AddTransactionComponent,
  ],
})
export class AppShellComponent {
  // ── Header inputs ─────────────────────────────────────────────────────────

  /** Page title shown in the toolbar */
  @Input() title = '';

  /**
   * Optional greeting mode — replaces the plain title with
   * "Good morning / Good afternoon / Good evening, {name}"
   */
  @Input() greeting?: string; // pass user's first name

  /** Show the avatar + notification dot (dashboard style) */
  @Input() showAvatar = false;

  /** User initials for the avatar */
  @Input() avatarInitials = '';

  /** Whether to show the notification dot on the avatar */
  @Input() hasNotification = false;

  // ── Header action ─────────────────────────────────────────────────────────

  /** Optional action button descriptor */
  @Input() action?: ShellAction;

  /** Emits when the header action button is tapped */
  @Output() actionClick = new EventEmitter<void>();

  // ── Content projection ────────────────────────────────────────────────────

  /**
   * Optional custom header slot — project additional toolbar content
   * (search bars, month selectors, filter pills, etc.)
   * Usage: <ng-template appShellSubheader>...</ng-template>
   */
  @ContentChild('subheader') subheaderTpl?: TemplateRef<unknown>;

  // ── ion-content ───────────────────────────────────────────────────────────

  /** Passed through to ion-content [fullscreen] */
  @Input() fullscreen = true;

  // ── FAB / add transaction sheet ───────────────────────────────────────────

  showAddSheet = false;

  openAddSheet(): void {
    this.showAddSheet = true;
  }
  closeAddSheet(): void {
    this.showAddSheet = false;
  }

  // ── Bottom nav ────────────────────────────────────────────────────────────

  get activeTab(): NavTab {
    const path = this.router.url.split('?')[0]; // strip query params
    return ROUTE_TAB_MAP[path] ?? 'home';
  }

  onTabChange(tab: NavTab): void {
    const routeMap: Record<NavTab, string> = {
      home: '/home',
      cards: '/transactions',
      analytics: '/budget',
      profile: '/settings',
    };
    this.router.navigateByUrl(routeMap[tab]);
  }

  // ── Greeting helper ───────────────────────────────────────────────────────

  get greetingPrefix(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }

  constructor(private readonly router: Router) {}
}
