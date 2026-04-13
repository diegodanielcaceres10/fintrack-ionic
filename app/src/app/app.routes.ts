import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'transactions',
    loadComponent: () =>
      import('./features/transactions/transactions.page').then(
        (m) => m.TransactionsPage,
      ),
  },
  {
    path: 'budget',
    loadComponent: () =>
      import('./features/budget/budget.page').then((m) => m.BudgetPage),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./settings/settings.page').then((m) => m.SettingsPage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
