import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Endpoint } from "src/app/shared/API/Endpoint.model";
import { DataserviceService } from 'src/app/shared/dataservice/dataservice.service';
import { building, h_buldingroomdetails } from "src/app/shared/models/building.model";
import { HRoommaster } from "src/app/shared/models/h-roommaster.model";
import { SearchDataService } from "src/app/shared/dataservice/searchdata.service";
import { debounce } from "rxjs/operators";
import { ToasterPlacement } from '@coreui/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss']
})
export class RoomsComponent {
  bulding = new HRoommaster();
  plot = new building();
  buldings: any[];
  Rooms: any[];
  buldingdetail = new h_buldingroomdetails();
  BuldDetails: h_buldingroomdetails[] = [];
  public progress: number;
  public message: string;
  public formData = new FormData();
  ImageFile = 'assets/images/dummy-image.png';
  FileName: any;
  serverpath: string;
  sizePage: number;
  isEdit: boolean = false;
  isEditImage: boolean = false;
  idxno: number;
  page: number;
  totalItems: number;
  pageSize: number;
  members = [];
  filtedMembers = [];
  customers: any = [];
  roomtypes: any = [];
  ratelist: any = [];
  toasterText = "";
  toasterColor = "success";
  toasterShow = false;
  positionStatic = ToasterPlacement.Static;
  passbuldingID: number = 0;
  CustomerID: number = 0;
  constructor(private dtenv: DataserviceService, private http: HttpClient, private searchService: SearchDataService) { }

  ngOnInit(): void {
    this.http.get("assets/members-mockdata.json").subscribe((res: any) => {
      this.members = res;
      this.filtedMembers = res;
    });
    this.getdata();
  }
  getdata(): void {
    this.dtenv.get(Endpoint.Buldingowners + "1512/bulder").subscribe((res: any) => {
      this.members = res;
      this.customers = res;
      this.filtedMembers = res;
    });
    this.dtenv.get(Endpoint.GetRoomTypes + "1")
      .subscribe((res: any) => {
        this.roomtypes = res;
      });
  }

  SaveEdit(): void {

    // this.bulding.BuldingID = 2;
    this.bulding.ClientID = 1;

    this.bulding.IsMaster = this.bulding.IsMaster.toString() == "true" ? 1 : 0
    this.bulding.IsAttachtoMaster = this.bulding.IsAttachtoMaster.toString() == "true" ? 1 : 0
    this.bulding.IsDetachable = this.bulding.IsDetachable.toString() == "true" ? 1 : 0
    this.bulding.inActive = this.bulding.inActive.toString() == "true" ? 1 : 0
    if (!this.isEdit) {
      this.dtenv.post(Endpoint.h_roommaster, this.bulding)
        .subscribe((res: building) => {

          console.log(res);
          this.toasterShow = true;
          this.toasterColor = "success";
          this.toasterText = "Successfully Created.";
          setTimeout(() => {
            this.toasterShow = false;
            this.bulding = new HRoommaster();
          }, 5000);

        });
    }
    else {
      this.dtenv.post(Endpoint.h_roommaster + "/" + this.bulding.RoomId, this.bulding)
        .subscribe((res: building) => {

          console.log(res);
          this.toasterShow = true;
          this.toasterColor = "info";
          this.toasterText = "Successfully Updated.";
          setTimeout(() => {
            this.toasterShow = false;
            this.bulding = new HRoommaster();
          }, 5000);

        });
    }
  }

  search(event: any) {
    const keyword = event.target.value;
    this.filtedMembers = this.searchService.filterMembers(this.members, keyword);
  }

