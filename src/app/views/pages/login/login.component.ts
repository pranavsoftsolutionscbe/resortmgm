import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Endpoint } from 'src/app/shared/API/Endpoint.model';
import { environment } from "src/environments/environment";
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  userName: string;
  password: string;
  isUserLoggedIn: boolean = false;
  isFormSubmitted: boolean = false;
  isFailed: boolean = false;

  constructor(private router: Router, private http: HttpClient) { }

  ngOnInit() { }

  onClickSubmit() {
    this.isFormSubmitted = true;
    this.http.get(environment.server + Endpoint.Users + '/' + this.userName + '/' + this.password).subscribe((res: any) => {
      this.isUserLoggedIn = res?.User_ID && res?.UserType.toLowerCase() === "user";
      localStorage.setItem('isUserLoggedIn', this.isUserLoggedIn ? "true" : "false");
      if (this.isUserLoggedIn) {
        setTimeout(() => {
          this.isFormSubmitted = false;
          this.router.navigate(['/dashboard']);
        }, 1000);
      } else {
        this.isFailed = true;
        setTimeout(() => {
          this.isFailed = false;
        }, 3000);
      }
    });
  }
}
