import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppShellComponent } from '../../shared/components/app-shell/app-shell.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';

// ─── Types ───────────────────────────────────────────────────────────────────

export type SyncMode = 'manual' | 'daily' | 'automatic';
export type SyncState = 'idle' | 'syncing' | 'success' | 'error';

interface SyncOption {
  value: SyncMode;
  label: string;
  subtitle: string;
}

// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  host: {
    class: 'ion-page',
  },
  imports: [
    CommonModule,
    AppShellComponent, // replaces IonHeader + IonToolbar + IonContent + bottom-nav
    BadgeComponent, // pending count + synced checkmark badges
  ],
})
export class SettingsPage implements OnInit {
  // ── Sync mode ──────────────────────────────────────────────────────────────
  selectedSyncMode: SyncMode = 'daily';

  readonly syncOptions: SyncOption[] = [
    {
      value: 'manual',
      label: 'Manual',
      subtitle: 'Sync only when you tap the button',
    },
    {
      value: 'daily',
      label: 'Daily',
      subtitle: 'Syncs automatically once per day',
    },
    {
      value: 'automatic',
      label: 'Automatic',
      subtitle: 'Syncs in real time as changes happen',
    },
  ];

  setSyncMode(mode: SyncMode): void {
    this.selectedSyncMode = mode;
  }

  // ── Sync status ────────────────────────────────────────────────────────────
  lastSyncedAt = new Date(Date.now() - 1000 * 60 * 47); // 47 min ago
  pendingRecords = 3;
  syncState: SyncState = 'idle';

  get lastSyncLabel(): string {
    const diffMs = Date.now() - this.lastSyncedAt.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h ago`;
    return this.lastSyncedAt.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  syncNow(): void {
    if (this.syncState === 'syncing') return;
    this.syncState = 'syncing';

    setTimeout(() => {
      this.syncState = 'success';
      this.lastSyncedAt = new Date();
      this.pendingRecords = 0;
      setTimeout(() => {
        this.syncState = 'idle';
      }, 2500);
    }, 1800);
  }

  get syncBtnLabel(): string {
    switch (this.syncState) {
      case 'syncing':
        return 'Syncing…';
      case 'success':
        return 'All caught up';
      case 'error':
        return 'Retry sync';
      default:
        return 'Sync now';
    }
  }

  get syncBtnVariant(): string {
    switch (this.syncState) {
      case 'syncing':
        return 'btn-primary--syncing';
      case 'success':
        return 'btn-primary--success';
      case 'error':
        return 'btn-primary--danger';
      default:
        return '';
    }
  }

  // ── Account ────────────────────────────────────────────────────────────────
  readonly userEmail = 'alex.johnson@email.com';

  logout(): void {
    // TODO: connect to auth service
    console.log('logout');
  }

  ngOnInit(): void {}
}
