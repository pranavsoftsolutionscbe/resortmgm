import { Component, OnInit } from '@angular/core';
import { ToasterPlacement } from '@coreui/angular';
import { HRoomallotment } from 'src/app/shared/models/h-roomallotment.model';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Endpoint } from 'src/app/shared/API/Endpoint.model';
import { CustomDatepickerService } from 'src/app/shared/dataservice/customdatepicker.service';
import { DataserviceService } from 'src/app/shared/dataservice/dataservice.service';
import { environment } from 'src/environments/environment';
import { DatePipe } from '@angular/common';
import { h_customermaster } from 'src/app/shared/models/h_customermaster.model';
import { h_roombooking } from 'src/app/shared/models/h_roombooking.model';
@Component({
  selector: 'app-checkin',
  templateUrl: './checkin.component.html',
  styleUrls: ['./checkin.component.scss'],
})
export class CheckinComponent implements OnInit {
  constructor(private dtenv: DataserviceService, public formatter: NgbDateParserFormatter, private customDatepickerService: CustomDatepickerService, private route: Router, private activatedRoute: ActivatedRoute,
    private domSanitizer: DomSanitizer, public datepipe: DatePipe) { }

  checkInDetails = new HRoomallotment();
  bookedvoucher = new h_roombooking();
  timeCheckIn = { hour: 0, minute: 0 };
  timeCheckOut = { hour: 0, minute: 0 };
  customers: any = [];
  room: any;
  toasterText = "";
  toasterColor = "success";
  booked = new h_roombooking()
  toasterShow = false;
  BookingVouchers: any = [];
  roomtypes: any = [];
  ratelist: any = [];
  ratetypeID: number = 0;
  rateID: number = 0;
  positionStatic = ToasterPlacement.Static;
  countrylist: any = [];
  pincode_Address: any = [];
  stateList: any = [];
  districtList: any = [];
  citylist: any = [];
  countryName: string = "";
  member = new h_customermaster();
  date: NgbDateStruct;
  DELIMITER = "/";
  isEdit: boolean = false;
  Rooms: any = [];
  custID: number = 0;
  days: number = 0;
  dateformate = "EE dd-MM-yyyy";
  dtOfferFrom: NgbDateStruct;
  dtOfferTo: NgbDateStruct;
  Fromdate: NgbDateStruct;
  Todate: NgbDateStruct;
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
  selectedVoucher: string = "";

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
  ngOnInit() {
    this.getData();
  }
  getData(): void {
    const currentDate = Date();
    const y = new Date(currentDate).getFullYear();
    const mm = new Date(currentDate).getMonth() + 1;
    const dat = this.datepipe.transform(currentDate, 'dd');
    const d = Number(dat);
    this.minDate = { year: y, month: mm, day: d };

    this.dtenv.get(Endpoint.GetBookedVouchers + "1")
      .subscribe((res: any) => {
        this.BookingVouchers = res;
      });

    this.dtenv.get(Endpoint.getcountries)
      .subscribe((res: any) => {
        this.countrylist = res;
        console.log(this.countrylist);
      });

    this.dtenv.get(Endpoint.GetRoomTypes + "1")
      .subscribe((res: any) => {
        this.roomtypes = res;
      }
      );
    this.dtenv.get(Endpoint.GetCustomers + "1")
      .subscribe((res: any[]) => {
        this.customers = res;
      });
  }

