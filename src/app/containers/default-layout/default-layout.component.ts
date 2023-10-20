import { Component, OnInit } from '@angular/core';

import { navItems } from './_nav';
import { environment } from 'src/environments/environment';
import { Endpoint } from 'src/app/shared/API/Endpoint.model';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss'],
})
export class DefaultLayoutComponent implements OnInit {

  public navItems = navItems;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.http.get(environment.server + Endpoint.GetUserMenus + "1/" + 7).subscribe((res: any) => {
      // this.navItems = res;
    })
  }
}
