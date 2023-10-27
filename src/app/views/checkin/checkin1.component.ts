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
  formatedInDate: string;
  formatedOutDate: string;
  constructor(private dtenv: DataserviceService, public formatter: NgbDateParserFormatter, private customDatepickerService: CustomDatepickerService, private route: Router, private activatedRoute: ActivatedRoute,
    private domSanitizer: DomSanitizer, public datepipe: DatePipe) { }

  checkInDetails = new HRoomallotment();
  bookedvoucher = new HRoomallotment();
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
  DELIMITER = "-";
  isEdit: boolean = false;
  Rooms: any = [];
  custID: number = 0;
  user_id = Number(localStorage.getItem("user_id"));
  days: number = 0;
  dateformate = "EE dd-MM-yyyy";
  dtOfferFrom: NgbDateStruct;
  dtOfferTo: NgbDateStruct;
  Fromdate: NgbDateStruct | null;
  Todate: NgbDateStruct | null;
  dob: NgbDateStruct;
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
  minOutDate = { year: 0, month: 0, day: 0 };
  CheckinDate: any = "";
  CheckoutDate: any = "";
  dateLists: any = [];
  room_details: any = {
    Rate: 0,
    extraPricePerBed: 0,
    extraChildPricePerBed: 0,
    extraBreakFastRate: 0,
    extraLunchRate: 0,
    extraDinnerRate: 0,
    extraSpecialDinnerRate: 0,
    taxpercent: 0,

  };

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
    this.custID = 0;
    // this.searchData.checkInTime = this.booked.CheckinTime; //= JSON.parse(data);
    // this.searchData.checkOutTime = this.booked.CheckoutTime;

    let vocno = this.BookingVouchers.filter((bk: { VoucherNo: string; }) => bk.VoucherNo == this.selectedVoucher)[0].VoucherCode;

    let voucher = {

      "CountryId": vocno,
      "CountryName": this.selectedVoucher
    };

    this.dtenv.put(Endpoint.GetBookedVoucherdetail, voucher)
      .subscribe((res: any) => {
        this.bookedvoucher = res.pop();
        this.dateLists = [];
        this.isEdit = false;
        this.checkInDetails = this.bookedvoucher;
        this.checkInDetails.CheckinDate = new Date(this.bookedvoucher.CheckinDate);
        this.checkInDetails.CheckoutDate = new Date(this.bookedvoucher.CheckoutDate);
        this.Rooms.RoomId = this.bookedvoucher.RoomCode;

        this.ratetypeID = this.bookedvoucher.ClassID;
        if (this.ratetypeID) {
          this.GetRateTypes();
        }
        this.rateID = Number(this.bookedvoucher.RoomCode);
        if (this.rateID && this.ratetypeID) {
          this.LoadRooms();
        }
        if (this.checkInDetails.CountryId) {
          this.member.Country = this.bookedvoucher.CountryId.toString();
          this.getstates();
        }

        let y = new Date(this.bookedvoucher.CheckinDate).getFullYear();
        let mm = new Date(this.bookedvoucher.CheckinDate).getMonth() + 1;
        let dat = this.datepipe.transform(this.bookedvoucher.CheckinDate, 'dd');
        let d = Number(dat);
        this.Fromdate = { year: y, month: mm, day: d };

        y = new Date(this.bookedvoucher.CheckoutDate).getFullYear();
        mm = new Date(this.bookedvoucher.CheckoutDate).getMonth() + 1;
        dat = this.datepipe.transform(this.bookedvoucher.CheckoutDate, 'dd');
        d = Number(dat);
        this.Todate = { year: y, month: mm, day: d };

        y = new Date(this.bookedvoucher.CustomerDOB).getFullYear();
        mm = new Date(this.bookedvoucher.CustomerDOB).getMonth() + 1;
        dat = this.datepipe.transform(this.bookedvoucher.CustomerDOB, 'dd');
        d = Number(dat);
        this.dob = { year: y, month: mm, day: d };

        this.searchData.checkInDate = this.Fromdate;
        this.searchData.checkOutDate = this.Todate;

        dat = this.datepipe.transform(this.bookedvoucher.CheckinDate, 'dd');
        this.formatedInDate = this.checkInDetails.CheckinDate ? this.checkInDetails.CheckinDate.getFullYear() + this.DELIMITER + (this.checkInDetails.CheckinDate.getMonth() + 1) + this.DELIMITER + Number(dat) : '';

        dat = this.datepipe.transform(this.bookedvoucher.CheckoutDate, 'dd');
        this.formatedOutDate = this.checkInDetails.CheckoutDate ? this.checkInDetails.CheckoutDate.getFullYear() + this.DELIMITER + (this.checkInDetails.CheckoutDate.getMonth() + 1) + this.DELIMITER + Number(dat) : '';

        this.timeCheckIn = {
          hour: new Date(this.bookedvoucher.CheckinTime).getHours(),
          minute: new Date(this.bookedvoucher.CheckinTime).getMinutes()
        };
        this.timeCheckOut = {
          hour: new Date(this.bookedvoucher.CheckoutTime).getHours(),
          minute: new Date(this.bookedvoucher.CheckoutTime).getMinutes()
        };

        if (this.checkInDetails.CheckinDate && this.checkInDetails.CheckoutDate) {
          this.loadTableByDates();
        }
      });
  }
  GetRateTypes(): void {
    this.dtenv.get(Endpoint.GetRateTypeList + "1")
      .subscribe((res: any) => {
        this.ratelist = res.filter((rt: { RoomTypeID: number; }) => rt.RoomTypeID == this.ratetypeID);
      })
  }
  ShowData(memID: number): void {
    this.selectedVoucher = "";
    this.dtenv.get(Endpoint.h_customermaster + "/" + memID)
      .subscribe((res: h_customermaster) => {
        this.member = res;
        let y = new Date(this.member.CustomerDOB).getFullYear();
        let mm = new Date(this.member.CustomerDOB).getMonth() + 1;
        let dat = this.datepipe.transform(this.member.CustomerDOB, 'dd');
        let d = Number(dat);
        this.dob = { year: y, month: mm, day: d };
        this.getstates();
        this.getDistrict();
        this.getCity();
        this.getPincode();
        this.isEdit = false;
        this.checkInDetails = new HRoomallotment();
        this.checkInDetails.CustomerFirstName = this.member.CustomerFirstName;
        this.checkInDetails.CustomerSecondName = this.member.CustomerSecondName;
        this.checkInDetails.AddressLine1 = this.member.AddressLine1;
        this.checkInDetails.AddressLine2 = this.member.AddressLine2;
        this.checkInDetails.PhoneNo = this.member.PhoneNo;
        this.checkInDetails.PassportNo = this.member.PassportNo;
        this.checkInDetails.CountryId = Number(this.member.Country);
        this.checkInDetails.emailId = this.member.emailId;
        this.checkInDetails.CityId = this.member.City;
        this.checkInDetails.EmergencyNo = this.member.EmergencyContact;
        this.Fromdate = null;
        this.Todate = null;
        this.timeCheckIn = { hour: 0, minute: 0 };
        this.timeCheckOut = { hour: 0, minute: 0 };
        this.dateLists = [];
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
    this.checkInDetails.CountryId = Number(this.member.Country);
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
        this.member.Pincode = res[0].Pincode;
      });
  }

  LoadRooms(): void {
    this.dtenv.get(Endpoint.GetRoomstobook + this.rateID + '/' + this.ratetypeID)
      .subscribe((res: any) => {
        this.Rooms = res.pop();
        if (this.Rooms && this.formatedInDate && this.formatedOutDate) {
          this.getRoomDetails();
        }
      });
  }
  private getRoomDetails() {
    this.dtenv.get(Endpoint.gettoBookRoom + "1/" + this.user_id + "/" + this.formatedInDate + "/" + this.formatedOutDate)
      .subscribe((response: any) => {
        if (!response.length) {
          this.room_details = {
            Rate: 0,
            extraPricePerBed: 0,
            extraChildPricePerBed: 0,
            extraBreakFastRate: 0,
            extraLunchRate: 0,
            extraDinnerRate: 0,
            extraSpecialDinnerRate: 0,
            taxpercent: 0
          }
        }

        this.room_details = response.pop();

        const extraAduts = (this.room_details.MaxBed < this.checkInDetails.NoOfGuest) ? (this.checkInDetails.NoOfGuest - this.room_details.MaxBed) : 0;

        const extraChilds = (this.room_details.NoOFChilds < this.checkInDetails.NoOFChilds) ? (this.checkInDetails.NoOFChilds - this.room_details.NoOFChilds) : 0;

        this.room_details.extraPricePerBed = extraAduts * this.room_details.PricePerBed;
        this.room_details.extraChildPricePerBed = extraChilds * this.room_details.ChildPricePerBed;
        this.room_details.extraBreakFastRate = (extraAduts + extraChilds) * this.room_details.BreakFastRate;
        this.room_details.extraLunchRate = (extraAduts + extraChilds) * this.room_details.LunchRate;
        this.room_details.extraDinnerRate = (extraAduts + extraChilds) * this.room_details.DinnerRate;
        this.room_details.extraSpecialDinnerRate = (extraAduts + extraChilds) * this.room_details.SpecialDinnerRate;
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

  onDateSelect(date: NgbDateStruct, type: string) {
    const formatedDate = date ? date.year + this.DELIMITER + date.month + this.DELIMITER + date.day : '';
    if (type === "checkin") {
      this.checkInDetails.CheckinDate = new Date(formatedDate);
      this.formatedInDate = formatedDate;
      this.minOutDate = { year: date.year, month: date.month, day: date.day };
    } else if (type === "checkout") {
      this.checkInDetails.CheckoutDate = new Date(formatedDate);
      this.formatedOutDate = formatedDate;
    } else {
      this.checkInDetails.CustomerDOB = new Date(formatedDate);
    }

    this.loadTableByDates();
  }

  private loadTableByDates() {
    if (this.checkInDetails.CheckinDate && this.checkInDetails.CheckoutDate) {

      this.getRoomDetails();

      const dates = this.getDates(this.checkInDetails.CheckinDate, this.checkInDetails.CheckoutDate);
      if (dates.length) {
        this.dateLists = [];
        dates.forEach((date, index) => {
          this.dateLists[index] = {
            date: this.datepipe.transform(date, 'dd-MM-yyyy')
          };
        });
      }
    }
  }

  getDates(currentDate: Date, endDate: Date) {
    const dates = [];

    while (currentDate <= endDate) {
      dates.push(currentDate);

      currentDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() + 1, // Will increase month if over range
      );
    }

    return dates;
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
    this.roomRate = this.days * this.room?.Rate;
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
