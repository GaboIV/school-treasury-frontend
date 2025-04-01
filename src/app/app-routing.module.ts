import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './modules/auth/services/auth.guard';
import { RoleGuard } from './modules/auth/services/role.guard';
import { UserRole } from './modules/auth/services/role.service';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'error',
    loadChildren: () =>
      import('./modules/errors/errors.module').then((m) => m.ErrorsModule),
  },
  {
    path: 'apps',
    loadChildren: () =>
      import('./modules/apps-store/apps-store.module').then((m) => m.AppsStoreModule),
  },
  {
    path: '',
    canActivate: [
      AuthGuard,
      RoleGuard
    ],
    data: {
      roles: [
        UserRole.Administrator,
        UserRole.Representative
      ]
    },
    loadChildren: () => {
      console.log("app-routing: Cargando módulo de layout");
      return import('./_metronic/layout/layout.module').then((m) => {
        console.log("app-routing: Módulo de layout cargado correctamente");
        return m.LayoutModule;
      });
    },
  },
  {
    path: '**',
    redirectTo: 'error/404',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: false,
    paramsInheritanceStrategy: 'always'
  })],
  exports: [RouterModule],
})
export class AppRoutingModule {
  constructor() {
    console.log("AppRoutingModule: Inicializado con rutas:", routes);
  }
}
