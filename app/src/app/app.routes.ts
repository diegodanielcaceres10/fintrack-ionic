import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'transactions',
    loadComponent: () =>
      import('./transactions/transactions.page').then(
        (m) => m.TransactionsPage,
      ),
  },
  {
    path: 'budget',
    loadComponent: () =>
      import('./budget/budget.page').then((m) => m.BudgetPage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
