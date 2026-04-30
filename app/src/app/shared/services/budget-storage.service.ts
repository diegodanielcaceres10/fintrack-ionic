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
        syncStatus: 'pending',
        synced: false,
        syncedAt: null,
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
      syncStatus: 'pending',
      synced: false,
      syncedAt: null,
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

  markAllSynced(): void {
    const syncedAt = new Date().toISOString();
    this.persist(
      this.budgetsSubject.value.map((budget) => ({
        ...budget,
        syncStatus: 'synced',
        synced: true,
        syncedAt,
      })),
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
      return (JSON.parse(raw) as Partial<Budget>[]).map((budget) =>
        this.normalizeBudget(budget),
      );
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

  private normalizeBudget(raw: Partial<Budget>): Budget {
    return {
      id: raw.id ?? this.createId(),
      categoryId: raw.categoryId ?? 'other',
      monthKey: raw.monthKey ?? new Date().toISOString().slice(0, 7),
      limit: typeof raw.limit === 'number' ? raw.limit : 0,
      syncStatus: raw.synced === true ? 'synced' : raw.syncStatus ?? 'pending',
      synced: raw.synced ?? raw.syncStatus === 'synced',
      syncedAt: raw.syncedAt ?? null,
      updatedAt: raw.updatedAt ?? new Date().toISOString(),
    };
  }
}
