import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
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
  ModalModule,
  ToastModule
} from '@coreui/angular';

import { RoomTypeRoutingModule } from "./room-type-routing.module";
import { RoomTypeComponent } from "./room-type.component";
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { IconModule } from '@coreui/icons-angular';

@NgModule({
  declarations: [RoomTypeComponent],
  imports: [
    CommonModule,
    RoomTypeRoutingModule,
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
    NgbDatepickerModule,
    IconModule,
    ToastModule,
    ModalModule,
    TableModule,
  ],
})
export class RoomTypeModule { }
