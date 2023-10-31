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
import { h_actualroomrate } from 'src/app/shared/models/h_actualroomrate.model';
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

  checkInDetails: HRoomallotment = new HRoomallotment();
  bookedvoucher = new HRoomallotment();
  timeCheckIn = { hour: 0, minute: 0 };
  timeCheckOut = { hour: 0, minute: 0 };
  customers: any = [];
  room: any;
  toasterText = "";
  toasterColor = "success";
  booked = new h_roombooking()
  toasterShow = false;
  BookingVouchers: any[] = [];
  roomtypes: any[] = [];
  ratelist: any[] = [];
  ratetypeID: number = 0;
  rateID: number = 0;
  positionStatic = ToasterPlacement.Static;
  countrylist: any[] = [];
  pincode_Address: any[] = [];
  stateList: any[] = [];
  districtList: any[] = [];
  citylist: any[] = [];
  countryName: string = "";
  member = new h_customermaster();
  date: NgbDateStruct;
  DELIMITER = "-";
  isEdit: boolean = false;
  Rooms: any = {};
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
  dateLists: any[] = [];
  room_details: any = {
    Rate: 0,
    extraPricePerBed: 0,
    extraChildPricePerBed: 0,
    extraBreakFastRate: 0,
    extraLunchRate: 0,
    extraDinnerRate: 0,
    extraSpecialDinnerRate: 0,
    taxpercent: 0,
    totalAmount: 0
  };

  editBookingVisible = false;
  checkInEditLists:HRoomallotment[] = [];
  toggleConfirmationModal: boolean = false;

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
        this.checkInDetails.RoomCode = this.bookedvoucher.RoomCode;

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
        if (y > 1980) {
          this.dob = { year: y, month: mm, day: d };
        }

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
        this.checkInDetails.City = this.member.City;
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
      .subscribe((res: any[]) => {
        if (res.length) {
          this.Rooms = res;
          if (this.Rooms.length && this.formatedInDate && this.formatedOutDate) {
            this.getRoomDetails();
          }
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
            taxpercent: 0,
            totalAmount: 0
          }
        }

        this.room_details = response.pop();

        const extraAduts = (this.room_details.MaxBed < this.checkInDetails.NoOfGuest) ? (this.checkInDetails.NoOfGuest - this.room_details.MaxBed) : 0;

        const extraChilds = (this.room_details.NoOFChilds < this.checkInDetails.NoOFChilds) ? (this.checkInDetails.NoOFChilds - this.room_details.NoOFChilds) : 0;

        this.room_details.extraPricePerBed = extraAduts * this.room_details.PricePerBed;
        this.room_details.extraChildPricePerBed = extraChilds * this.room_details.ChildPricePerBed;
        this.room_details.extraBreakFastRate = this.checkInDetails.IsBreakFastIncluded ? (this.room_details.MaxBed + this.room_details.NoOFChilds) * this.room_details.BreakFastRate : 0;
        this.room_details.extraLunchRate = this.checkInDetails.IsLunchInclude ? (this.room_details.MaxBed + this.room_details.NoOFChilds) * this.room_details.LunchRate : 0;
        this.room_details.extraDinnerRate = this.checkInDetails.IsDinnerInclude ? (this.room_details.MaxBed + this.room_details.NoOFChilds) * this.room_details.DinnerRate : 0;
        this.room_details.extraSpecialDinnerRate = 0;
        //  (extraAduts + extraChilds) * this.room_details.SpecialDinnerRate;

        this.room_details.totalAmount = this.room_details.extraPricePerBed + this.room_details.extraChildPricePerBed + this.room_details.extraBreakFastRate + this.room_details.extraLunchRate + this.room_details.extraDinnerRate + this.room_details.extraSpecialDinnerRate;
      });
  }

  calculateGuestPrice($event: any) {
    if ($event.target.value) {
      const noOfGuest = Number($event.target.value);
      this.room_details.totalAmount = this.room_details.totalAmount - this.room_details.extraPricePerBed;
      const extraAduts = (this.room_details.MaxBed < noOfGuest) ? (noOfGuest - this.room_details.MaxBed) : 0;
      this.room_details.extraPricePerBed = extraAduts * this.room_details.PricePerBed;
      this.room_details.totalAmount = this.room_details.totalAmount + this.room_details.extraPricePerBed;

    }
  }

  calculateChildPrice($event: any) {
    if ($event.target.value) {
      this.room_details.totalAmount = this.room_details.totalAmount - this.room_details.extraChildPricePerBed;
      const noOfChild = Number($event.target.value);
      const extraAduts = (this.room_details.NoOFChilds < noOfChild) ? (noOfChild - this.room_details.NoOFChilds) : 0;
      this.room_details.extraChildPricePerBed = extraAduts * this.room_details.ChildPricePerBed;
      this.room_details.totalAmount = this.room_details.totalAmount + this.room_details.extraChildPricePerBed;
    }
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

      this.loadTableByDates();
    } else if (type === "checkout") {
      this.checkInDetails.CheckoutDate = new Date(formatedDate);
      this.formatedOutDate = formatedDate;

      this.loadTableByDates();
    } else {
      this.checkInDetails.CustomerDOB = new Date(formatedDate);
    }

  }

  onDateInput(date: any, type: string) {
    if (type === "dob") {
      this.checkInDetails.CustomerDOB = new Date(date.target.value);
    } else if (type === "checkin") {
      this.checkInDetails.CheckinDate = new Date(date.target.value);
    } else if (type === "checkout") {
      this.checkInDetails.CheckoutDate = new Date(date.target.value);
    }
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

  clearData() {
    this.member = new h_customermaster();
    this.checkInDetails = new HRoomallotment();
    this.minDate = { year: 0, month: 0, day: 0 };
    this.minOutDate = { year: 0, month: 0, day: 0 };
    this.dob = { year: 0, month: 0, day: 0 };
    this.Fromdate = { year: 0, month: 0, day: 0 };
    this.Todate = { year: 0, month: 0, day: 0 };
    this.timeCheckIn = { hour: 0, minute: 0 };
    this.timeCheckOut = { hour: 0, minute: 0 };
    this.CheckinDate = "";
    this.CheckoutDate = "";
    this.selectedVoucher = "";
    this.dateLists = [];
    this.ratetypeID = 0;
    this.rateID = 0;
    this.room_details = {
      Rate: 0,
      extraPricePerBed: 0,
      extraChildPricePerBed: 0,
      extraBreakFastRate: 0,
      extraLunchRate: 0,
      extraDinnerRate: 0,
      extraSpecialDinnerRate: 0,
      taxpercent: 0,
      totalAmount: 0
    };
  }

  save() {

    if (!this.isEdit) {
      let dat = this.datepipe.transform(Date(), 'yyyy-MM-dd');
      this.dtenv.get(Endpoint.getvoucher + '1512/Check IN/' + dat)
        .subscribe((resvoc: any) => {
          this.checkInDetails.VoucherCode = resvoc[0].VoucherCode;
          this.checkInDetails.VoucherNo = resvoc[0].Voucherno;
          this.checkInDetails.RefVoucherNo = this.selectedVoucher;
          const ref_voucher = this.BookingVouchers.filter((voucher: any) => voucher.VoucherNo === this.selectedVoucher).pop();
          this.checkInDetails.RefVoucherCode = ref_voucher.VoucherCode;
          const CheckinTime = this.timeCheckIn.hour + ':' + this.timeCheckIn.minute + ':00';
          this.checkInDetails.CheckinTime = new Date(this.formatedInDate + ' ' + CheckinTime);
          this.checkInDetails.BookingDate = this.checkInDetails.CheckinDate;
          this.checkInDetails.BookingTime = this.checkInDetails.CheckinDate;

          const CheckoutTime = this.timeCheckOut.hour + ':' + this.timeCheckOut.minute + ':00';
          this.checkInDetails.CheckoutTime = new Date(this.formatedOutDate + ' ' + CheckoutTime);
          this.checkInDetails.ExpiryDate = this.checkInDetails.CheckoutDate;

          this.checkInDetails.ReservationMode = "CheckIN";
          this.checkInDetails.CustomerID = this.custID;
          this.checkInDetails.roomrates = [];

          if (!this.validateForm()) {
            return;
          }

          this.dateLists.forEach((data: any) => {
            const dateArray = data.date.split("-");
            const date = dateArray[2] + "-" + dateArray[1] + "-" + dateArray[0];
            const object = new h_actualroomrate();
            object.RoomId = Number(this.checkInDetails.RoomCode);
            object.PriceDate = new Date(date);
            object.RoomRate = this.room_details.Rate;
            object.IsLunchIncluded = this.checkInDetails.IsLunchInclude;
            object.IsDinnerIncluded = this.checkInDetails.IsDinnerInclude;
            object.IsSpecialDinnerIncluded = 0;
            object.IsBreakFastInclued = this.checkInDetails.IsBreakFastIncluded;
            object.BreakFastRate = this.checkInDetails.BreakFastRate;
            object.ConsumedBreakFastRate = this.room_details.extraBreakFastRate;
            object.LunchRate = this.checkInDetails.LunchRate;
            object.ConsumedLunchRate = this.room_details.extraLunchRate;
            object.DinnerRate = this.checkInDetails.DinnerRate;
            object.ConsumedDinnerRate = this.room_details.extraDinnerRate;
            object.SpecialDinnerRate = 0;
            object.ConsumedSpecialDinnerRate = 0;
            object.TaxAmount = this.checkInDetails.TaxAmount;
            object.ServiceChargeAmount = 0;
            object.IsRatePosted = 0;
            object.NetAmount = 0;
            object.TotalAmount = this.checkInDetails.TotalAmount;
            object.VoucherNo = this.checkInDetails.VoucherNo;
            object.VoucherCode = this.checkInDetails.VoucherCode;

            this.checkInDetails.roomrates.push(object);
          });

          this.dtenv.post(Endpoint.Roomallotment, this.checkInDetails)
            .subscribe((res: any) => {

              this.dtenv.get(Endpoint.updateVoucherno + this.checkInDetails.VoucherCode)
                .subscribe((res: any) => {

                  this.toasterShow = true;
                  this.toasterColor = "success";
                  this.toasterText = "Your Room Booked Sucessfuly, Our Wishes to Enjoy the Trip.";
                  setTimeout(() => {
                    this.toasterShow = false;
                    this.clearData();
                  }, 5000);
                });
            })
        });
    } else {
      this.checkInDetails.roomrates = [];
      const ref_voucher = this.BookingVouchers.filter((voucher: any) => voucher.VoucherNo === this.selectedVoucher).pop();
      this.checkInDetails.RefVoucherCode = ref_voucher.VoucherCode;

      this.dateLists.forEach((data: any) => {
        const dateArray = data.date.split("-");
        const date = dateArray[2] + "-" + dateArray[1] + "-" + dateArray[0];
        const object = new h_actualroomrate();
        object.RoomId = Number(this.checkInDetails.RoomCode);
        object.PriceDate = new Date(date);
        object.RoomRate = this.room_details.Rate;
        object.IsLunchIncluded = this.checkInDetails.IsLunchInclude;
        object.IsDinnerIncluded = this.checkInDetails.IsDinnerInclude;
        object.IsSpecialDinnerIncluded = 0;
        object.IsBreakFastInclued = this.checkInDetails.IsBreakFastIncluded;
        object.BreakFastRate = this.checkInDetails.BreakFastRate;
        object.ConsumedBreakFastRate = this.room_details.extraBreakFastRate;
        object.LunchRate = this.checkInDetails.LunchRate;
        object.ConsumedLunchRate = this.room_details.extraLunchRate;
        object.DinnerRate = this.checkInDetails.DinnerRate;
        object.ConsumedDinnerRate = this.room_details.extraDinnerRate;
        object.SpecialDinnerRate = 0;
        object.ConsumedSpecialDinnerRate = 0;
        object.TaxAmount = this.checkInDetails.TaxAmount;
        object.ServiceChargeAmount = 0;
        object.IsRatePosted = 0;
        object.NetAmount = 0;
        object.TotalAmount = this.checkInDetails.TotalAmount;
        object.VoucherNo = this.checkInDetails.VoucherNo;
        object.VoucherCode = this.checkInDetails.VoucherCode;

        this.checkInDetails.roomrates.push(object);
      });

      this.dtenv.put(Endpoint.Roomallotment + "/Updatecheckindetails", this.checkInDetails)
        .subscribe((res: any) => {
          this.isEdit = false;
          this.toasterShow = true;
          this.toasterColor = "info";
          this.toasterText = "Your Room Updated Sucessfuly, Our Wishes to Enjoy the Trip.";
          setTimeout(() => {
            this.toasterShow = false;
            this.clearData();
          }, 5000);
        })
    }
  }

  validateForm() {
    if (
      (this.checkInDetails.RefVoucherNo === "" && !this.checkInDetails.CustomerID) ||
      this.checkInDetails.VoucherNo === "" ||
      !this.checkInDetails.ClassID ||
      this.checkInDetails.RoomCode === "" ||
      !this.checkInDetails.BillTo ||
      !this.checkInDetails.CheckinDate ||
      !this.checkInDetails.CheckoutDate ||
      this.checkInDetails.CustomerFirstName === "" ||
      !this.checkInDetails.CountryId ||
      !this.checkInDetails.City ||
      this.checkInDetails.AddressLine1 === "" ||
      this.checkInDetails.PhoneNo === "" ||
      this.checkInDetails.emailId === "" ||
      !this.checkInDetails.PricePreBed ||
      !this.checkInDetails.NoOfGuest ||
      !this.checkInDetails.ChildPricePerBed ||
      !this.checkInDetails.NoOFChilds
    ) {
      this.toasterShow = true;
      this.toasterColor = "danger";
      this.toasterText = "Kindly fill all required fields.";
      setTimeout(() => {
        this.toasterShow = false;
      }, 5000);
      return false;
    }

    return true;
  }

  editBookingModel() {
    this.dtenv.get(Endpoint.Roomallotment + "/checkindetails")
      .subscribe((res: any) => {
        this.checkInEditLists = res;
        this.editBookingVisible = !this.editBookingVisible;
      });
  }

  updateDetails(data: any) {
    this.editBookingVisible = !this.editBookingVisible;
    this.isEdit = true;
    this.dateLists = [];
    this.checkInDetails = data;
    this.checkInDetails.CheckinDate = new Date(this.checkInDetails.CheckinDate);
    this.checkInDetails.CheckoutDate = new Date(this.checkInDetails.CheckoutDate);
    this.checkInDetails.RoomCode = this.checkInDetails.RoomCode;
    this.selectedVoucher = this.checkInDetails.RefVoucherNo;

    this.ratetypeID = this.checkInDetails.ClassID;
    if (this.ratetypeID) {
      this.GetRateTypes();
    }
    this.rateID = Number(this.checkInDetails.RoomCode);
    if (this.rateID && this.ratetypeID) {
      this.LoadRooms();
    }
    if (this.checkInDetails.CountryId) {
      this.member.Country = this.checkInDetails.CountryId.toString();
      this.getstates();
    }

    let y = new Date(this.checkInDetails.CheckinDate).getFullYear();
    let mm = new Date(this.checkInDetails.CheckinDate).getMonth() + 1;
    let dat = this.datepipe.transform(this.checkInDetails.CheckinDate, 'dd');
    let d = Number(dat);
    this.Fromdate = { year: y, month: mm, day: d };

    y = new Date(this.checkInDetails.CheckoutDate).getFullYear();
    mm = new Date(this.checkInDetails.CheckoutDate).getMonth() + 1;
    dat = this.datepipe.transform(this.checkInDetails.CheckoutDate, 'dd');
    d = Number(dat);
    this.Todate = { year: y, month: mm, day: d };

    y = new Date(this.checkInDetails.CustomerDOB).getFullYear();
    mm = new Date(this.checkInDetails.CustomerDOB).getMonth() + 1;
    dat = this.datepipe.transform(this.checkInDetails.CustomerDOB, 'dd');
    d = Number(dat);
    if (y > 1980) {
      this.dob = { year: y, month: mm, day: d };
    }

    dat = this.datepipe.transform(this.checkInDetails.CheckinDate, 'dd');
    this.formatedInDate = this.checkInDetails.CheckinDate ? this.checkInDetails.CheckinDate.getFullYear() + this.DELIMITER + (this.checkInDetails.CheckinDate.getMonth() + 1) + this.DELIMITER + Number(dat) : '';

    dat = this.datepipe.transform(this.checkInDetails.CheckoutDate, 'dd');
    this.formatedOutDate = this.checkInDetails.CheckoutDate ? this.checkInDetails.CheckoutDate.getFullYear() + this.DELIMITER + (this.checkInDetails.CheckoutDate.getMonth() + 1) + this.DELIMITER + Number(dat) : '';

    this.timeCheckIn = {
      hour: new Date(this.checkInDetails.CheckinTime).getHours(),
      minute: new Date(this.checkInDetails.CheckinTime).getMinutes()
    };
    this.timeCheckOut = {
      hour: new Date(this.checkInDetails.CheckoutTime).getHours(),
      minute: new Date(this.checkInDetails.CheckoutTime).getMinutes()
    };

    if (this.checkInDetails.CheckinDate && this.checkInDetails.CheckoutDate) {
      this.loadTableByDates();
    }
  }

  toggleConfirmation() {
    if (!this.checkInDetails.VoucherNo) {
      return;
    }
    this.toggleConfirmationModal = !this.toggleConfirmationModal;
  }

  deleteBooking() {
    console.log(this.checkInDetails);
    this.dtenv.put(Endpoint.Roomallotment + "/Deletecheckindetails", this.checkInDetails)
      .subscribe((res: any) => {
        this.toasterShow = true;
        this.toasterColor = "success";
        this.toasterText = "Your Booking Deleted Sucessfuly.";
        setTimeout(() => {
          this.toasterShow = false;
          this.clearData();
        }, 5000);
      });
  }
}
