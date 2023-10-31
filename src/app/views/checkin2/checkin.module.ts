import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckinRoutingModule } from './checkin-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  ButtonGroupModule,
  ButtonModule,
  CardModule,
  DropdownModule,
  FormModule,
  GridModule,
  ListGroupModule,
  SharedModule,
  TableModule,
  ToastModule
} from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';
import { CheckinComponent } from './checkin.component';
import { NgbDatepickerModule, NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap';
@NgModule({
  declarations: [CheckinComponent],
  imports: [
    CommonModule,
    CheckinRoutingModule,
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
    TableModule,
    NgbDatepickerModule,
    NgbTimepickerModule,
    ToastModule
  ]
})
export class CheckinModule { }
