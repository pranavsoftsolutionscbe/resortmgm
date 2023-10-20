import { Component, OnInit } from '@angular/core';
import { Endpoint } from "src/app/shared/API/Endpoint.model";
import { DataserviceService } from "src/app/shared/dataservice/dataservice.service";
import { NgbDateParserFormatter, NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { CustomDatepickerService } from 'src/app/shared/dataservice/customdatepicker.service';
import { h_currentroomtransactions } from "src/app/shared/models/h_currentroomtransactions.model";
import { DatePipe } from '@angular/common';
import { ToasterPlacement } from '@coreui/angular';
@Component({
  selector: 'app-receiptvoucher',
  templateUrl: './receiptvoucher.component.html',
  styleUrls: ['./receiptvoucher.component.scss']
})
export class ReceiptvoucherComponent implements OnInit {
  public liveDemoVisible = false;
  constructor(private dtenv: DataserviceService, public formatter: NgbDateParserFormatter
    , private customDatepickerService: CustomDatepickerService) { }
  date: NgbDateStruct;
  DELIMITER = "/";
  rootrans: h_currentroomtransactions[] = [];
  voucher = new h_currentroomtransactions();
  dateformate = "dd-MM-yyyy HH:mm";
  toasterText = "";
  toasterColor = "success";
  toasterShow = false;
  positionStatic = ToasterPlacement.Static;


  ngOnInit(): void {
    this.voucher.VoucherNo = "rec-001/23-24"
    this.voucher.HomeDebitAmount = 100;
  }
  getData(): void {

  }
  SaveEdit(): void {
    //  this.convertTojson(this.member.CustomerDOB);




    console.log(this.rootrans);



    this.dtenv.post(Endpoint.h_customermaster, this.rootrans).subscribe
      ((res: h_currentroomtransactions) => {
        console.log(res);

      })
  }

  toggleLiveDemo() {
    this.liveDemoVisible = !this.liveDemoVisible;
  }

  handleLiveDemoChange(event: boolean) {
    this.liveDemoVisible = event;
  }

  onDateSelect1(date: NgbDateStruct) {
    const formatedDate = date ? date.year + this.DELIMITER + date.month + this.DELIMITER + date.day : '';

    this.voucher.EntryDate = new Date(formatedDate);
  }
  ShowMember(): void {
    let date_Object: Date = this.voucher.EntryDate;
    const date_String = date_Object.getFullYear() +
      "-" +
      (date_Object.getMonth() + 1) +
      "-" +
      + date_Object.getDate();

    // convert string to ngb datepicker json format
    this.date = this.customDatepickerService.convertStringToJson(date_String, this.DELIMITER);
  }

}
