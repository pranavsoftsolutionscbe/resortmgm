import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MemberComponent } from './member.component';

const routes: Routes = [{ path: '', component: MemberComponent,
data: {
  title: $localize`Guest`
} }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MemberRoutingModule { }
