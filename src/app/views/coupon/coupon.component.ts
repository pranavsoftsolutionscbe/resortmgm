import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ToasterPlacement } from "@coreui/angular";
import { NgbDateParserFormatter, NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { Endpoint } from "src/app/shared/API/Endpoint.model";
import { CustomDatepickerService } from "src/app/shared/dataservice/customdatepicker.service";
import { DataserviceService } from "src/app/shared/dataservice/dataservice.service";
import { SearchDataService } from "src/app/shared/dataservice/searchdata.service";
import { CouponMaster } from "src/app/shared/models/coupon-master.model";
import { HRatetypemaster } from "src/app/shared/models/h-ratetypemaster.model";

@Component({
  selector: "app-coupon",
  templateUrl: "./coupon.component.html",
  styleUrls: ["./coupon.component.css"],
})
export class CouponComponent implements OnInit {
  constructor(private dtenv: DataserviceService, public formatter: NgbDateParserFormatter
    , private custdate: CustomDatepickerService, public datepipe: DatePipe,
    private searchService: SearchDataService) { }
  coupons: any[];

  filtedMembers = [];
  toasterText = "";
  toasterColor = "success";
  toasterShow = false;
  positionStatic = ToasterPlacement.Static;
  isEdit: boolean = false;
  coupon = new CouponMaster();
  coupon_lists: any[] = [];
  rate_lists: any[] = [];
  account_lists: any[] = [];
  toggleConfirmationModal: boolean = false;
  deletingCouponId: number = 0;
  checkin_date: NgbDateStruct;
  checkout_date: NgbDateStruct;
  minDate = { year: 0, month: 0, day: 0 };
  DELIMITER = "/";
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
  ngOnInit() {
    this.getdata();
    const currentDate = Date();
    const y = new Date(currentDate).getFullYear();
    const mm = new Date(currentDate).getMonth() + 1;
    const dat = this.datepipe.transform(currentDate, 'dd');
    const d = Number(dat);
    this.minDate = { year: y, month: mm, day: d };
  }

  search(event: any) {
    const keyword = event.target.value;
    this.filtedMembers = this.searchService.filterMembers(this.coupons, keyword);
  }
  ShowCoupon(coupId: number): void {

    this.coupon = this.coupon_lists.filter((cp: { CouponID: number; }) => cp.CouponID == coupId)[0];
    console.log(this.coupon);

    let fdate = new Date(this.coupon.FromDate);
    console.log(fdate)
    let y = new Date(this.coupon.FromDate).getFullYear();
    let mm = new Date(this.coupon.FromDate).getMonth() + 1;
    let dat = this.datepipe.transform(this.coupon.FromDate, 'dd');
    let d = Number(dat);


    this.checkin_date = { year: y, month: mm, day: d };
    y = new Date(this.coupon.ToDate).getFullYear();
    mm = new Date(this.coupon.ToDate).getMonth() + 1;
    dat = this.datepipe.transform(this.coupon.ToDate, 'dd');
    d = Number(dat);
    this.checkout_date = { year: y, month: mm, day: d };
    this.isEdit = true;
  }
  getdata(): void {
    this.dtenv.get(Endpoint.h_couponratetypemaster).subscribe((res: any[]) => { this.coupon_lists = res; });
    this.dtenv.get(Endpoint.GetRoomTypes + "1").subscribe((res: any[]) => { this.rate_lists = res; });
    this.dtenv.get(Endpoint.h_linkedaccounts).subscribe((res: any[]) => { this.account_lists = res; });
  }
  saveEdit(): void {
    if (!this.isEdit) {
      this.coupon.CouponID = 1;
      this.coupon.TaxIncluded = this.coupon.TaxIncluded ? 1 : 0;
      this.coupon.IsBreakFastInclued = this.coupon.IsBreakFastInclued ? 1 : 0;
      this.coupon.IsLunchIncluded = this.coupon.IsLunchIncluded ? 1 : 0;
      this.coupon.IsDinnerIncluded = this.coupon.IsDinnerIncluded ? 1 : 0;
      this.coupon.IsSpecialDinnerIncluded = this.coupon.IsSpecialDinnerIncluded ? 1 : 0;
      this.coupon.ServiceChargeIncluded = this.coupon.ServiceChargeIncluded ? 1 : 0;
      this.dtenv.post(Endpoint.h_couponratetypemaster, this.coupon)
        .subscribe((res: CouponMaster) => {
          this.coupon = res;
          this.toasterShow = true;
          this.toasterColor = "success";
          this.toasterText = "Successfully coupon created.";
          setTimeout(() => {
            this.toasterShow = false;
          }, 5000);

          this.coupon = new CouponMaster();
          this.getdata();
        });
    } else {
      this.isEdit = !this.isEdit;
      this.dtenv.put(Endpoint.h_couponratetypemaster + "/" + this.coupon.CouponID, this.coupon)
        .subscribe((res: CouponMaster) => {
          this.coupon = new CouponMaster();
          this.toasterShow = true;
          this.toasterColor = "info";
          this.toasterText = "Successfully coupon updated.";
          setTimeout(() => {
            this.toasterShow = false;
          }, 5000);
        });


    }
  }

  rateChanged() {

    // if (this.coupon.RateName) {
    //   const rate = this.rate_lists.filter((rate: HRatetypemaster) => rate.RateType === this.coupon.RateName).pop();
    //   this.dtenv.get(Endpoint.h_ratetypemaster + "/" + rate.RateId).subscribe((res: any) => {
    //     this.coupon.RoomRate = res.Rate;
    //   });
    // }
    this.coupon.RoomRate = 2000;
    console.log(this.coupon);
  }

  editCoupon(couponId?: number) {
    this.isEdit = true;
    this.coupon = this.coupon_lists.filter((coupon: CouponMaster) => coupon.CouponID === Number(couponId)).pop();
  }

  toggleConfirmation() {
    this.toggleConfirmationModal = !this.toggleConfirmationModal;
  }

  deleteCoupon() {
    this.dtenv.Delete(Endpoint.h_couponratetypemaster + "/" + this.deletingCouponId)
      .subscribe((res: CouponMaster) => {
        this.deletingCouponId = 0;
        this.toggleConfirmation();
        this.toasterShow = true;
        this.toasterColor = "success";
        this.toasterText = "Coupon successfully deleted.";
        setTimeout(() => {
          this.toasterShow = false;
          this.resetCouponData();
        }, 3000);
      });
  }

  resetCouponData() {
    this.coupon = new CouponMaster();
    this.checkin_date = this.minDate;
    this.checkout_date = this.minDate;
    this.getdata();
  }
  onDateSelect(date: NgbDateStruct, type: string) {
    const formatedDate = { year: date.year, month: date.month, day: date.day };


    if (type === "from-date") {
      this.searchData.checkInDate = formatedDate;
      const formatedCheckInDate = this.searchData.checkInDate ? this.searchData.checkInDate.year + this.DELIMITER + this.searchData.checkInDate.month + this.DELIMITER + this.searchData.checkInDate.day : '';
      this.coupon.FromDate = new Date(formatedCheckInDate)
    } else {
      const formatedCheckInDate = this.searchData.checkInDate ? this.searchData.checkInDate.year + this.DELIMITER + this.searchData.checkInDate.month + this.DELIMITER + this.searchData.checkInDate.day : '';
      this.searchData.checkOutDate = formatedDate;
      this.coupon.ToDate = new Date(formatedCheckInDate)
    }
  }
  gettotalAmount(): void {
    this.coupon.TotalRate = (this.coupon.IsBreakFastInclued.toString() == "true" ? this.coupon.BreakFastRate : 0)
      + this.coupon.LunchRate + this.coupon.DinnerRate;

  }
}
