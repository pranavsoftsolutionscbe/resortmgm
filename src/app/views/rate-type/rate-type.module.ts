import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { RateTypeRoutingModule } from "./rate-type-routing.module";
import { RateTypeComponent } from "./rate-type.component";
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
  ToastModule,
  ModalModule,
} from '@coreui/angular';
import { IconModule } from "@coreui/icons-angular";
import { NgbDatepickerModule } from "@ng-bootstrap/ng-bootstrap";

@NgModule({
  declarations: [RateTypeComponent],
  imports: [
    CommonModule,
    RateTypeRoutingModule,
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
    IconModule,
    ToastModule,
    ModalModule,
    NgbDatepickerModule
  ],
})
export class RateTypeModule { }
