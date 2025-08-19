import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Member, Photo } from '../../types/member';
// import { AccountService } from './account-service';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private http = inject(HttpClient);
  //accountService, this.gethttpOptions() removed as we will use Interceptor  jwt-interceptor on each of our requests
  //private accountService = inject(AccountService);

  private baseUrl = environment.apiUrl;

  getMembers() {
    return this.http.get<Member[]>(this.baseUrl + 'members');
    //, this.gethttpOptions() removed as we will use Interceptor  jwt-interceptor on each of our requests
  }

  getMember(id: string) {
    return this.http.get<Member>(this.baseUrl + 'members/' + id);
  }

  getMemberPhotos(id: string) {
    return this.http.get<Photo[]>(this.baseUrl + 'members/' + id + '/photos');
  }
}


  // removing helper method as well as jwt-interceptor was created to handle the Authorization: 'Bearer 'token 
  /*   private gethttpOptions() {
      //private method just as helper method for http options to send it with our 
      // getter methods
      // returns an object 
      return {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + this.accountService.currentUser()?.token
  
        })
      }
  
    } */


