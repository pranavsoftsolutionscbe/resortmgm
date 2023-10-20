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

import { BuldingRoutingModule } from './bulding-routing.module';
import { BuldingComponent } from "./bulding.component";
import { CKEditorModule } from 'ckeditor4-angular';
@NgModule({
  declarations: [BuldingComponent],
  imports: [
    CommonModule,
    BuldingRoutingModule,
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
export class BuldingModule { }
