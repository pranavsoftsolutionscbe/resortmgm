import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DetailRoutingModule } from './detail-routing.module';
import { DetailComponent } from './detail.component';
import { NgbDatepickerModule, NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { IconModule } from '@coreui/icons-angular';

import {
  AlertModule,
  BadgeModule,
  ModalModule,
  PopoverModule,
  ProgressModule,
  ToastModule,
  TooltipModule,
  UtilitiesModule,
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
import { InvoiceComponent } from './invoice/invoice.component';

@NgModule({
  declarations: [
    DetailComponent,
    InvoiceComponent
  ],
  imports: [
    CommonModule,
    DetailRoutingModule,
    AlertModule,
    BadgeModule,
    ModalModule,
    PopoverModule,
    ProgressModule,
    ToastModule,
    TooltipModule,
    UtilitiesModule,
    ButtonGroupModule,
    ButtonModule,
    CardModule,
    DropdownModule,
    FormModule,
    GridModule,
    ListGroupModule,
    SharedModule,
    TableModule,
    FormsModule,
    ReactiveFormsModule,
    NgbDatepickerModule,
    NgbTimepickerModule,
    IconModule
  ]
})
export class DetailModule { }
