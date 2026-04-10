import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonToolbar } from '@ionic/angular/standalone';

// ─── Types ───────────────────────────────────────────────────────────────────

export type SyncMode = 'manual' | 'daily' | 'automatic';
export type SyncState = 'idle' | 'syncing' | 'success' | 'error';

interface SyncOption {
  value: SyncMode;
  label: string;
  subtitle: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonToolbar],
})
export class SettingsPage implements OnInit {
  // ── Nav ────────────────────────────────────────────────────────────────────
  activeTab: 'home' | 'cards' | 'analytics' | 'profile' = 'profile';

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

    // Simulate async sync
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

  // ── Account ────────────────────────────────────────────────────────────────
  readonly userEmail = 'alex.johnson@email.com';

  logout(): void {
    // Hook up to your auth service
    console.log('logout');
  }

  // ── Nav ────────────────────────────────────────────────────────────────────
  setTab(t: typeof this.activeTab): void {
    this.activeTab = t;
  }

  ngOnInit(): void {}
}
