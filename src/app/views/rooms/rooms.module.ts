import {
  ButtonGroupModule,
  ButtonModule,
  CardModule,
  DropdownModule,
  FormModule,
  GridModule,
  ListGroupModule,
  NavModule,
  PaginationModule,
  SharedModule,
  TableModule,
  TabsModule
} from '@coreui/angular';
import { CommonModule } from "@angular/common";


import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { IconModule } from '@coreui/icons-angular';
import { DocsComponentsModule } from '@docs-components/docs-components.module';

import { RoomsRoutingModule } from './rooms-routing.module';
import { RoomsComponent } from "./rooms.component";
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
import { CKEditorModule } from 'ckeditor4-angular';
@NgModule({
  declarations: [RoomsComponent],
  imports: [
    CommonModule,
    RoomsRoutingModule,
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
    TabsModule,
    NavModule,
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
    DocsComponentsModule,
    CKEditorModule,
    PaginationModule,
    
  ]
})
export class RoomsModule { }
