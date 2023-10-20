import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LinkedAccountsComponent } from './linked-accounts.component';

const routes: Routes = [{ path: '', component: LinkedAccountsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LinkedAccountsRoutingModule { }
