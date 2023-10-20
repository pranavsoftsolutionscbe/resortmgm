import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { LinkedAccountsRoutingModule } from "./linked-accounts-routing.module";
import { LinkedAccountsComponent } from "./linked-accounts.component";

import { AppToastComponent } from   'src/app/views/notifications/toasters/toast-simple/toast.component';


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
} from '@coreui/angular';
import { IconModule } from "@coreui/icons-angular";

@NgModule({
  declarations: [LinkedAccountsComponent],
  imports: [CommonModule, LinkedAccountsRoutingModule, CardModule,
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
    ToastModule
  ],
})
export class LinkedAccountsModule { }
