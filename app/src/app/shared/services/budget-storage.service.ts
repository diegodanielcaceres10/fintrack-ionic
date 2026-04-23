import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Budget, SaveBudgetInput } from '../models/budget.model';

const STORAGE_KEY = 'fintrack.budgets.v1';

@Injectable({
  providedIn: 'root',
})
export class BudgetStorageService {
  private readonly initialBudgets = this.loadBudgets();
  private readonly budgetsSubject = new BehaviorSubject<Budget[]>(
    this.initialBudgets,
  );

  readonly budgets$ = this.budgetsSubject.asObservable();

  saveBudget(input: SaveBudgetInput): Budget {
    const now = new Date().toISOString();
    const current = this.budgetsSubject.value;
    const existing = current.find(
      (budget) =>
        budget.monthKey === input.monthKey &&
        budget.categoryId === input.categoryId,
    );

    if (existing) {
      const updatedBudget: Budget = {
        ...existing,
        limit: input.limit,
        updatedAt: now,
      };

      this.persist(
        current.map((budget) =>
          budget.id === existing.id ? updatedBudget : budget,
        ),
      );
      return updatedBudget;
    }

    const budget: Budget = {
      id: this.createId(),
      categoryId: input.categoryId,
      monthKey: input.monthKey,
      limit: input.limit,
      updatedAt: now,
    };

    this.persist([budget, ...current]);
    return budget;
  }

  deleteBudget(budgetId: string): void {
    this.persist(
      this.budgetsSubject.value.filter((budget) => budget.id !== budgetId),
    );
  }

  private loadBudgets(): Budget[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }

    try {
      return JSON.parse(raw) as Budget[];
    } catch {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }
  }

  private persist(budgets: Budget[]): void {
    this.budgetsSubject.next(budgets);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
    }
  }

  private createId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }

    return `budget-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
}
