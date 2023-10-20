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

import { MemberRoutingModule } from "./member-routing.module";
import { MemberComponent } from "./member.component";
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
  UtilitiesModule,
  
} from '@coreui/angular';
@NgModule({
  declarations: [MemberComponent],
  imports: [
    CommonModule,
    MemberRoutingModule,
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
    DocsComponentsModule,
    ToastModule
  ]
})
export class MemberModule { }
