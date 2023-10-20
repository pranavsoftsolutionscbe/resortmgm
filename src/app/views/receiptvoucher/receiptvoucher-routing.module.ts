import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReceiptvoucherComponent } from "./receiptvoucher.component";
const routes: Routes = [{ path: '', component: ReceiptvoucherComponent,
data: {
  title: $localize`Resort Receipt`
} }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReceiptvoucherRoutingModule { }
