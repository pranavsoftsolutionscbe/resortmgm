import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MasterRoutingModule } from './master-routing.module';
import { MasterComponent } from './master.component';
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


@NgModule({
  declarations: [
    MasterComponent
  ],
  imports: [
    CommonModule,
    MasterRoutingModule,
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
  ]
})
export class MasterModule { }
