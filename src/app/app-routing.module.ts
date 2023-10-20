import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DefaultLayoutComponent } from './containers';
import { Page404Component } from './views/pages/page404/page404.component';
import { Page500Component } from './views/pages/page500/page500.component';
import { LoginComponent } from './views/pages/login/login.component';
import { RegisterComponent } from './views/pages/register/register.component';

import { authGuard } from './auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    data: {
      title: 'Home'
    },
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./views/dashboard/dashboard.module').then((m) => m.DashboardModule),
        canActivate: [authGuard],
      },
      {
        path: 'theme',
        loadChildren: () =>
          import('./views/theme/theme.module').then((m) => m.ThemeModule),
        canActivate: [authGuard],
      },
      {
        path: 'base',
        loadChildren: () =>
          import('./views/base/base.module').then((m) => m.BaseModule),
        canActivate: [authGuard],
      },
      {
        path: 'buttons',
        loadChildren: () =>
          import('./views/buttons/buttons.module').then((m) => m.ButtonsModule),
        canActivate: [authGuard],
      },
      {
        path: 'forms',
        loadChildren: () =>
          import('./views/forms/forms.module').then((m) => m.CoreUIFormsModule),
        canActivate: [authGuard],
      },
      {
        path: 'charts',
        loadChildren: () =>
          import('./views/charts/charts.module').then((m) => m.ChartsModule),
        canActivate: [authGuard],
      },
      {
        path: 'icons',
        loadChildren: () =>
          import('./views/icons/icons.module').then((m) => m.IconsModule),
        canActivate: [authGuard],
      },
      {
        path: 'notifications',
        loadChildren: () =>
          import('./views/notifications/notifications.module').then((m) => m.NotificationsModule),
        canActivate: [authGuard],
      },
      {
        path: 'widgets',
        loadChildren: () =>
          import('./views/widgets/widgets.module').then((m) => m.WidgetsModule),
        canActivate: [authGuard],
      },
      {
        path: 'pages',
        loadChildren: () =>
          import('./views/pages/pages.module').then((m) => m.PagesModule),
        canActivate: [authGuard],
      },
      {
        path: 'coupon',
        loadChildren: () =>
          import('./views/coupon/coupon.module').then((m) => m.CouponModule),
        canActivate: [authGuard],
      },
      {
        path: 'member',
        loadChildren: () =>
          import('./views/member/member.module').then((m) => m.MemberModule),
        canActivate: [authGuard],
      },
      {
        path: 'room-types',
        loadChildren: () =>
          import('./views/room-type/room-type.module').then((m) => m.RoomTypeModule),
        canActivate: [authGuard],
      },
      {
        path: 'linked-accounts',
        loadChildren: () =>
          import('./views/linked-accounts/linked-accounts.module').then((m) => m.LinkedAccountsModule),
        canActivate: [authGuard],
      },
      {
        path: 'rate-types',
        loadChildren: () =>
          import('./views/rate-type/rate-type.module').then((m) => m.RateTypeModule),
        canActivate: [authGuard],
      },

      {
        path: 'Bulding',
        loadChildren: () =>
          import('./views/bulding/bulding.module').then((m) => m.BuldingModule),
        canActivate: [authGuard],
      },
      {
        path: 'Receipt',
        loadChildren: () =>
          import('./views/receiptvoucher/receiptvoucher.module').then((m) => m.ReceiptvoucherModule),
        canActivate: [authGuard],
      },
      {
        path: 'checkin',
        loadChildren: () =>
          import('./views/checkin/checkin.module').then((m) => m.CheckinModule),
        canActivate: [authGuard],
      },

      {
        path: 'booknow',
        loadChildren: () => import('./views/booknow/booknow.module').then(m => m.BooknowModule),
        canActivate: [authGuard],
      },
      {
        path: 'booknow/:id',
        loadChildren: () => import('./views/booknow/detail/detail.module').then(m => m.DetailModule),
        canActivate: [authGuard],
      },
      
      {
        path: 'Rooms',
        loadChildren: () => import('./views/rooms/rooms.module').then(m => m.RoomsModule),
        canActivate: [authGuard],
      },
      { path: 'Bankbook/:id', loadChildren: () => import('./views/master/master.module').then(m => m.MasterModule) },
    ]
  },
  {
    path: '404',
    component: Page404Component,
    data: {
      title: 'Page 404'
    }
  },
  {
    path: '500',
    component: Page500Component,
    data: {
      title: 'Page 500'
    }
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [authGuard],
    data: {
      title: 'Login Page'
    }
  },
  {
    path: 'register',
    component: RegisterComponent,
    data: {
      title: 'Register Page'
    }
  },
  {
    path: 'surada/booknow',
    loadChildren: () => import('./views/booknow/booknow.module').then(m => m.BooknowModule),
    canActivate: [authGuard],
  },
  {
    path: 'surada/booknow/:id',
    loadChildren: () => import('./views/booknow/detail/detail.module').then(m => m.DetailModule),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'top',
      anchorScrolling: 'enabled',
      initialNavigation: 'enabledBlocking'
      // relativeLinkResolution: 'legacy'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
