import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { EditableMember, Member, Photo } from '../../types/member';
import { tap } from 'rxjs';
// import { AccountService } from './account-service';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private http = inject(HttpClient);
  //accountService, this.gethttpOptions() removed as we will use Interceptor  jwt-interceptor on each of our requests
  //private accountService = inject(AccountService);

  private baseUrl = environment.apiUrl;
  editMode = signal(false);
  member = signal<Member | null>(null);

  getMembers() {
    return this.http.get<Member[]>(this.baseUrl + 'members');
    //, this.gethttpOptions() removed as we will use Interceptor  jwt-interceptor on each of our requests
  }

  getMember(id: string) {
    // return this.http.get<Member>(this.baseUrl + 'members/' + id);
    // instead of returning directly  - > we use rxjs operator pipe() : side effect provided by rxjs  tap()

    return this.http.get<Member>(this.baseUrl + 'members/' + id).pipe(
      tap(member => {
        this.member.set(member);
      })
    )
    // now instead of getting member from route resolvers data['member'] use the member service.
  }

  getMemberPhotos(id: string) {
    return this.http.get<Photo[]>(this.baseUrl + 'members/' + id + '/photos');
  }

  updateMember(member: EditableMember){
    return this.http.put(this.baseUrl + 'members', member);
  }

  uploadPhoto(file:File){
    const formData = new FormData();
    formData.append('file', file );
    return this.http.post<Photo>(this.baseUrl + 'members/add-photo', formData)

  }

  setMainPhoto(photo: Photo){
    return this.http.put(this.baseUrl + 'members/set-main-photo/' + photo.id,{});  
    // since its a put method we need to send something with the url so we're sending empty {}

  }
  deletePhoto(photoId: number){
    return this.http.delete(this.baseUrl + 'members/delete-photo/' + photoId)
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


