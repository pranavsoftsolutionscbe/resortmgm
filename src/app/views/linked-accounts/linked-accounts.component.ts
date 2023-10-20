import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { HLinkedaccounts } from "src/app/shared/models/h-linkedaccounts.model";
import { Endpoint } from "src/app/shared/API/Endpoint.model";
import { DataserviceService } from "src/app/shared/dataservice/dataservice.service";
import { ToasterComponent, ToasterPlacement } from '@coreui/angular';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { filter, Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';


export enum Colors {
  '' = '',
  primary = 'primary',
  secondary = 'secondary',
  success = 'success',
  info = 'info',
  warning = 'warning',
  danger = 'danger',
  dark = 'dark',
  light = 'light',
}

@Component({
  selector: 'app-linked-accounts',
  templateUrl: './linked-accounts.component.html',
  styleUrls: ['./linked-accounts.component.css']
})
export class LinkedAccountsComponent implements OnInit {

  constructor(private dtenv: DataserviceService) { }

  linkaccounts: HLinkedaccounts[] = [];
  positions = Object.values(ToasterPlacement);
  position = ToasterPlacement.TopEnd;
  positionStatic = ToasterPlacement.Static;
  colors = Object.keys(Colors);
  autohide = true;
  delay = 5000;
  fade = true;
  toasterText = "";
  toasterColor = "success";
  toasterShow = false;

  toasterForm = new UntypedFormGroup({
    autohide: new UntypedFormControl(this.autohide),
    delay: new UntypedFormControl({ value: this.delay, disabled: !this.autohide }),
    position: new UntypedFormControl(this.position),
    fade: new UntypedFormControl({ value: true, disabled: false }),
    closeButton: new UntypedFormControl(true),
    color: new UntypedFormControl('')
  });

  formChanges: Observable<any> = this.toasterForm.valueChanges.pipe(
    takeUntilDestroyed(),
    filter(e => e.autohide !== this.autohide)
  );

  @ViewChildren(ToasterComponent) viewChildren!: QueryList<ToasterComponent>;

  accounts: any[];

  ngOnInit() {
    this.getdata();
  }

  getdata() {
    this.dtenv.get(Endpoint.h_linkedaccounts)
      .subscribe((res: HLinkedaccounts[]) => {
        this.linkaccounts = res;
        console.log(this.linkaccounts);
      });
    this.dtenv.get(Endpoint.GetAccounts + "1")
      .subscribe((res: any) => {
        this.accounts = res;
        console.log(this.accounts);
      });
  }

  UpdateAccounts(): void {
    this.dtenv.put(Endpoint.Puth_linkedaccounts, this.linkaccounts)
      .subscribe((res: any) => {
        
        console.log(res);
        this.toasterShow = true;
        this.toasterColor = "success";
        this.toasterText = "Successfully Updated.";
        setTimeout(() => {
          this.toasterShow = false;
        }, 5000);
      })
  }



}
