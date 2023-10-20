import { NgModule } from '@angular/core';
import {
  ButtonGroupModule,
  ButtonModule,
  CardModule,
  DropdownModule,
  FormModule,
  GridModule,
  ListGroupModule,
  SharedModule,
  TableModule
} from '@coreui/angular';
import { CommonModule } from "@angular/common";

import { ReceiptvoucherRoutingModule } from './receiptvoucher-routing.module';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { IconModule } from '@coreui/icons-angular';
import { DocsComponentsModule } from '@docs-components/docs-components.module';
import {
  AlertModule,
  BadgeModule,
  ModalModule,
  PopoverModule,
  ProgressModule,
  ToastModule,
  TooltipModule,
  UtilitiesModule
} from '@coreui/angular';
import { ReceiptvoucherComponent } from "./receiptvoucher.component";

@NgModule({
  declarations: [ReceiptvoucherComponent],
  imports: [
    CommonModule,
    ReceiptvoucherRoutingModule,
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
    TableModule,
    NgbDatepickerModule,
    IconModule,
    ModalModule,
    ToastModule,
    TooltipModule,
    UtilitiesModule,
    AlertModule,
    BadgeModule,
    PopoverModule,
    ProgressModule,
    DocsComponentsModule

  ]
})
export class ReceiptvoucherModule { }
