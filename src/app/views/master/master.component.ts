import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
@Component({
  selector: 'app-master',
  templateUrl: './master.component.html',
  styleUrls: ['./master.component.scss']
})
export class MasterComponent implements OnInit {
  @Input()
  url: string = "http://sunvis.net/iframe/c3VudmlzMjMvY2hhbmRydS8xMjM%3D/bankbook/BankPayment";
  urlSafe: SafeResourceUrl;
  masterid: number;
  constructor(public sanitizer: DomSanitizer, private activatedRoute: ActivatedRoute) { }
  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.masterid = Number(params?.['id']);

      switch (this.masterid) {
        case 1:
          {
            this.url = "http://sunvis.net/iframe/c3VudmlzMjMvY2hhbmRydS8xMjM%3D/bankbook/BankPayment";
            break;
          }
        case 2:
          this.url = "http://sunvis.net/iframe/c3VyYWRhJTIwcmVzb3J0cy9zdXJhZGEvc3VyYWRhMTIz/master/customerSupplier";
          break;
        case 3:
          {
            this.url = "http://sunvis.net/iframe/c3VyYWRhJTIwcmVzb3J0cy9zdXJhZGEvc3VyYWRhMTIz/master/taxsetup";
            break;
          }
        case 4:
          {
            this.url = "http://sunvis.net/iframe/c3VyYWRhJTIwcmVzb3J0cy9zdXJhZGEvc3VyYWRhMTIz/master/ledgerAccount";
            break;
          }
        case 5:
          {
            this.url = "http://sunvis.net/iframe/c3VyYWRhJTIwcmVzb3J0cy9zdXJhZGEvc3VyYWRhMTIz/bankbook/BankPayment";
            break;
          }
          case 6:
            {
              this.url = "http://sunvis.net/iframe/c3VyYWRhJTIwcmVzb3J0cy9zdXJhZGEvc3VyYWRhMTIz/master/HolidayDetails";
              break;
            } 
            case 7:
            {
              this.url = "http://sunvis.net/iframe/c3VyYWRhJTIwcmVzb3J0cy9zdXJhZGEvc3VyYWRhMTIz/master/documentTypeNumbering";
              break;
            } 
        default:
          {
            this.url = "http://sunvis.net/iframe/c3VyYWRhJTIwcmVzb3J0cy9zdXJhZGEvc3VyYWRhMTIz/master/HolidayDetails";
            break;
          }
      }
      this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
    });


  }
}
