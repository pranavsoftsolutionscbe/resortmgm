import { Component, OnInit } from "@angular/core";
import { HRatetypemaster } from "src/app/shared/models/h-ratetypemaster.model";
import { h_seasonrate } from "src/app/shared/models/h_seasonrate.model";
import { Endpoint } from "src/app/shared/API/Endpoint.model";
import { DataserviceService } from "src/app/shared/dataservice/dataservice.service";

import { NgbDateParserFormatter, NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { CustomDatepickerService } from 'src/app/shared/dataservice/customdatepicker.service';
import { RoomType } from "src/app/shared/models/room_type.model";
import { DatePipe } from "@angular/common";
import { SidebarFooterComponent, ToasterPlacement } from "@coreui/angular";
@Component({

  selector: "app-rate-type",
  templateUrl: "./rate-type.component.html",
  styleUrls: ["./rate-type.component.css"],
})
export class RateTypeComponent implements OnInit {
  constructor(private dtenv: DataserviceService, public formatter: NgbDateParserFormatter
    , public datepipe: DatePipe, private customDatepickerService: CustomDatepickerService) { }

  rateType = new HRatetypemaster();
  seasonrate = new h_seasonrate();
  seasonrates: h_seasonrate[] = [];
  roomtypes: any[] = [];
  ratetypelst: any[] = [];
  taxtypes: any = [];
  taxrates: any = [];
  Fromdate: NgbDateStruct;
  Todate: NgbDateStruct;
  DELIMITER = "/";
  dateformate = "dd-MM-yyyy";
  toasterText = "";
  toasterColor = "success";
  toasterShow = false;
  positionStatic = ToasterPlacement.Static;
  isEdit: boolean = false;
  isSeasonEdit: boolean = false;
  taxtypeID: number = 0;
  taxDescr: string = "";
  taxper: string = " %";
  toggleConfirmationModal: boolean = false;
  ngOnInit() {
    this.getData();
  }
  getData(): void {
    this.dtenv.get(Endpoint.GetRoomTypes + 1)
      .subscribe((res: any[]) => {
        this.roomtypes = res;
        console.log(this.roomtypes);
      });
    this.dtenv.get(Endpoint.GetRateTypeList + 1)
      .subscribe((res: any[]) => {
        this.ratetypelst = res;
        console.log(this.ratetypelst);
      });
    this.dtenv.get(Endpoint.gettaxtype + "1512")
      .subscribe((res: any) => {
        this.taxtypes = res;
      });
  }
  SaveEdit(): void {
    // this.rateType.RateId = 2;
    // this.rateType.FromDate = new Date();
    // this.rateType.ToDate = new Date();
    this.rateType.ClientID = 1;
    this.rateType.ModifiedBy = 1;
    this.rateType.IsInActive = 0;
    if (!this.isEdit) {
      console.log(this.rateType);


      this.dtenv.post(Endpoint.h_ratetypemaster, this.rateType)
        .subscribe((res: HRatetypemaster) => {
          this.rateType = res;
          console.log(res);
          this.getData();
          this.toasterShow = true;
          this.toasterColor = "success";
          this.toasterText = "Successfully Rate Type Saved.";
          setTimeout(() => {
            this.toasterShow = false;
          }, 5000);
          this.newratetype();
        }
        );
    }
    else {

      this.dtenv.put(Endpoint.h_ratetypemaster + "/" + this.rateType.RateId, this.rateType)
        .subscribe((res: HRatetypemaster) => {
          this.rateType = res;
          console.log(res);
          this.getData();
          this.toasterShow = true;
          this.toasterColor = "info";
          this.toasterText = "Successfully Rate Type Saved.";
          setTimeout(() => {
            this.toasterShow = false;
          }, 5000);
          this.newratetype();
        }
        );
    }
  }
  SaveEditSeason(): void {

    if (!this.isSeasonEdit) {
      this.seasonrate.RateId = this.seasonrate.SeasonID = this.rateType.RateId;
      console.log(this.seasonrate);

      this.seasonrate.SeasonID = 0;

      this.dtenv.post(Endpoint.h_seasonrate, this.seasonrate)
        .subscribe((res: h_seasonrate) => {
          this.seasonrate = new h_seasonrate();

          console.log(res);
          this.dtenv.get(Endpoint.Getseasonratelist + this.rateType.RateId)
            .subscribe((res: h_seasonrate[]) => {
              this.seasonrates = res;
              this.toasterShow = true;
              this.toasterColor = "success";
              this.toasterText = "Successfully Season Saved.";
              setTimeout(() => {
                this.toasterShow = false;
              }, 5000);
            });
          this.isSeasonEdit = false;
          this.getData();
        }
        );
    }
    else {
      this.seasonrate.RateId = this.rateType.RateId;
      this.dtenv.put(Endpoint.h_seasonrate + "/" + this.seasonrate.SeasonID, this.seasonrate)
        .subscribe((res: h_seasonrate) => {
          this.seasonrate = res;
          console.log(res);
          this.dtenv.get(Endpoint.Getseasonratelist + this.rateType.RateId)
            .subscribe((res: h_seasonrate[]) => {
              this.seasonrates = res;
              this.toasterShow = true;
              this.toasterColor = "info";
              this.toasterText = "Successfully Season Updated.";
              setTimeout(() => {
                this.toasterShow = false;
              }, 5000);
            });
          this.seasonrate = new h_seasonrate();
          this.isSeasonEdit = false;
          this.getData();
        }
        );
    }

  }
  newratetype(): void {
    this.rateType = new HRatetypemaster();
    this.rateType.IsInActive = 0;
    this.isEdit = this.isSeasonEdit = false;
  }

  onDateSelectFrom(date: NgbDateStruct) {
    const formatedDate = date ? date.year + this.DELIMITER + date.month + this.DELIMITER + date.day : '';

    this.seasonrate.FromDate = new Date(formatedDate);
  }

  onDateSelectTo(date: NgbDateStruct) {
    const formatedDate = date ? date.year + this.DELIMITER + date.month + this.DELIMITER + date.day : '';

    this.seasonrate.ToDate = new Date(formatedDate);
  }
  onEdit(rateid: number): void {

    this.taxtypeID = 0;
    this.taxDescr = "";
    this.taxper = "%";
    this.dtenv.get(Endpoint.h_ratetypemaster + "/" + rateid)
      .subscribe((res: HRatetypemaster) => {
        this.rateType = res;
        this.isEdit = true;
        let taxratedetail;

        this.dtenv.get(Endpoint.showtaxratedetail + this.rateType.IsTaxInclusive)
          .subscribe((res: any) => {
            taxratedetail = res[0];
            this.taxtypeID = taxratedetail.TaxTypeID;
            this.taxDescr = taxratedetail.TaxRateDescription;
            this.taxper = taxratedetail.TaxRate;
            this.loadTaxrates();

          })
      });
    this.dtenv.get(Endpoint.Getseasonratelist + rateid)
      .subscribe((res: h_seasonrate[]) => {
        this.seasonrates = res;
      })

  }
  showSeason(sid: number): void {
    // this.ratelist = res.filter((rt: { RoomTypeID: number; }) => rt.RoomTypeID == this.bulding.ClassId);
    let srates: any = this.seasonrates;
    let srate = srates.filter((srat: { SeasonID: number; }) => srat.SeasonID == sid);
    this.seasonrate = srate[0];
    let y = new Date(this.seasonrate.FromDate).getFullYear();
    let mm = new Date(this.seasonrate.FromDate).getMonth() + 1;
    let dat = this.datepipe.transform(this.seasonrate.FromDate, 'dd');
    let d = Number(dat);


    this.Fromdate = { year: y, month: mm, day: d };
    y = new Date(this.seasonrate.ToDate).getFullYear();
    mm = new Date(this.seasonrate.ToDate).getMonth() + 1;
    dat = this.datepipe.transform(this.seasonrate.ToDate, 'dd');
    d = Number(dat);
    this.Todate = { year: y, month: mm, day: d };
    this.isSeasonEdit = true;
    console.log(this.seasonrate);

  }
  loadTaxrates(): void {
    this.dtenv.get(Endpoint.gettaxtyperates + "1512/" + this.taxtypeID)
      .subscribe((res: any) => {
        this.taxrates = res;

      });

  }
  showTaxRateDetails(): void {

    let taxrate = this.taxrates.filter((rat: { TaxRateID: number; }) => rat.TaxRateID == this.rateType.IsTaxInclusive)[0];
    this.taxDescr = taxrate.TaxRateDescription;
    this.taxper = taxrate.TaxRate + " %";
  }
  toggleConfirmation() {
    this.toggleConfirmationModal = !this.toggleConfirmationModal;
  }
  deleteData(): void {
    this.toggleConfirmation();
    this.dtenv.Delete(Endpoint.h_ratetypemaster + "/" + this.rateType.RateId)
      .subscribe((res: any) => {

        this.toasterShow = true;
        this.toasterColor = "warning";
        this.toasterText = "Coupon successfully deleted.";
        setTimeout(() => {
          this.toasterShow = false;
          this.newratetype();
          this.getData()
        }, 3000);
      })
  }
}
