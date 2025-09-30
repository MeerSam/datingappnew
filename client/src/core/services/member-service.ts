import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { EditableMember, Member, MemberParams, Photo } from '../../types/member';
import { tap } from 'rxjs';
import { PaginatedResult } from '../../types/pagination';
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

  getMembers(memberParams :MemberParams) {
    // pageNumber = 1, pageSize: number = 5
    let params  = new HttpParams(); // HttpParams: this will allow us to send something up as query string parameters to our API.
    params =  params.append('pageNumber', memberParams.pageNumber);
    params =  params.append('pageSize', memberParams.pageSize);
    params =  params.append('minAge', memberParams.minAge);
    params =  params.append('maxAge', memberParams.maxAge);
    params =  params.append('orderBy', memberParams.orderBy); 
    if (memberParams.gender)  params =  params.append('gender', memberParams.gender);
    // below {params: params} can be just replaced as {params} 
    return this.http.get<PaginatedResult<Member>>(this.baseUrl + 'members', {params: params}).pipe(
      tap(() => {
        localStorage.setItem('filters', JSON.stringify(memberParams))
      })
    );
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


