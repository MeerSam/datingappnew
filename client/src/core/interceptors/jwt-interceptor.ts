import { HttpInterceptorFn } from '@angular/common/http';
import { AccountService } from '../services/account-service';
import { inject } from '@angular/core';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const accountService = inject(AccountService);
  const user  = accountService.currentUser();
  //currentUser(): is a signal but You lose reactivity when you create a copy of the signal by getting its value using this approach.


  //following we're modifying requests before sending to next,  but request is immutable so has to be cloned to modify.
  
  // Now the request itself is immutable, so we can't directly modify it. We have to create a clone of it.
  if(user){
    req =req.clone({
      setHeaders:{
        Authorization : `Bearer ${user.token}`
      }
    })
  }
  //  `Back ticks allows us to use template strings =  Javascript + normal strings'
  return next(req);
};
