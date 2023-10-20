import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RoomTypeComponent } from './room-type.component';

const routes: Routes = [{ path: '', component: RoomTypeComponent,
data: {
  title: $localize`Room Type`
} }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoomTypeRoutingModule { }
