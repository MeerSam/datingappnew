import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { User } from '../../types/user';
import { LikesParams, Member } from '../../types/member';
import { PaginatedResult } from '../../types/pagination';

@Injectable({
  providedIn: 'root'
})
export class LikesService {
  private  http = inject(HttpClient);
  private baseUrl = environment.apiUrl; 
  likeIds = signal<string[]>([]); // when we set a current user we will keep the likeIds of the current User
  

  toggleLike(targetMemberId: string){
    return this.http.post(`${this.baseUrl}likes/${targetMemberId}`,{});
  }

  getLikes(likesParams :LikesParams){
    //predicate:string, removed from param
    // console.log(likesParams.predicate);
    let params  = new HttpParams(); // HttpParams: this will allow us to send something up as query string parameters to our API.
    params =  params.append('pageNumber', likesParams.pageNumber);
    params =  params.append('pageSize', likesParams.pageSize); 
    params =  params.append('predicate', likesParams.predicate);  

    // return this.http.get<Member[]>(this.baseUrl + 'likes?predicate=' + likesParams.predicate);
    return this.http.get<PaginatedResult<Member>>(this.baseUrl + 'likes',{params});
  }

  getLikeIds(){
    return this.http.get<string[]>(this.baseUrl +'likes/list').subscribe({
      next: ids => this.likeIds.set(ids)
    })
  }

  clearLikesIds(){
    this.likeIds.set([]);
  }
}
