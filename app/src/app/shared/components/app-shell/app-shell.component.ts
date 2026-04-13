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
import { IonHeader, IonToolbar, IonContent } from '@ionic/angular/standalone';

import { BottomNavComponent } from '../bottom-nav/bottom-nav.component';
import { AddTransactionComponent } from '../../../features/add-transaction/add-transaction.component';

export interface ShellAction {
  label: string;
  icon?: string;
  variant: 'ghost' | 'icon-only';
}

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
  @Input() title = '';
  @Input() greeting?: string;
  @Input() showAvatar = false;
  @Input() avatarInitials = '';
  @Input() hasNotification = false;

  // ── Header action ─────────────────────────────────────────────────────────
  @Input() action?: ShellAction;
  @Output() actionClick = new EventEmitter<void>();

  // ── Subheader slot ────────────────────────────────────────────────────────
  @ContentChild('subheader') subheaderTpl?: TemplateRef<unknown>;

  // ── ion-content ───────────────────────────────────────────────────────────
  @Input() fullscreen = true;

  // ── Add transaction sheet ─────────────────────────────────────────────────
  showAddSheet = false;

  openAddSheet(): void {
    this.showAddSheet = true;
  }
  closeAddSheet(): void {
    this.showAddSheet = false;
  }

  // ── Greeting ──────────────────────────────────────────────────────────────
  get greetingPrefix(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }
}
