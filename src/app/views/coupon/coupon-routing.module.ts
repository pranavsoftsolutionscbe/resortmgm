import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CouponComponent } from './coupon.component';

const routes: Routes = [
  {
    path: '',
    component: CouponComponent,
    data: {
      title: $localize`Coupon`
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CouponRoutingModule { }
