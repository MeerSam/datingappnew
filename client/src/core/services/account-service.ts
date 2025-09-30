import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { LoginCreds, RegisterCreds, User } from '../../types/user';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';

// what this has is class can use dependency injection from angular into other components and classes

// starts at the root and stays as long as the application 
//In our angular project, this provided in root means that it's automatically going to be provided to our application as a whole.

@Injectable({
  providedIn: 'root'
})
export class AccountService {
// services are both injectable and singleton  
// Well, this is going to be started when our angular application starts, and it's going to be a singleton
// that survives for as long as our application does.
// So it makes it a good place to store states that we need application wide.

  private  http = inject(HttpClient);
  currentUser = signal<User | null>(null);

  baseUrl = environment.apiUrl;

  register(creds:RegisterCreds){
    return this.http.post<User>(this.baseUrl + 'account/register', creds).pipe(
      tap(user => {
         if(user){
          this.setCurrentUser(user)
         }
      })
    )
  }

  login(creds:LoginCreds){
    return this.http.post<User>(this.baseUrl + 'account/login', creds).pipe(
      tap(user => {
        if(user){
          this.setCurrentUser(user)
        }
      })
    )
  } 

  setCurrentUser(user:User){
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
  }

  logout(){
    localStorage.removeItem('user');
    localStorage.removeItem('filters');

    this.currentUser.set(null);
  }
}
