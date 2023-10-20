import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RateTypeComponent } from './rate-type.component';

const routes: Routes = [{ path: '', component: RateTypeComponent,
data: {
  title: $localize`Rate Type`
} }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RateTypeRoutingModule { }
