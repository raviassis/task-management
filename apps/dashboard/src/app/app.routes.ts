import { Route } from '@angular/router';
import { authGuard } from './auth.guard';

export const appRoutes: Route[] = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then(m => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register').then(m => m.RegisterPage),
  },
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home').then(m => m.HomePage),
    canActivate: [authGuard],
  },
  {
    path: 'organizations/:organizationId',
    loadComponent: () => import('./pages/organization/organization').then(m => m.OrganizationPage),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: '' }
];
