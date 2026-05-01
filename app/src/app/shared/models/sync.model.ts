export type SyncStatus = 'synced' | 'pending';
export type SyncMode = 'manual' | 'daily' | 'automatic';
export type SyncState = 'idle' | 'syncing' | 'success' | 'error';

export interface SyncMeta {
  syncStatus: SyncStatus;
  synced: boolean;
  syncedAt: string | null;
  updatedAt: string;
}

export interface SyncSummary {
  pendingRecords: number;
  lastSyncedAt: Date | null;
  syncMode: SyncMode;
  syncState: SyncState;
}
