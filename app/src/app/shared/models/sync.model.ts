export type SyncStatus = 'synced' | 'pending';

export interface SyncMeta {
  syncStatus: SyncStatus;
  synced: boolean;
  syncedAt: string | null;
  updatedAt: string;
}
