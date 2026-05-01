import { Injectable } from '@angular/core';

import { Budget, SaveBudgetInput } from '../models/budget.model';
import { BudgetStorageService } from '../services/budget-storage.service';

@Injectable({
  providedIn: 'root',
})
export class BudgetRepository {
  readonly budgets$ = this.budgetStorage.budgets$;

  constructor(private readonly budgetStorage: BudgetStorageService) {}

  save(input: SaveBudgetInput): Budget {
    return this.budgetStorage.saveBudget(input);
  }

  delete(budgetId: string): void {
    this.budgetStorage.deleteBudget(budgetId);
  }

  markAllSynced(): void {
    this.budgetStorage.markAllSynced();
  }
}