  assignBookingDates(): void {

    // this.searchData.checkInTime = this.booked.CheckinTime; //= JSON.parse(data);
    // this.searchData.checkOutTime = this.booked.CheckoutTime;

    let vocno = this.BookingVouchers.filter((bk: { VoucherNo: string; }) => bk.VoucherNo == this.selectedVoucher)[0].VoucherCode;

    let voucher = {

      "CountryId": vocno,
      "CountryName": this.selectedVoucher
    };

    this.dtenv.put(Endpoint.GetBookedVoucherdetail, voucher)
      .subscribe((res: any) => {
        this.bookedvoucher = res[0];

        this.isEdit = false;
        this.checkInDetails.CustomerFirstName = this.bookedvoucher.CustomerFirstName;
        this.checkInDetails.CustomerSecondName = this.bookedvoucher.CustomerSecondName;
        this.checkInDetails.AddressLine1 = this.bookedvoucher.AddressLine1;
        this.checkInDetails.AddressLine2 = this.bookedvoucher.AddressLine2;
        this.checkInDetails.PhoneNo = this.bookedvoucher.PhoneNo;
        this.checkInDetails.PassportNo = this.bookedvoucher.PassportNo;
        this.checkInDetails.CountryId = Number(this.bookedvoucher.Country);
        this.checkInDetails.emailId = this.bookedvoucher.emailId;
        this.checkInDetails.CheckinDate = this.bookedvoucher.CheckinDate;
        this.checkInDetails.CheckinTime = this.bookedvoucher.CheckinTime;
        this.checkInDetails.CheckoutDate = this.bookedvoucher.CheckoutDate;
        this.checkInDetails.CustomerID = this.bookedvoucher.CustomerID;
        this.checkInDetails.CustomerName = this.bookedvoucher.CustomerName;
       
      });
    let y = new Date(this.booked.CheckinDate).getFullYear();
    let mm = new Date(this.booked.CheckinDate).getMonth() + 1;
    let dat = this.datepipe.transform(this.booked.CheckinDate, 'dd');
    let d = Number(dat);


    this.Fromdate = { year: y, month: mm, day: d };
    y = new Date(this.booked.CheckoutDate).getFullYear();
    mm = new Date(this.booked.CheckoutDate).getMonth() + 1;
    dat = this.datepipe.transform(this.booked.CheckoutDate, 'dd');
    d = Number(dat);
    this.Todate = { year: y, month: mm, day: d };
    this.searchData.checkInDate = this.Fromdate;
    this.searchData.checkOutDate = this.Todate;

    const formatedCheckInDate = this.searchData.checkInDate ? this.searchData.checkInDate.year + this.DELIMITER + this.searchData.checkInDate.month + this.DELIMITER + this.searchData.checkInDate.day : '';
    this.checkInDetails.CheckinDate = new Date(formatedCheckInDate);

    const formatedCheckOutDate = this.searchData.checkOutDate ? this.searchData.checkOutDate.year + this.DELIMITER + this.searchData.checkOutDate.month + this.DELIMITER + this.searchData.checkOutDate.day : '';
    this.checkInDetails.CheckoutDate = new Date(formatedCheckOutDate);

    this.timeCheckIn = this.searchData.checkInTime;
    this.timeCheckOut = this.searchData.checkOutTime;
  }
  GetRateTypes(): void {
    console.log(this.ratetypeID);
    this.dtenv.get(Endpoint.GetRateTypeList + "1")
      .subscribe((res: any) => {
        console.log(res);
        this.ratelist = res.filter((rt: { RoomTypeID: number; }) => rt.RoomTypeID == this.ratetypeID);
        console.log(this.ratelist);
      })
  }
  ShowData(memID: number): void {
    this.dtenv.get(Endpoint.h_customermaster + "/" + this.custID)
      .subscribe((res: h_customermaster) => {
        this.member = res;
        let y = new Date(this.member.CustomerDOB).getFullYear();
        let mm = new Date(this.member.CustomerDOB).getMonth() + 1;
        let dat = this.datepipe.transform(this.member.CustomerDOB, 'dd');
        let d = Number(dat);
        this.date = { year: y, month: mm, day: d };
        this.getstates();
        this.getDistrict();
        this.getCity();
        this.getPincode();
        this.isEdit = false;
        this.checkInDetails.CustomerFirstName = this.member.CustomerFirstName;
        this.checkInDetails.CustomerSecondName = this.member.CustomerSecondName;
        this.checkInDetails.AddressLine1 = this.member.AddressLine1;
        this.checkInDetails.AddressLine2 = this.member.AddressLine2;
        this.checkInDetails.PhoneNo = this.member.PhoneNo;
        this.checkInDetails.PassportNo = this.member.PassportNo;
        this.checkInDetails.CountryId = Number(this.member.Country);
        this.checkInDetails.emailId = this.member.emailId;

      });

  }
  getAddressbyPincode(): void {
    this.dtenv.get(Endpoint.GetAddressDetails + '65/' + this.member.Pincode)
      .subscribe((res: any) => {
        this.countrylist = res;
      });
  }
  getstates(): void {
    let country = this.countrylist.filter((cnt: { CountryId: string; }) => cnt.CountryId == this.member.Country)[0];
    this.countryName = country.CountryName;
    this.dtenv.get(Endpoint.GetStateDetails + this.member.Country + '/' + country.CountryName)
      .subscribe((res: any) => {
        this.stateList = res;

      });
  }
  getDistrict(): void {
    this.dtenv.get(Endpoint.GetDistrictDetails + this.member.Country + '/' + this.countryName +
      '/' + this.member.State)
      .subscribe((res: any) => {
        this.districtList = res;
        console.log(this.districtList);
      });
  }
  getCity(): void {
    this.dtenv.get(Endpoint.GetCityDetails + this.member.Country + '/' + this.countryName +
      '/' + this.member.State + '/' + this.member.District)
      .subscribe((res: any) => {
        this.citylist = res;

      });
  }
  getPincode(): void {
    this.dtenv.get(Endpoint.GetPincode + this.member.Country + '/' + this.countryName +
      '/' + this.member.State + '/' + this.member.District + '/' + this.member.City)
      .subscribe((res: any) => {

        this.member.Pincode = res[0].Pincode
        console.log(res);
      });
  }

