import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonFooter,
  IonHeader,
  IonToolbar,
} from '@ionic/angular/standalone';

import { AddTransactionComponent } from '../../../features/add-transaction/add-transaction.component';
import { BottomNavComponent } from '../bottom-nav/bottom-nav.component';

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
    IonFooter,
    BottomNavComponent,
    AddTransactionComponent,
  ],
})
export class AppShellComponent {
  @Input() title = '';
  @Input() greeting?: string;
  @Input() showAvatar = false;
  @Input() avatarInitials = '';
  @Input() hasNotification = false;

  @Input() action?: ShellAction;
  @Output() actionClick = new EventEmitter<void>();

  @ContentChild('subheader') subheaderTpl?: TemplateRef<unknown>;

  @Input() fullscreen = true;

  showAddSheet = false;

  openAddSheet(): void {
    this.showAddSheet = true;
  }

  closeAddSheet(): void {
    this.showAddSheet = false;
  }

  get greetingPrefix(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }
}
