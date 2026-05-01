import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import {
  BASE_CATEGORY_DEFINITIONS,
  CategoryDefinition,
  SaveCategoryInput,
} from '../models/category.model';
import { PersistentStoreService } from './persistent-store.service';

const STORAGE_KEY = 'fintrack.categories.v1';

@Injectable({
  providedIn: 'root',
})
export class CategoryStorageService {
  private readonly customCategoriesSubject = new BehaviorSubject<
    CategoryDefinition[]
  >([]);

  readonly customCategories$ = this.customCategoriesSubject.asObservable();
  readonly categories$ = new BehaviorSubject<CategoryDefinition[]>(
    Object.values(BASE_CATEGORY_DEFINITIONS),
  );

  constructor(private readonly persistentStore: PersistentStoreService) {
    const initialCustomCategories = this.loadCustomCategories();
    this.customCategoriesSubject.next(initialCustomCategories);
    this.categories$.next(this.mergeCategories(initialCustomCategories));
  }

  saveCategory(input: SaveCategoryInput): CategoryDefinition {
    const now = new Date().toISOString();
    const nowId = `cat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const fallbackId = this.slugify(input.label) || nowId;
    const nextCategory: CategoryDefinition = {
      id: input.id ?? fallbackId,
      label: input.label.trim(),
      icon: input.icon.trim() || '🏷️',
      color: input.color,
      bg: this.buildTint(input.color),
      type: input.type,
      isSystem: false,
      syncStatus: 'pending',
      synced: false,
      syncedAt: null,
      updatedAt: now,
    };

    const currentCustom = this.customCategoriesSubject.value;
    const existingIndex = currentCustom.findIndex(
      (category) => category.id === nextCategory.id,
    );

    const nextCustom =
      existingIndex >= 0
        ? currentCustom.map((category, index) =>
            index === existingIndex ? nextCategory : category,
          )
        : [...currentCustom, nextCategory];

    this.persist(nextCustom);
    return nextCategory;
  }

  deleteCategory(categoryId: string): void {
    if (BASE_CATEGORY_DEFINITIONS[categoryId]) {
      return;
    }

    this.persist(
      this.customCategoriesSubject.value.filter(
        (category) => category.id !== categoryId,
      ),
    );
  }

  markAllCustomSynced(): void {
    const syncedAt = new Date().toISOString();
    this.persist(
      this.customCategoriesSubject.value.map((category) => ({
        ...category,
        syncStatus: 'synced',
        synced: true,
        syncedAt,
      })),
    );
  }

  getCategoryMap(): Record<string, CategoryDefinition> {
    return this.categories$.value.reduce<Record<string, CategoryDefinition>>(
      (acc, category) => {
        acc[category.id] = category;
        return acc;
      },
      {},
    );
  }

  private loadCustomCategories(): CategoryDefinition[] {
    return this.persistentStore
      .getJsonSync<Partial<CategoryDefinition>[]>(STORAGE_KEY, [])
      .map((category) => this.normalizeCustomCategory(category));
  }

  private persist(customCategories: CategoryDefinition[]): void {
    this.customCategoriesSubject.next(customCategories);
    this.categories$.next(this.mergeCategories(customCategories));
    void this.persistentStore.setJson(STORAGE_KEY, customCategories);
  }

  private mergeCategories(
    customCategories: CategoryDefinition[],
  ): CategoryDefinition[] {
    return [
      ...Object.values(BASE_CATEGORY_DEFINITIONS),
      ...customCategories.filter(
        (category) => !BASE_CATEGORY_DEFINITIONS[category.id],
      ),
    ];
  }

  private buildTint(color: string): string {
    return `${color}1A`;
  }

  private slugify(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private normalizeCustomCategory(
    raw: Partial<CategoryDefinition>,
  ): CategoryDefinition {
    const color = raw.color ?? '#6B7280';

    return {
      id: raw.id ?? `cat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      label: raw.label?.trim() || 'Custom category',
      icon: raw.icon?.trim() || '🏷️',
      color,
      bg: raw.bg ?? this.buildTint(color),
      type: raw.type ?? 'expense',
      isSystem: false,
      syncStatus: raw.synced === true ? 'synced' : raw.syncStatus ?? 'pending',
      synced: raw.synced ?? raw.syncStatus === 'synced',
      syncedAt: raw.syncedAt ?? null,
      updatedAt: raw.updatedAt ?? new Date().toISOString(),
    };
  }
}
