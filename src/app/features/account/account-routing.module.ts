import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountShellComponent } from './account-shell.component';
import { authGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: AccountShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      { path: 'overview', loadComponent: () => import('../auth/components/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'orders', loadComponent: () => import('../auth/components/order-history/order-history.component').then(m => m.OrderHistoryComponent) },
      { path: 'addresses', loadComponent: () => import('../auth/components/addresses/addresses.component').then(m => m.AddressesComponent) },
      { path: 'payments', loadComponent: () => import('../auth/components/payments/payments.component').then(m => m.PaymentsComponent) },
      { path: 'profile', loadComponent: () => import('../auth/components/profile/profile.component').then(m => m.ProfileComponent) },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule {}