  LoadRooms(): void {
    this.dtenv.get(Endpoint.GetRoomstobook + this.rateID + '/' + this.ratetypeID)
      .subscribe((res: any) => {

        this.Rooms = res;

      });
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

    this.checkInDetails.CheckinDate = new Date(formatedDate);
    this.LoadDate();
  }
  onDateSelectTo(date: NgbDateStruct) {
    const formatedDate = date ? date.year + this.DELIMITER + date.month + this.DELIMITER + date.day : '';

    this.checkInDetails.CheckoutDate = new Date(formatedDate);
    this.LoadDate();
  }
  LoadDate() {
    let y = new Date(this.checkInDetails.CheckinDate).getFullYear();
    let mm = new Date(this.checkInDetails.CheckinDate).getMonth() + 1;
    let dat = this.datepipe.transform(this.checkInDetails.CheckinDate, 'dd');
    let d = Number(dat);

    this.dtOfferFrom = { year: y, month: mm, day: d };
    y = new Date(this.checkInDetails.CheckoutDate).getFullYear();
    mm = new Date(this.checkInDetails.CheckoutDate).getMonth() + 1;
    dat = this.datepipe.transform(this.checkInDetails.CheckoutDate, 'dd');
    d = Number(dat);

    this.dtOfferTo = { year: y, month: mm, day: d };

    this.getTimeDiff();
    // debugger;
    this.days = this.getDiffDays(this.checkInDetails.CheckinDate, this.checkInDetails.CheckoutDate);
    this.days = this.days == 0 ? this.days + 1 : this.days;
    this.roomRate = this.days * this.room.Rate;
    this.roomRate = this.checkInDetails.NoOfGuest > this.room.MaxBed ?
      (this.roomRate + (this.checkInDetails.NoOfGuest - this.room.MaxBed) * this.room.PricePerBed) : this.roomRate;
    this.roomRate = this.checkInDetails.NoOFChilds > this.room.NoOFChilds ?
      (this.roomRate + (this.checkInDetails.NoOFChilds - this.room.NoOFChilds) * this.room.ChildPricePerBed) : this.roomRate;
    this.TaxAmount = this.Taxpercent / 100 * (this.roomRate + this.extraHrsAmount);
    this.TotalAmount = (this.roomRate + this.extraHrsAmount) + this.TaxAmount;
    // debugger;
    let Allrate = (this.room.BreakFastRate + this.room.DinnerRate + this.room.LunchRate);
    this.extratext = "Food Provide";
    this.extraAmount = 0;
    if (this.checkInDetails.IsAllInclude == 1 || this.checkInDetails.IsAllInclude.toString() == "true") {
      this.extratext = " All Period ";
      this.extraAmount = (this.days * Allrate * (this.checkInDetails.NoOfGuest + this.checkInDetails.NoOFChilds));
      this.TotalAmount = this.TotalAmount + this.extraAmount;
      // this.checkInDetails.IsBreakFastIncluded = this.checkInDetails.IsDinnerInclude = this.checkInDetails.IsLunchInclude = 0;
    }
    if (this.checkInDetails.IsBreakFastIncluded == 1 || this.checkInDetails.IsBreakFastIncluded.toString() == "true") {
      this.TotalAmount = this.TotalAmount + (this.days * this.room.BreakFastRate * (this.checkInDetails.NoOfGuest + this.checkInDetails.NoOFChilds));
      this.extratext += " Breakfast ";
      this.extraAmount += (this.days * this.room.BreakFastRate * (this.checkInDetails.NoOfGuest + this.checkInDetails.NoOFChilds));
      // this.checkInDetails.IsAllInclude = 0;
    }
    if (this.checkInDetails.IsDinnerInclude == 1 || this.checkInDetails.IsDinnerInclude.toString() == "true") {
      this.TotalAmount = this.TotalAmount + (this.days * this.room.DinnerRate * (this.checkInDetails.NoOfGuest + this.checkInDetails.NoOFChilds));
      this.extratext += " Dinner ";
      this.extraAmount += (this.days * this.room.DinnerRate * (this.checkInDetails.NoOfGuest + this.checkInDetails.NoOFChilds));
      // this.checkInDetails.IsAllInclude = 0;
    }
    if (this.checkInDetails.IsLunchInclude == 1 || this.checkInDetails.IsLunchInclude.toString() == "true") {
      this.TotalAmount = this.TotalAmount + (this.days * this.room.LunchRate * (this.checkInDetails.NoOfGuest + this.checkInDetails.NoOFChilds));
      this.extratext += " Lunch ";
      this.extraAmount += (this.days * this.room.LunchRate * (this.checkInDetails.NoOfGuest + this.checkInDetails.NoOFChilds));
      // this.checkInDetails.IsAllInclude = 0;
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

}
