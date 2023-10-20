import { Component, OnInit, Inject, Input, OnChanges } from '@angular/core';
import { h_roombooking } from 'src/app/shared/models/h_roombooking.model';
import { DOCUMENT } from '@angular/common';
import { environment } from 'src/environments/environment';
import { Endpoint } from 'src/app/shared/API/Endpoint.model';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent implements OnInit, OnChanges {

  @Input() booking = new h_roombooking();
  @Input() room: any = {};
  @Input() amount: number = 0;
  @Input() days: number = 0;
  @Input() TaxAmount: number = 0;
  @Input() TotalAmount: number = 0;
  domain = '';
  contactDetails: any = {};
  currentDate = new Date();
  breakfastAmount = 0;
  dinnerAmount = 0;
  lunchAmount = 0;
  allRate = 0;
  allAmount = 0;
  totalAmount = 0;
  extraChildRate = 0;
  extraAdultRate = 0;
  extraChildAmount = 0;
  extraAdultAmount = 0;
  extraChildTaxAmount = 0;
  extraAdultTaxAmount = 0;

  constructor(@Inject(DOCUMENT) private document: any, private http: HttpClient) { }

  public ngOnInit(): void {
    this.domain = this.document.location.hostname;

    this.http
      .get(environment.server + Endpoint.res_contactus)
      .subscribe((res: any) => {
        this.contactDetails = res.pop();
      });
  }

  ngOnChanges() {
    this.breakfastAmount = this.room?.BreakFastRate + (this.room?.BreakFastRate * (this.room?.taxpercent / 100));
    this.dinnerAmount = this.room?.DinnerRate + (this.room?.DinnerRate * (this.room?.taxpercent / 100));
    this.lunchAmount = this.room?.LunchRate + (this.room?.LunchRate * (this.room?.taxpercent / 100));
    this.allRate = (this.room?.BreakFastRate + this.room?.DinnerRate + this.room?.LunchRate);
    this.allAmount = this.allRate + (this.allRate * (this.room?.taxpercent / 100));
    this.totalAmount = this.booking.IsAllInclude ? this.allAmount : (this.breakfastAmount + this.dinnerAmount + this.lunchAmount);
  }
}
