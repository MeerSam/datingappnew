import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { LoginCreds, RegisterCreds, User } from '../../types/user';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LikesService } from './likes-service';
import { PresenceService } from './presence-service';
import { HubConnection, HubConnectionState } from '@microsoft/signalr';

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

  private http = inject(HttpClient);
  private likesService = inject(LikesService); // makes sure no cicular dependency when injecting other services into a service.
  private presenceService = inject(PresenceService);
  currentUser = signal<User | null>(null);

  baseUrl = environment.apiUrl;

  register(creds: RegisterCreds) {
    return this.http.post<User>(this.baseUrl + 'account/register'
      , creds
      , { withCredentials: true }).pipe(
        tap(user => {
          if (user) {
            this.setCurrentUser(user)
            this.startTokenRefreshInterval()
          }
        })
      )
  }

  login(creds: LoginCreds) {
    return this.http.post<User>(this.baseUrl + 'account/login'
      , creds
      , { withCredentials: true }).pipe(
        tap(user => {
          if (user) {
            this.setCurrentUser(user)
            this.startTokenRefreshInterval()
          }
        })
      )
  }

  refreshToken() {
    return this.http.post<User>(this.baseUrl + 'account/refresh-token', {}, { withCredentials: true })
  }

  startTokenRefreshInterval() {
    setInterval(() => {
      this.http.post<User>(this.baseUrl + 'account/refresh-token', {}, { withCredentials: true }).subscribe({
        next: user => {
          this.setCurrentUser(user)
        },
        error: () => {
          this.logout()
        }
      })
    }, 5 * 60 * 1000)

    //10sec = 10 *1000 // 5 min refresh-token 
  }

  setCurrentUser(user: User) {
    user.roles = this.getRolesFromToken(user);
    // localStorage.setItem('user', JSON.stringify(user)); // removed 215 using refresh tokens
    this.currentUser.set(user);
    this.likesService.getLikeIds(); // after user is set
    if (this.presenceService.hubConnection?.state !== HubConnectionState.Connected) {
      this.presenceService.createHubConnection(user);
    }
  }

  logout() {
    //logout from AI Side since the refresh token persisted and caused to signin without creds #235

    this.http.post(this.baseUrl + 'account/logout',{}, { withCredentials: true }).subscribe({
      next: () => {
        // localStorage.removeItem('user'); // removed 215 using refresh tokens
        localStorage.removeItem('filters');
        this.likesService.clearLikesIds(); // clear any like Ids 
        this.currentUser.set(null);
        this.presenceService.stopHubConnection();
      }, 
    });


    


  }

  private getRolesFromToken(user: User): string[] {
    // passsing user as parameter and returning string array
    const payload = user.token.split(".")[1]; //get payload
    // token has 3 parts : 1st part : token header (info about expiration and type of token)
    //part 2 : payload : encoded not encrypted 
    //part 3: encrypted and cannot decipher withou the secret which is in API and never leaves server

    // payload : decode // base64 encoded string
    const decoded = atob(payload); //we'll use a native JavaScript function called atob 

    const jsonPayload = JSON.parse(decoded);

    return Array.isArray(jsonPayload.role) ? jsonPayload.role : [jsonPayload.role]
  }
}
