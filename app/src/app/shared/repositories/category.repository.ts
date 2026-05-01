import { Injectable } from '@angular/core';

import {
  CategoryDefinition,
  SaveCategoryInput,
} from '../models/category.model';
import { CategoryStorageService } from '../services/category-storage.service';

@Injectable({
  providedIn: 'root',
})
export class CategoryRepository {
  readonly categories$ = this.categoryStorage.categories$;
  readonly customCategories$ = this.categoryStorage.customCategories$;

  constructor(private readonly categoryStorage: CategoryStorageService) {}

  save(input: SaveCategoryInput): CategoryDefinition {
    return this.categoryStorage.saveCategory(input);
  }

  delete(categoryId: string): void {
    this.categoryStorage.deleteCategory(categoryId);
  }

  markAllCustomSynced(): void {
    this.categoryStorage.markAllCustomSynced();
  }

  getCategoryMap(): Record<string, CategoryDefinition> {
    return this.categoryStorage.getCategoryMap();
  }
}
