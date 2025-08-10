import { Route } from '@angular/router';
import { authGuard } from './auth.guard';

export const appRoutes: Route[] = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then(m => m.LoginPage),
  },
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home').then(m => m.HomePage),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: '' }
];
