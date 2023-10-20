import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {
  ButtonGroupModule,
  ButtonModule,
  CardModule,
  DropdownModule,
  FormModule,
  GridModule,
  ListGroupModule,
  ModalModule,
  SharedModule,
  TableModule,
  ToastModule,
} from '@coreui/angular';

import { CouponRoutingModule } from "./coupon-routing.module";
import { CouponComponent } from "./coupon.component";
import { IconModule } from '@coreui/icons-angular';
import { NgbDatepickerModule, NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap';
@NgModule({
  declarations: [CouponComponent],
  imports: [
    CommonModule,
    CouponRoutingModule,
    CardModule,
    GridModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    FormModule,
    ButtonModule,
    ButtonGroupModule,
    DropdownModule,
    SharedModule,
    ListGroupModule,
    IconModule,
    ToastModule,
    TableModule,
    ModalModule,
    NgbDatepickerModule
  ]
})
export class CouponModule { }
