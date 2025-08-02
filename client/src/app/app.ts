// import { HttpClient } from '@angular/common/http';

// import { lastValueFrom } from 'rxjs';

// import { AccountService } from '../core/services/account-service';
// import { Home } from "../features/home/home";
// import { NgClass } from '@angular/common';
// import { User } from '../types/user';
import { Router, RouterOutlet } from '@angular/router';
import { Nav } from "../layout/nav/nav";
import { Component, inject, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [Nav, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App  {
  // removed implements OnInit from export class App implements OnInit 
  // private accountService = inject(AccountService);
  protected router = inject(Router)
  // protected http = inject(HttpClient);
  protected readonly title = signal('Dating App'); // signal = track and is responsive wrapper
  // protected members = signal<User[]>([]);

  // constructor(protected http: HttpClient){} // previously done
  // newer way is Inject() 

  // async ngOnInit() {
  //   // initiallization
  //   // httpclient get returns a Observable of the response body as js object
  //   // this.http.get('https://localhost:5001/api/members').subscribe({
  //   //   next:  response => this.members.set(response),
  //   //   error: error => console.log(error),
  //   //   complete: () => console.log('Completed the http request')
  //   // });
  //   this.members.set(await this.getMembers());
  //   this.setCurrentUser();   // moved it to init() initService
  // }
  // setCurrentUser() {
  //   //  removed this now we have moved it to init() initService
  //   const userString = localStorage.getItem('user');
  //   if (!userString) return  ;
  //   const user = JSON.parse(userString);
  //   this.accountService.currentUser.set(user);
  // }

  // async getMembers() {

  //   try {
  //     // we are returning a Promise this is not an Observable therefore we have to
  //     return lastValueFrom(this.http.get<User[]>('https://localhost:5001/api/members'));

  //   } catch (error) {
  //     console.log(error);
  //     throw error;
  //   }


  // }



}
