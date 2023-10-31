import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDatepickerModule, NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { IconModule } from '@coreui/icons-angular';
import { BooknowRoutingModule } from './booknow-routing.module';
import { BooknowComponent } from './booknow.component';
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
  TableModule,
  CarouselModule,
  SpinnerModule
} from '@coreui/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    BooknowComponent
  ],
  imports: [
    CommonModule,
    BooknowRoutingModule,
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
    NgbDatepickerModule,
    NgbTimepickerModule,
    IconModule,
    ReactiveFormsModule,
    FormsModule,
    CarouselModule,
    SpinnerModule
  ]
})
export class BooknowModule { }
