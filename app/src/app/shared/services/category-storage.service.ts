import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import {
  BASE_CATEGORY_DEFINITIONS,
  CategoryDefinition,
  SaveCategoryInput,
} from '../models/category.model';

const STORAGE_KEY = 'fintrack.categories.v1';

@Injectable({
  providedIn: 'root',
})
export class CategoryStorageService {
  private readonly customCategoriesSubject = new BehaviorSubject<
    CategoryDefinition[]
  >(this.loadCustomCategories());

  readonly categories$ = new BehaviorSubject<CategoryDefinition[]>(
    this.mergeCategories(this.customCategoriesSubject.value),
  );

  saveCategory(input: SaveCategoryInput): CategoryDefinition {
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
    if (typeof localStorage === 'undefined') {
      return [];
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }

    try {
      return JSON.parse(raw) as CategoryDefinition[];
    } catch {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }
  }

  private persist(customCategories: CategoryDefinition[]): void {
    this.customCategoriesSubject.next(customCategories);
    this.categories$.next(this.mergeCategories(customCategories));

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customCategories));
    }
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
}
