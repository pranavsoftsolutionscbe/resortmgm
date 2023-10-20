import { identifierName } from '@angular/compiler';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Endpoint } from 'src/app/shared/API/Endpoint.model';
import { DataserviceService } from 'src/app/shared/dataservice/dataservice.service';
import { h_roombooking } from "src/app/shared/models/h_roombooking.model";
import { NgbDateParserFormatter, NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { DatePipe } from "@angular/common";
import { ToasterPlacement } from "@coreui/angular";
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent {
  @ViewChild('booknow') bokBtn: ElementRef;
  RoomID: number;
  roomImagePath = "";
  room: any;
  bannerImage: string;
  sideImage: string;
  booking = new h_roombooking();
  days: number = 0;
  dateformate = "EE dd-MM-yyyy";
  dtOfferFrom: NgbDateStruct;
  dtOfferTo: NgbDateStruct;
  DELIMITER = "/";
  roomRate: number = 0;
  bookingtext: string = "COMPLETE BOOKING";
  Taxpercent: number = 18;
  taxDesc: string = "";
  TaxAmount: number;
  TotalAmount: number;
  Breakfast: number = 0;
  Dinner: number = 0;
  Lunch: number = 0;
  Allinc: number = 0;
  extratext: string = "Additionals";
  extraAmount: number = 0;
  extraHrs: number = 0;
  extraHrsAmount: number = 0;

  toasterText = "";
  toasterColor = "success";
  toasterShow = false;
  positionStatic = ToasterPlacement.Static;

  timeCheckIn = { hour: 0, minute: 0 };
  timeCheckOut = { hour: 0, minute: 0 };

  resourcePath = environment.resources;

  searchData = {
    checkInDate: {
      year: 0,
      month: 0,
      day: 0
    },
    checkOutDate: {
      year: 0,
      month: 0,
      day: 0
    },
    checkInTime: { hour: 0, minute: 0 },
    checkOutTime: { hour: 0, minute: 0 },
    isFlexibleDates: false,
    room_type: 0
  };

  minDate = { year: 0, month: 0, day: 0 };
  isValid = false;

  constructor(private dtenv: DataserviceService, private activatedRoute: ActivatedRoute,
    public datepipe: DatePipe, private route: Router) { }

  public ngOnInit(): void {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.RoomID = params?.['id'];
      this.getData();
      // this.days = this.getDiffDays('07/01/2021', '07/10/2021')
      // document.onload;
      const currentDate = Date();
      const y = new Date(currentDate).getFullYear();
      const mm = new Date(currentDate).getMonth() + 1;
      const dat = this.datepipe.transform(currentDate, 'dd');
      const d = Number(dat);
      this.minDate = { year: y, month: mm, day: d };
    });

    const data: any = localStorage.getItem('searchData');
    if (data) {
      this.searchData = JSON.parse(data);
      const formatedCheckInDate = this.searchData.checkInDate ? this.searchData.checkInDate.year + this.DELIMITER + this.searchData.checkInDate.month + this.DELIMITER + this.searchData.checkInDate.day : '';
      this.booking.CheckinDate = new Date(formatedCheckInDate);

      const formatedCheckOutDate = this.searchData.checkOutDate ? this.searchData.checkOutDate.year + this.DELIMITER + this.searchData.checkOutDate.month + this.DELIMITER + this.searchData.checkOutDate.day : '';
      this.booking.CheckoutDate = new Date(formatedCheckOutDate);

      this.timeCheckIn = this.searchData.checkInTime;
      this.timeCheckOut = this.searchData.checkOutTime;

      this.booking.ClassID = Number(this.searchData.room_type);
    }
  }

  getData(): void {
    this.dtenv.get(Endpoint.gettoBookRoom + this.RoomID)
      .subscribe((res: any) => {
        this.room = res[0];
        this.Taxpercent = this.room.taxpercent;
        this.taxDesc = this.room.taxcode;
        this.roomImagePath = this.resourcePath + "rooms/1/" + this.room.roomimage;
        this.LoadDate();
      });

    // this.dtenv.get(Endpoint.GetBookingBulding + "1/" + this.room.BuldingID)
    //   .subscribe((res) => {
    //     this.roomImagePath = this.resourcePath + "rooms/1/" + res.imagepath;
    //   })
  }
  getDiffDays(sDate: any, eDate: any) {
    var startDate = new Date(sDate);
    var endDate = new Date(eDate);

    var Time = endDate.getTime() - startDate.getTime();
    var atime = Math.floor(Time / (1000 * 3600 * 24));
    var rtime = Time / (1000 * 3600 * 24)
    return rtime > atime ? atime + 1 : atime;
  }

  getTimeDiff() {
    this.extraHrs = (this.timeCheckOut.hour - this.timeCheckIn.hour);
    const extraMins = (this.timeCheckOut.minute - this.timeCheckIn.minute);
    if (extraMins > 20) {
      this.extraHrs = this.extraHrs + 1;
    }
    if (this.extraHrs > 0) {
      this.extraHrsAmount = (this.room.Rate / 24) * this.extraHrs;
    } else {
      this.extraHrsAmount = 0;
      this.extraHrs = 0;
    }
  }

  onDateSelectFrom(date: NgbDateStruct) {
    const formatedDate = date ? date.year + this.DELIMITER + date.month + this.DELIMITER + date.day : '';

    this.booking.CheckinDate = new Date(formatedDate);
    this.LoadDate();
  }
  onDateSelectTo(date: NgbDateStruct) {
    const formatedDate = date ? date.year + this.DELIMITER + date.month + this.DELIMITER + date.day : '';

    this.booking.CheckoutDate = new Date(formatedDate);
    this.LoadDate();
  }
  LoadDate() {
    let y = new Date(this.booking.CheckinDate).getFullYear();
    let mm = new Date(this.booking.CheckinDate).getMonth() + 1;
    let dat = this.datepipe.transform(this.booking.CheckinDate, 'dd');
    let d = Number(dat);

    this.dtOfferFrom = { year: y, month: mm, day: d };
    y = new Date(this.booking.CheckoutDate).getFullYear();
    mm = new Date(this.booking.CheckoutDate).getMonth() + 1;
    dat = this.datepipe.transform(this.booking.CheckoutDate, 'dd');
    d = Number(dat);

    this.dtOfferTo = { year: y, month: mm, day: d };

    this.getTimeDiff();
    // debugger;
    this.days = this.getDiffDays(this.booking.CheckinDate, this.booking.CheckoutDate);
    this.days = this.days == 0 ? this.days + 1 : this.days;
    this.roomRate = this.days * this.room.Rate;
    this.roomRate = this.booking.NoOfGuest > this.room.MaxBed ?
      (this.roomRate + (this.booking.NoOfGuest - this.room.MaxBed) * this.room.PricePerBed) : this.roomRate;
    this.roomRate = this.booking.NoOFChilds > this.room.NoOFChilds ?
      (this.roomRate + (this.booking.NoOFChilds - this.room.NoOFChilds) * this.room.ChildPricePerBed) : this.roomRate;
    this.TaxAmount = this.Taxpercent / 100 * (this.roomRate + this.extraHrsAmount);
    this.TotalAmount = (this.roomRate + this.extraHrsAmount) + this.TaxAmount;
    // debugger;
    let Allrate = (this.room.BreakFastRate + this.room.DinnerRate + this.room.LunchRate);
    this.extratext = "Food Provide";
    this.extraAmount = 0;
    if (this.booking.IsAllInclude == 1 || this.booking.IsAllInclude.toString() == "true") {
      this.extratext = " All Period ";
      this.extraAmount = (this.days * Allrate * (this.booking.NoOfGuest + this.booking.NoOFChilds));
      this.TotalAmount = this.TotalAmount + this.extraAmount;
      // this.booking.IsBreakFastIncluded = this.booking.IsDinnerInclude = this.booking.IsLunchInclude = 0;
    }
    if (this.booking.IsBreakFastIncluded == 1 || this.booking.IsBreakFastIncluded.toString() == "true") {
      this.TotalAmount = this.TotalAmount + (this.days * this.room.BreakFastRate * (this.booking.NoOfGuest + this.booking.NoOFChilds));
      this.extratext += " Breakfast ";
      this.extraAmount += (this.days * this.room.BreakFastRate * (this.booking.NoOfGuest + this.booking.NoOFChilds));
      // this.booking.IsAllInclude = 0;
    }
    if (this.booking.IsDinnerInclude == 1 || this.booking.IsDinnerInclude.toString() == "true") {
      this.TotalAmount = this.TotalAmount + (this.days * this.room.DinnerRate * (this.booking.NoOfGuest + this.booking.NoOFChilds));
      this.extratext += " Dinner ";
      this.extraAmount += (this.days * this.room.DinnerRate * (this.booking.NoOfGuest + this.booking.NoOFChilds));
      // this.booking.IsAllInclude = 0;
    }
    if (this.booking.IsLunchInclude == 1 || this.booking.IsLunchInclude.toString() == "true") {
      this.TotalAmount = this.TotalAmount + (this.days * this.room.LunchRate * (this.booking.NoOfGuest + this.booking.NoOFChilds));
      this.extratext += " Lunch ";
      this.extraAmount += (this.days * this.room.LunchRate * (this.booking.NoOfGuest + this.booking.NoOFChilds));
      // this.booking.IsAllInclude = 0;
    }

    if (this.days <= 0) {
      // this.bokBtn.nativeElement.style.backgroundColor = '#A93226';// = document.getElementById('booknow') ;
      (<HTMLInputElement>document.getElementById("booknow")).style.backgroundColor = '#A93226';
      this.bookingtext = "Can not Book";
    }
    else {
      (<HTMLInputElement>document.getElementById("booknow")).style.backgroundColor = '#081015';
      this.bookingtext = "COMPLETE BOOKING";
    }
  }

  back() {
    if (this.route.url.includes('/surada/booknow')) {
      this.route.navigate(['/surada/booknow']);
    } else {
      this.route.navigate(['/booknow']);
    }
  }

  submit() {
    let dat = this.datepipe.transform(Date(), 'yyyy-MM-dd');


    if (this.booking.IsBreakFastIncluded.toString() == "true")
      this.booking.IsBreakFastIncluded = 1
    else
      this.booking.IsBreakFastIncluded = 0;

    if (this.booking.IsDinnerInclude.toString() == "true")
      this.booking.IsDinnerInclude = 1
    else
      this.booking.IsDinnerInclude = 0;

    if (this.booking.IsLunchInclude.toString() == "true")
      this.booking.IsLunchInclude = 1
    else
      this.booking.IsLunchInclude = 0;

    if (this.booking.IsAllInclude.toString() == "true")
      this.booking.IsAllInclude = 1
    else
      this.booking.IsAllInclude = 0;

    this.booking.CheckoutEstimatedDays = this.days;
    this.isValid = this.validateForm();
    if (this.isValid) {
      this.booking.BookedBy = 'web portal';

      this.dtenv.get(Endpoint.getvoucher + '1512/Booking/' + dat)
        .subscribe((resvoc: any) => {
          this.booking.VoucherCode = resvoc[0].VoucherCode;
          this.booking.VoucherNo = resvoc[0].Voucherno;
          this.booking.PricePreBed = this.room.PricePerBed;
          this.booking.ChildPricePerBed = this.room.ChildPricePerBed;
          this.booking.RoomRent = this.room.Rate;
          this.booking.RoomCode = this.room.RateId.toString();
          this.booking.CheckinTime = this.booking.CheckinDate;
          this.booking.CheckoutTime = this.booking.CheckoutDate;
          this.booking.CheckoutEstimatedDate = this.booking.CheckoutDate;
          this.booking.BookingDate = new Date();
          this.booking.BreakFastRate = this.room.BreakFastRate;
          this.booking.LunchRate = this.room.LunchRate;
          this.booking.DinnerRate = this.room.DinnerRate;
          this.booking.AllIncludeRate = this.room.PricePerBed;
          this.booking.TaxRateID = this.room.PricePerBed;
          this.booking.TaxPercent = this.Taxpercent;
          this.booking.TaxAmount = this.TaxAmount;
          this.booking.TotalAmount = this.TotalAmount;
          this.booking.TaxRateID = this.room.TaxRateID;
          this.booking.ClientID  = 1;
          this.dtenv.post(Endpoint.RoomBooking, this.booking)
            .subscribe((res: any) => {
              this.dtenv.get(Endpoint.updateVoucherno + this.booking.VoucherCode)
                .subscribe((res: any) => {

                  let senddata = {
                    "ToEmail": this.booking.emailId,
                    "Sub": "Booking Conformation From SURADA Resorts",
                    "msg": "<h3>Booking Conformation From SURADA Resorts</h3> Dear " + this.booking.CustomerFirstName
                      + "<br> Amount Received " + this.booking.TotalAmount.toString()
                  };
                  this.dtenv.POST(Endpoint.messenger, senddata)
                    .subscribe((res: any) => {
                      this.booking = new h_roombooking();
                      this.toasterShow = true;
                      this.toasterColor = "success";
                      this.toasterText = "Your Room Booked Sucessfuly, Our Wishes to Enjoy the Trip.";
                      setTimeout(() => {
                        this.toasterShow = false;
                      }, 5000);
                      this.back();
                    });

                  // this.back();
                });
            });
        })

    }
  }

  onItemChange(event: any, type: string) {
    if (type === "all" && event.target.checked) {
      this.booking.IsBreakFastIncluded = this.booking.IsDinnerInclude = this.booking.IsLunchInclude = 0;
    } else {
      this.booking.IsAllInclude = 0;
    }

    this.LoadDate();
  }

  validateForm() {
    if (
      this.booking.CustomerFirstName === "" ||
      this.booking.CustomerSecondName === "" ||
      this.booking.AddressLine1 === "" ||
      this.booking.NoOfGuest === 0 ||
      this.booking.ClassID === 0 ||
      this.booking.PhoneNo === "" ||
      this.booking.emailId == ""
    ) {
      this.toasterShow = true;
      this.toasterColor = "danger";
      this.toasterText = "Please fill all mandatory fileds.";
      setTimeout(() => {
        this.toasterShow = false;
      }, 5000);
      return false;
    }

    return true;
  }
}
