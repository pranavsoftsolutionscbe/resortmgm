import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Endpoint } from 'src/app/shared/API/Endpoint.model';
import { CustomDatepickerService } from 'src/app/shared/dataservice/customdatepicker.service';
import { DataserviceService } from 'src/app/shared/dataservice/dataservice.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-booknow',
  templateUrl: './booknow.component.html',
  styleUrls: ['./booknow.component.scss']
})
export class BooknowComponent implements OnInit {

  slides: any[] = [];
  availablity: any = {};
  defaultImage = "assets/images/dummy-image.png";
  loadRooms = false;

  constructor(private dtenv: DataserviceService, public formatter: NgbDateParserFormatter, private customDatepickerService: CustomDatepickerService, private http: HttpClient, private route: Router, private activatedRoute: ActivatedRoute, private domSanitizer: DomSanitizer, public datepipe: DatePipe
  ) {
  }

  liveDemoVisible = false;

  checkin_date: NgbDateStruct;
  checkout_date: NgbDateStruct;
  DELIMITER = "-";
  rooms: any;
  filtered_rooms: any;
  roomtypes: any[];
  serverpath: string;
  tobookrooms: any[];

  timeCheckIn = { hour: 0, minute: 0 };
  timeCheckOut = { hour: 0, minute: 0 };

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

  resourcePath = environment.resources;

  ngOnInit() {
    this.searchData.room_type = 1;

    this.serverpath = environment.resources + "bulding/1/";
    this.dtenv.get(Endpoint.GetBookingBulding + "1/1")
      .subscribe((res) => {
        this.rooms = res;
        this.filterRoomByType(this.searchData.room_type);
      })

    this.getdata();

    const currentDate = Date();
    const y = new Date(currentDate).getFullYear();
    const mm = new Date(currentDate).getMonth() + 1;
    const dat = this.datepipe.transform(currentDate, 'dd');
    const d = Number(dat);
    this.minDate = { year: y, month: mm, day: d };
    this.searchData.checkInDate = this.minDate;
    this.searchData.checkOutDate = { year: y, month: mm, day: d + 1 };

  }

  filterRoomByType(typeId: number) {
    if (typeId === 1) {
      this.filtered_rooms = this.rooms;
    } else {

    }
  }


  getdata(): void {

    this.dtenv.get(Endpoint.GetRoomTypes + "1")
      .subscribe((res: any) => {
        this.roomtypes = res;
      }
      )
  }
  onDateSelect(date: NgbDateStruct, type: string) {
    const formatedDate = { year: date.year, month: date.month, day: date.day };
    if (type === "check-in") {
      this.searchData.checkInDate = formatedDate;
    } else {
      this.searchData.checkOutDate = formatedDate;
    }
  }

  expandDiv(index: number) {
    this.tobookrooms = [];
    this.dtenv.get(Endpoint.gettoBookBuldingrooms + index)
      .subscribe((res: any[]) => {
        this.tobookrooms = res;
        if (this.tobookrooms.length) {
          this.tobookrooms.forEach((room: any) => {
            if (room.RoomId) {
              this.dtenv.get(Endpoint.GetRoomImageList + room.RoomId)
                .subscribe((res) => {
                  room.images = res;
                });

              const formatedInDate = this.searchData.checkInDate ? this.searchData.checkInDate.year + this.DELIMITER + this.searchData.checkInDate.month + this.DELIMITER + this.searchData.checkInDate.day : '';
              const formatedOutDate = this.searchData.checkOutDate ? this.searchData.checkOutDate.year + this.DELIMITER + this.searchData.checkOutDate.month + this.DELIMITER + this.searchData.checkOutDate.day : '';

              this.dtenv.get(Endpoint.gettoBookRoom + room.RoomId + "/1512/" + formatedInDate + "/" + formatedOutDate)
                .subscribe((response: any[]) => {
                  room.availablity = response.pop();
                });
            }
          });
        }
      });

    this.rooms.forEach((element: any) => {
      if (element.BuldingID === index) {
        const elem = document.getElementById("room-" + index);
        const elembtn = document.getElementById("view-" + index) as HTMLInputElement;
        if (elem !== null && elem.classList.contains("d-none")) {
          elem?.classList.remove("d-none");
          elembtn.innerText = "- Hide";
        } else if (elem !== null && !elem.classList.contains("d-none")) {
          elem?.classList.add("d-none");
          elembtn.innerText = "+ View";
        }
      } else {
        const elem = document.getElementById("room-" + element.BuldingID);
        const elembtn = document.getElementById("view-" + element.BuldingID) as HTMLInputElement;
        elem?.classList.add("d-none");
        elembtn.innerText = "+ View";
      }
    });
  }

  booknow(roomId: number, RateId: number) {
    this.searchData.room_type = RateId;
    this.storeInLocalStorage();
    if (this.route.url === '/surada/booknow') {
      this.route.navigate(['/surada/booknow/' + roomId]);
    } else {
      this.route.navigate(['/booknow/' + roomId]);
    }
  }

  setTime(type: string) {
    if (type === "check-in") {
      this.searchData.checkInTime = this.timeCheckIn;
    } else {
      this.searchData.checkOutTime = this.timeCheckOut;
    }
  }

  storeInLocalStorage() {
    localStorage.setItem("searchData", JSON.stringify(this.searchData));
    this.loadRooms = !this.loadRooms;
  }

  toggleLiveDemo() {
    this.liveDemoVisible = !this.liveDemoVisible;
  }

  setRoomSlides(images: any) {
    if (images.length) {
      images.forEach((element: any) => {
        const slide = {
          src: this.resourcePath + "rooms/1/" + element.Imagepath,
        }
        this.slides.push(slide);
      });

      if (this.slides.length === images.length) {
        this.toggleLiveDemo();
      }
    }
  }

  handleLiveDemoChange(event: boolean) {
    this.liveDemoVisible = event;
    if (!this.liveDemoVisible) {
      this.slides = [];
    }
  }

  onItemChange($event: any): void {
    console.log('Carousel onItemChange', $event);
  }
}