  public uploadFile = (files: any) => {
    if (files.length === 0) {
      return;
    }
    const current = new Date();
    const timestamp = current.getTime();

    let fileToUpload = <File>files[0];
    let folderName = "rooms";
    this.FileName = timestamp + "." + fileToUpload.name.split(".")[1];
    let custId = 1;
    var reader = new FileReader();
    reader.readAsDataURL(fileToUpload);
    reader.onload = () => {
      this.ImageFile = reader.result as string;
    };
    this.formData = new FormData();
    this.formData.append("file", fileToUpload, timestamp + "." + fileToUpload.name.split(".")[1]);
    this.formData.append("Folder", folderName);
    this.formData.append("Customer", custId.toString());
  };
  SaveEditImaages(): void {
    debugger;
    if (!this.isEditImage) {
      this.buldingdetail.Imagepath = this.FileName;
      this.buldingdetail.RoomId = this.bulding.RoomId;
      this.dtenv.post(Endpoint.h_buldingroomdetails, this.buldingdetail)
        .subscribe((res: h_buldingroomdetails) => {
          console.log(res);

          this.dtenv
            .postFile(Endpoint.FileUploader, this.formData)
            .subscribe((res: any) => {

              this.loadRoomImages(this.bulding.RoomId)
              this.buldingdetail = new h_buldingroomdetails();
              // this.Cleardata();
            });
          console.log(res);
          this.toasterShow = true;
          this.toasterColor = "success";
          this.toasterText = "Details Successfully Saved.";
          setTimeout(() => {
            this.toasterShow = false;
            this.buldingdetail = new h_buldingroomdetails();
          }, 5000);

        });
    }
    else {

      this.buldingdetail.RoomId = this.bulding.RoomId;
      this.dtenv.put(Endpoint.h_buldingroomdetails + "/" + this.buldingdetail.sortno
        , this.buldingdetail)
        .subscribe((res: h_buldingroomdetails) => {
          console.log(res);
          if (this.formData != undefined) {
            this.buldingdetail.Imagepath = this.FileName;
            this.dtenv
              .postFile(Endpoint.FileUploader, this.formData)
              .subscribe((res: any) => {

                this.loadRoomImages(this.bulding.RoomId)
                this.buldingdetail = new h_buldingroomdetails();
                // this.Cleardata();
              });
          }
          console.log(res);
          this.toasterShow = true;
          this.toasterColor = "info";
          this.toasterText = "Details Successfully Updated.";
          setTimeout(() => {
            this.toasterShow = false;
            this.buldingdetail = new h_buldingroomdetails();
          }, 5000);

        });
      this.isEditImage = false;
    }
  }
  GetRateTypes(): void {
    console.log(this.bulding.ClassId);
    this.dtenv.get(Endpoint.GetRateTypeList + "1")
      .subscribe((res: any) => {
        console.log(res);
        this.ratelist = res.filter((rt: { RoomTypeID: number; }) => rt.RoomTypeID == this.plot.ClassId);
        this.bulding.RateId = this.plot.RateId;
        console.log(this.ratelist);
      })
  }
  NewImage(): void {
    this.buldingdetail = new h_buldingroomdetails();
    this.ImageFile = "";
  }
  GetBuldingList(): void {
    this.dtenv.get(Endpoint.GetbuldingList + this.CustomerID)
      .subscribe((res: any[]) => {
        this.buldings = res;
      });

  }
  GetRoomsList(): void {
    this.dtenv.get(Endpoint.GetRoomList + this.bulding.BuldingID)
      .subscribe((res: any[]) => {
        this.Rooms = res;
      });

  }

  ShowBulding(): void {

    this.dtenv.get(Endpoint.h_buldingmaster + "/" + this.bulding.BuldingID)
      .subscribe((res: building) => {
        this.plot = res;

        this.GetRateTypes();
        this.bulding.RateId = this.plot.RateId;
        this.bulding.Floor = this.plot.Floor.toString();
        this.bulding.WeekEndPercent = this.plot.WeekEndPercent;
        this.bulding.HolidayPercent = this.plot.HolidayPercent;
        this.bulding.MaxBed = this.plot.MaxBed;
        this.bulding.ChildPricePerBed = this.plot.ChildPricePerBed;
        this.bulding.ChekoutHrs = this.plot.ChekoutHrs;

      });



  }

  showImageDetails(inx: number) {
    this.buldingdetail = this.BuldDetails[inx];
    console.log
    this.ImageFile = this.serverpath + this.buldingdetail.Imagepath;
    this.isEditImage = true;

  }
  loadRoomImages(romid: number): void {

    this.bulding.RoomId = romid;
    this.dtenv.get(Endpoint.GetRoomImageList + romid)
      .subscribe((res: h_buldingroomdetails[]) => {
        this.BuldDetails = res;
        console.log(this.BuldDetails);
      });
    this.serverpath = environment.resources + "rooms/" + "1" + "/"
    this.buldingdetail = new h_buldingroomdetails();
    this.ImageFile = "";
  }
  Closepage(){
    alert("hi i am closing now");
    document.close();
  }

}
