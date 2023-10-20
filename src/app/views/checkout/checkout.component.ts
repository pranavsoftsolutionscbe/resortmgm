import { Component } from '@angular/core';
import { ToasterPlacement } from '@coreui/angular';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent {

  timeCheckIn = { hour: 0, minute: 0 };
  timeCheckOut = { hour: 0, minute: 0 };

  toasterText = "";
  toasterColor = "success";
  toasterShow = false;
  positionStatic = ToasterPlacement.Static;

}
