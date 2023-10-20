import { Injectable, inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  let url: string = state.url;

  // authService.isLoggedIn()
  //   .subscribe(data => {
  //     if (data) {
  //       return true;
  //     }
  //     return router.parseUrl('/login');
  //   });

  // return false;

  // // Redirect to the login page
  // return router.parseUrl('/login');

  let val = localStorage.getItem('isUserLoggedIn');
  // alert(val);

  if (val !== null && val === "true") {
    if (url === "/login") {
      return router.parseUrl('/dashboard');
    }
    return true;
  } else if ((val === null || val === "false") && url === "/login") {
    return true;
  } else {
    return router.parseUrl('/login');
  }
};
