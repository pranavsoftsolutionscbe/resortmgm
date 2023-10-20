import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Observable, of } from 'rxjs';
import { tap, delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router) { }

  isUserLoggedIn: boolean = false;

  isLoggedIn(): Observable<boolean> {
    this.isUserLoggedIn = localStorage.getItem('isUserLoggedIn') === "true" ? true : false;
    localStorage.setItem('isUserLoggedIn', this.isUserLoggedIn ? "true" : "false");
    return of(this.isUserLoggedIn).pipe(
      delay(1000),
      tap(val => {
        console.log("Is User Authentication is successful: " + val);
      })
    );
  }

  logout(): void {
    this.isUserLoggedIn = false;
    localStorage.removeItem('isUserLoggedIn');
    this.router.navigate(['/login']);
  }

}
