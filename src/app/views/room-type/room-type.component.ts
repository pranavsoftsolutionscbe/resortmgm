import { Component, OnInit } from "@angular/core";
import { RoomType } from "src/app/shared/models/room_type.model";
import { Endpoint } from "src/app/shared/API/Endpoint.model";
import { DataserviceService } from "src/app/shared/dataservice/dataservice.service";

import { NgbDateParserFormatter, NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { CustomDatepickerService } from 'src/app/shared/dataservice/customdatepicker.service';
import { ToasterPlacement } from "@coreui/angular";
import { SearchDataService } from "src/app/shared/dataservice/searchdata.service";
import { DatePipe } from "@angular/common";
import { isNumber } from "@ng-bootstrap/ng-bootstrap/util/util";
@Component({
  selector: "app-room-type",
  templateUrl: "./room-type.component.html",
  styleUrls: ["./room-type.component.css"],
})
export class RoomTypeComponent implements OnInit {
  constructor(private dtenv: DataserviceService, public formatter: NgbDateParserFormatter
    , private custdate: CustomDatepickerService, public datepipe: DatePipe,
    private searchService: SearchDataService) { }

  roomType = new RoomType();
  dateformate = "dd-MM-yyyy";
  dtOfferFrom: NgbDateStruct;
  dtOfferTo: NgbDateStruct;
  DELIMITER = "/";
  toasterText = "";
  toasterColor = "success";
  toasterShow = false;
  positionStatic = ToasterPlacement.Static;
  filtedMembers = [];
  roomtypes: any = [];
  members = [];
  isedit: boolean = false;
  toggleConfirmationModal: boolean = false;
  ngOnInit() {
    this.getdata();
  }
  getdata(): void {

    this.dtenv.get(Endpoint.GetallRoomTypes + "1")
      .subscribe((res: any) => {
        this.roomtypes = res;
        this.filtedMembers = res;
      }
      );
    
    this.newRoomType();
  }

  SaveEdit(): void {
    // this.roomType.RoomTypeID = 0;
    console.log(this.roomType);

    this.roomType.ClientID = 1;

    if (this.roomType.available_to_agent.toString() == "true")
      this.roomType.available_to_agent = 1;
    else if (this.roomType.available_to_agent.toString() == "false")
      this.roomType.available_to_agent = 0;

    if (this.roomType.IsOfferAvail.toString() == "true" || this.roomType.IsOfferAvail.toString() == "1")
      this.roomType.IsOfferAvail = 1;
    else if (this.roomType.IsOfferAvail.toString() == "false")
      this.roomType.IsOfferAvail = 0;

    if (this.roomType.Active.toString() == "true")
      this.roomType.Active = 1;
    else if (this.roomType.Active.toString() == "false")
      this.roomType.Active = 0;


    console.log(this.roomType)
    if (!this.isedit) {
      this.dtenv.post(Endpoint.h_roomtype, this.roomType).subscribe
        ((res: RoomType) => {
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
      this.dtenv.put(Endpoint.h_roomtype + "/" + this.roomType.RoomTypeID, this.roomType)
        .subscribe((res: RoomType) => {
          this.getdata();
          this.toasterShow = true;
          this.toasterColor = "info";
          this.toasterText = "Successfully Updated.";
          setTimeout(() => {
            this.toasterShow = false;
          }, 5000);
          this.roomType = new RoomType();
        });
    }

  }
  onDateSelectFrom(date: NgbDateStruct) {
    const formatedDate = date ? date.year + this.DELIMITER + date.month + this.DELIMITER + date.day : '';

    this.roomType.OfferFrom = new Date(formatedDate);
  }
  onDateSelectTo(date: NgbDateStruct) {
    const formatedDate = date ? date.year + this.DELIMITER + date.month + this.DELIMITER + date.day : '';

    this.roomType.OfferTo = new Date(formatedDate);
  }
  search(event: any) {
    const keyword = event.target.value;
    this.filtedMembers = this.searchService.filterMembers(this.members, keyword);
  }
  ShowRoomType(rid: number): void {

    this.dtenv.get(Endpoint.h_roomtype + "/" + rid).subscribe
      ((res: RoomType) => {
        this.roomType = res;
        console.log(this.roomType);
        let y = new Date(this.roomType.OfferFrom).getFullYear();
        let mm = new Date(this.roomType.OfferFrom).getMonth() + 1;
        let dat = this.datepipe.transform(this.roomType.OfferFrom, 'dd');
        let d = Number(dat);


        this.dtOfferFrom = { year: y, month: mm, day: d };
        y = new Date(this.roomType.OfferTo).getFullYear();
        mm = new Date(this.roomType.OfferTo).getMonth() + 1;
        dat = this.datepipe.transform(this.roomType.OfferTo, 'dd');
        d = Number(dat);
        this.dtOfferTo = { year: y, month: mm, day: d };
        this.isedit = true;
      });
  }
  newRoomType(): void {
    this.roomType = new RoomType();
    let ChDate = new Date();
    let y = new Date(ChDate).getFullYear();
    let mm = new Date(ChDate).getMonth();
    let d = new Date(ChDate).getDay();
    this.dtOfferFrom = { 'year': + y, 'month': mm, 'day': d };
    this.dtOfferTo = { 'year': + y, 'month': mm, 'day': d + 1 };
    this.roomType.Active = 1;
    this.roomType.OfferFrom = this.roomType.OfferTo = new Date();
    this.isedit = false;
  }
  toggleConfirmation() {
    this.toggleConfirmationModal = !this.toggleConfirmationModal;
  }
  editData() {
    this.isedit = true;
  }
  deleteData():void{
    this.toggleConfirmation();
    this.dtenv.Delete(Endpoint.h_roomtype + "/" + this.roomType.RoomTypeID)
    .subscribe((res:any)=> {
      this.toasterShow = true;
      this.toasterColor = "success";
      this.toasterText = "Coupon successfully deleted.";
      setTimeout(() => {
        this.toasterShow = false;
        this.newRoomType();
        this.getdata();
      }, 3000);
    })
  }
}
