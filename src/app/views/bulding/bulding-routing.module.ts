import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BuldingComponent } from './bulding.component';

const routes: Routes = [{ path: '', component: BuldingComponent,
data: {
  title: $localize`Bulding Master`
} }];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BuldingRoutingModule { }
