import { Component, OnInit } from "@angular/core";
import { h_customermaster } from "src/app/shared/models/h_customermaster.model";
import { Endpoint } from "src/app/shared/API/Endpoint.model";
import { DataserviceService } from "src/app/shared/dataservice/dataservice.service";
import { NgbDateParserFormatter, NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { CustomDatepickerService } from 'src/app/shared/dataservice/customdatepicker.service';
import { DatePipe } from "@angular/common";
import { ToasterPlacement } from "@coreui/angular";
@Component({
  selector: "app-member",
  templateUrl: "./member.component.html",
  styleUrls: ["./member.component.css"],
})
export class MemberComponent implements OnInit {
  public liveDemoVisible = false;
  constructor(private dtenv: DataserviceService, public formatter: NgbDateParserFormatter, public datepipe: DatePipe
    , private customDatepickerService: CustomDatepickerService) { }

  member = new h_customermaster();
  ImageFile: string = "/assets/images/dummy-image.png";
  countrylist: any = [];
  pincode_Address: any = [];
  stateList: any = [];
  districtList: any = [];
  citylist: any = [];
  countryName: string = "";
  bloodgrouplist: any = [];
  members: any = [];
  custDob = new Date();
  date: NgbDateStruct;
  DELIMITER = "/";
  isEdit: boolean = false;
  toasterText = "";
  toasterColor = "success";
  toasterShow = false;
  positionStatic = ToasterPlacement.Static;
  ngOnInit() {
    this.getdata();
    
  }
  getdata(): void {
    this.dtenv.get(Endpoint.getcountries)
      .subscribe((res: any) => {
        this.countrylist = res;
        console.log(this.countrylist);
      });
    this.dtenv.get(Endpoint.bloodgroup)
      .subscribe((res: any) => {
        this.bloodgrouplist = res;
      });
    this.dtenv.get(Endpoint.GetCustomers + "1")
      .subscribe((res: any[]) => {
        this.members = res;
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
        // this.citylist = res;
        this.member.Pincode = res[0].Pincode
        console.log(res);
      });
  }
  SaveEdit(): void {
    this.member.ClientID = 1;
    // this.member.CustomerId = 0;
    this.member.CustomerSecondName = ".";
    this.member.IsInActive = 0;
    this.member.ModifiedBy = 1;

    if (this.member.AllowDiscount.toString() == "true")
      this.member.AllowDiscount = 1;
    else this.member.AllowDiscount = 0;

    if (this.member.AllowOwnBooking.toString() == "true")
      this.member.AllowOwnBooking = 1;
    else this.member.AllowOwnBooking = 0;

    this.member.CustomerId;
    this.member.PassportNo = ".";
    this.member.Remarks = ".";
    this.member.emailId = ".";


    console.log(this.member);


    if (!this.isEdit) {
      this.dtenv.post(Endpoint.h_customermaster, this.member).subscribe
        ((res: h_customermaster) => {
          console.log(res);
          this.getdata();
          this.toasterShow = true;
          this.toasterColor = "success";
          this.toasterText = "Successfully Saved.";
          setTimeout(() => {
            this.toasterShow = false;
          }, 5000);
        });
    }
    else {
      this.dtenv.put(Endpoint.h_customermaster + "/" + this.member.CustomerId, this.member)
        .subscribe((res: h_customermaster) => {
          console.log(res);
          this.getdata();
          this.toasterShow = true;
          this.toasterColor = "success";
          this.toasterText = "Successfully Updated.";
          setTimeout(() => {
            this.toasterShow = false;
          }, 5000);
        });
      this.newmember();
    }
  }
  newmember() {
    this.member = new h_customermaster();
    this.custDob = new Date();
    let ChDate = new Date();
    let y = new Date(ChDate).getFullYear();
    let mm = new Date(ChDate).getMonth();
    let d = new Date(ChDate).getDay();
    this.date = { 'year': + y, 'month': mm, 'day': d };


  }

  toggleLiveDemo() {
    this.liveDemoVisible = !this.liveDemoVisible;
  }

  handleLiveDemoChange(event: boolean) {
    this.liveDemoVisible = event;
  }

  onDateSelect1(date: NgbDateStruct) {
    const formatedDate = date ? date.year + this.DELIMITER + date.month + this.DELIMITER + date.day : '';

    this.member.CustomerDOB = new Date(formatedDate);
  
  }
  ShowMember(): void {
    let date_Object: Date = this.member.CustomerDOB;
    const date_String = date_Object.getFullYear() +
      "-" +
      (date_Object.getMonth() + 1) +
      "-" +
      + date_Object.getDate();

    // convert string to ngb datepicker json format
    this.date = this.customDatepickerService.convertStringToJson(date_String, this.DELIMITER);
  }
  ShowData(memID: number): void {
    this.dtenv.get(Endpoint.h_customermaster + "/" + memID)
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
        this.isEdit = true;
      });

  }


}

