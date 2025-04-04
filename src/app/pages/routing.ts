import { Routes } from '@angular/router';

const Routing: Routes = [
  {
    path: 'dashboard',
    loadChildren: () => {
      console.log("routing.ts: Cargando módulo de dashboard");
      return import('./dashboard/dashboard.module').then((m) => {
        console.log("routing.ts: Módulo de dashboard cargado correctamente");
        return m.DashboardModule;
      });
    },
  },
  {
    path: 'builder',
    loadChildren: () => import('./builder/builder.module').then((m) => m.BuilderModule),
  },
  {
    path: 'crafted/pages/profile',
    loadChildren: () => import('../modules/profile/profile.module').then((m) => m.ProfileModule),
    // data: { layout: 'light-sidebar' },
  },
  {
    path: 'balance',
    loadChildren: () => import('../modules/balance/balance.module').then((m) => m.BalanceModule),
    // data: { layout: 'dark-header' },
  },
  {
    path: 'accesos',
    loadChildren: () => import('../modules/access/access.module').then((m) => m.AccessModule),
  },
  {
    path: 'settings',
    loadChildren: () => import('../modules/settings/settings.module').then((m) => m.SettingsModule),
  },
  {
    path: 'crafted/pages/wizards',
    loadChildren: () => import('../modules/wizards/wizards.module').then((m) => m.WizardsModule),
    // data: { layout: 'light-header' },
  },
  {
    path: 'crafted/widgets',
    loadChildren: () => import('../modules/widgets-examples/widgets-examples.module').then((m) => m.WidgetsExamplesModule),
    // data: { layout: 'light-header' },
  },
  {
    path: 'apps/chat',
    loadChildren: () => import('../modules/apps/chat/chat.module').then((m) => m.ChatModule),
    // data: { layout: 'light-sidebar' },
  },
  {
    path: 'apps/users',
    loadChildren: () => import('./user/user.module').then((m) => m.UserModule),
  },
  {
    path: 'apps/roles',
    loadChildren: () => import('./role/role.module').then((m) => m.RoleModule),
  },
  {
    path: 'apps/permissions',
    loadChildren: () => import('./permission/permission.module').then((m) => m.PermissionModule),
  },
  {
    path: 'notifications',
    loadChildren: () => import('../modules/notifications/notifications.module').then((m) => m.NotificationsModule),
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'error/404',
  },
];

export { Routing };
