import { inject, Injectable } from '@angular/core';
import { AccountService } from './account-service';
import { of } from 'rxjs';
import { LikesService } from './likes-service';

@Injectable({
  providedIn: 'root'
})
export class InitService {
  private accountService = inject(AccountService);
  private likesService= inject(LikesService);
  // we dont need constructor but we need a init method 

  init() {
    const userString = localStorage.getItem('user');
    if (!userString) return of(null);
    const user =JSON.parse(userString);
    this.accountService.currentUser.set(user);
    this.likesService.getLikeIds();

    // this method has to be aync: And what we have to return is an observable. 
    // in angular we use observable for async code

    // the observable here is only going to let the calling functionality know that
    // the current user loaded and ready to be used. 
    // //nothing is returned from this method just a indicator that method has finished.
    //do the following to achieve that

    //observableof: now called of
    return of(null);
  }
  
}
