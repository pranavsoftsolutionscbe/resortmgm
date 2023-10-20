import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Endpoint } from "src/app/shared/API/Endpoint.model";
import { DataserviceService } from 'src/app/shared/dataservice/dataservice.service';
import { building, h_buldingroomdetails } from "src/app/shared/models/building.model";
import { SearchDataService } from "src/app/shared/dataservice/searchdata.service";
import { debounce } from "rxjs/operators";
import { ToasterPlacement } from '@coreui/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-bulding',
  templateUrl: './bulding.component.html',
  styleUrls: ['./bulding.component.scss']
})
export class BuldingComponent implements OnInit {
  bulding = new building();
  buldings: any[];
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
  toggleConfirmationModal: boolean = false;

  // toasterForm = new UntypedFormGroup({
  //   autohide: new UntypedFormControl(this.autohide),
  //   delay: new UntypedFormControl({ value: this.delay, disabled: !this.autohide }),
  //   position: new UntypedFormControl(this.position),
  //   fade: new UntypedFormControl({ value: true, disabled: false }),
  //   closeButton: new UntypedFormControl(true),
  //   color: new UntypedFormControl('')
  // });
  constructor(private dtenv: DataserviceService, private http: HttpClient, private searchService: SearchDataService) { }

  ngOnInit(): void {
    this.http.get("assets/members-mockdata.json").subscribe((res: any) => {
      this.members = res;
      this.filtedMembers = res;
    });
    this.getdata();
  }
  getdata(): void {
    this.dtenv.get(Endpoint.Buldingowners + "1512/party").subscribe((res: any) => {
      this.members = res;
      this.customers = res;
      this.filtedMembers = res;
    });
    this.dtenv.get(Endpoint.GetRoomTypes + "1")
      .subscribe((res: any) => {
        this.roomtypes = res;
      }
      )
  }

  SaveEdit(): void {

    this.bulding.BuldingID = 2;
    this.bulding.ClientID = 1;


    this.bulding.IsDetachable = this.bulding.IsDetachable.toString() == "true" ? 1 : 0
    this.bulding.inActive = this.bulding.inActive.toString() == "true" ? 1 : 0
    if (!this.isEdit) {
      this.dtenv.post(Endpoint.h_buldingmaster, this.bulding)
        .subscribe((res: building) => {

          console.log(res);
          this.toasterShow = true;
          this.toasterColor = "success";
          this.toasterText = "Successfully Created.";
          setTimeout(() => {
            this.toasterShow = false;
            this.bulding = new building();
          }, 5000);

        });
    }
    else {
      this.dtenv.put(Endpoint.h_buldingmaster + "/" + this.bulding.BuldingID, this.bulding)
        .subscribe((res: building) => {

          console.log(res);
          this.toasterShow = true;
          this.toasterColor = "info";
          this.toasterText = "Successfully Updated.";
          setTimeout(() => {
            this.toasterShow = false;
            this.bulding = new building();
          }, 5000);

        });
    }
    this.isEdit = false;
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
    let folderName = "bulding";
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
    this.buldingdetail.Imagepath = this.FileName;
    this.buldingdetail.BuldingID = this.bulding.BuldingID;
    this.dtenv.post(Endpoint.h_buldingroomdetails, this.buldingdetail)
      .subscribe((res: h_buldingroomdetails) => {
        console.log(res);

        this.dtenv
          .postFile(Endpoint.FileUploader, this.formData)
          .subscribe((res: any) => {

            // this.getData();
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

      })
  }
  GetRateTypes(): void {
    console.log(this.bulding.ClassId);
    this.dtenv.get(Endpoint.GetRateTypeList + "1")
      .subscribe((res: any) => {
        console.log(res);
        this.ratelist = res.filter((rt: { RoomTypeID: number; }) => rt.RoomTypeID == this.bulding.ClassId);
        console.log(this.ratelist);
      })
  }
  NewImage(): void {
    this.buldingdetail = new h_buldingroomdetails();
    this.ImageFile = "";
    this.isEditImage = false;
  }
  GetBuldingList(): void {
    this.dtenv.get(Endpoint.GetbuldingList + this.bulding.CustomerID)
      .subscribe((res: any[]) => {
        this.buldings = res;
      })
  }
  ShowBulding(bld: number): void {

    this.dtenv.get(Endpoint.h_buldingmaster + "/" + bld)
      .subscribe((res: building) => {
        this.bulding = res;
        this.isEdit = true;
      });
    this.bulding.BuldingID = bld;
    this.dtenv.get(Endpoint.GetbuldingImageList + bld)
      .subscribe((res: h_buldingroomdetails[]) => {
        this.BuldDetails = res;
        console.log(this.BuldDetails);
      });
    this.serverpath = environment.resources + "bulding/" + "1" + "/";
    this.buldingdetail = new h_buldingroomdetails();
    this.ImageFile = "";
  }
  showImageDetails(inx: number) {
    this.buldingdetail = this.BuldDetails[inx];
    this.ImageFile = this.serverpath + this.buldingdetail.Imagepath
    this.isEditImage = true;
  }
  newbulding(): void {
    this.bulding = new building();
  }
  toggleConfirmation() {
    this.toggleConfirmationModal = !this.toggleConfirmationModal;
  }
  deleteData(): void {
    this.toggleConfirmation();
    this.dtenv.Delete(Endpoint.h_buldingmaster + "/" + this.bulding.BuldingID)
      .subscribe((res: any) => {
        this.toasterShow = true;
        this.toasterColor = "warning";
        this.toasterText = "Bulding successfully deleted.";
        setTimeout(() => {
          this.toasterShow = false;
          this.newbulding();
          this.getdata()
        }, 3000);
      })
  }
}
