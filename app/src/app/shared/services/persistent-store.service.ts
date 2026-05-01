import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite } from '@capacitor-community/sqlite';

const DB_NAME = 'fintrack';
const STORAGE_PREFIX = 'fintrack.';
const TABLE_NAME = 'app_kv_store';

type StorageDriver = 'sqlite' | 'indexeddb' | 'localStorage';

@Injectable({
  providedIn: 'root',
})
export class PersistentStoreService {
  private readonly cache = new Map<string, string>();
  private initPromise?: Promise<void>;
  private driver: StorageDriver = 'localStorage';

  async init(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = this.initialize();
    }

    return this.initPromise;
  }

  getJsonSync<T>(key: string, fallback: T): T {
    const raw = this.cache.get(key);
    if (!raw) {
      return fallback;
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  async setJson<T>(key: string, value: T): Promise<void> {
    await this.init();
    const raw = JSON.stringify(value);
    this.cache.set(key, raw);

    if (this.driver === 'sqlite' || this.driver === 'indexeddb') {
      await CapacitorSQLite.run({
        database: DB_NAME,
        statement: `INSERT OR REPLACE INTO ${TABLE_NAME} (storage_key, storage_value) VALUES (?, ?);`,
        values: [key, raw],
      });
      if (this.driver === 'indexeddb') {
        await CapacitorSQLite.saveToStore({ database: DB_NAME });
      }
      return;
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, raw);
    }
  }

  async remove(key: string): Promise<void> {
    await this.init();
    this.cache.delete(key);

    if (this.driver === 'sqlite' || this.driver === 'indexeddb') {
      await CapacitorSQLite.run({
        database: DB_NAME,
        statement: `DELETE FROM ${TABLE_NAME} WHERE storage_key = ?;`,
        values: [key],
      });
      if (this.driver === 'indexeddb') {
        await CapacitorSQLite.saveToStore({ database: DB_NAME });
      }
      return;
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  }

  getDriver(): StorageDriver {
    return this.driver;
  }

  private async initialize(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        await this.initSQLite();
        this.driver = 'sqlite';
        return;
      } catch (error) {
        console.warn('SQLite init failed, falling back to localStorage.', error);
      }
    }

    if (Capacitor.getPlatform() === 'web') {
      try {
        await this.initIndexedDb();
        this.driver = 'indexeddb';
        return;
      } catch (error) {
        console.warn('IndexedDB SQLite init failed, falling back to localStorage.', error);
      }
    }

    this.driver = 'localStorage';
    this.initLocalStorage();
  }

  private initLocalStorage(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    this.cache.clear();
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key || !key.startsWith(STORAGE_PREFIX)) {
        continue;
      }

      const value = localStorage.getItem(key);
      if (value !== null) {
        this.cache.set(key, value);
      }
    }
  }

  private async initSQLite(): Promise<void> {
    this.cache.clear();
    await this.openAndHydrate();
  }

  private async initIndexedDb(): Promise<void> {
    this.cache.clear();
    await CapacitorSQLite.initWebStore();
    await this.openAndHydrate();
  }

  private async openAndHydrate(): Promise<void> {
    await CapacitorSQLite.createConnection({
      database: DB_NAME,
      version: 1,
      encrypted: false,
      mode: 'no-encryption',
      readonly: false,
    });

    await CapacitorSQLite.open({ database: DB_NAME, readonly: false });
    await CapacitorSQLite.execute({
      database: DB_NAME,
      statements: `
        CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
          storage_key TEXT PRIMARY KEY NOT NULL,
          storage_value TEXT NOT NULL
        );
      `,
    });

    const result = await CapacitorSQLite.query({
      database: DB_NAME,
      statement: `SELECT storage_key, storage_value FROM ${TABLE_NAME};`,
    });

    for (const row of result.values ?? []) {
      const key = String(row.storage_key ?? '');
      const value = String(row.storage_value ?? '');
      if (key) {
        this.cache.set(key, value);
      }
    }
  }
}
