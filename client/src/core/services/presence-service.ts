import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { ToastService } from './toast-service';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { User } from '../../types/user';
import { Message } from '../../types/message';

@Injectable({
  providedIn: 'root'
})
export class PresenceService {
  private hubUrl = environment.hubUrl;
  private toast = inject(ToastService)
  // # display toast when user conects/disconnects  to notify presence
  public hubConnection?: HubConnection;

  onlineUsers = signal<string[]>([]);

  createHubConnection(user: User) {
    /* accessTokenFactory: This takes a callback function but we're just going to pass it our user token. 
        And this is going to pass a token as a query string parameter when it negotiates with our API server :
        about what connection protocols it supports for real time communication, */
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'presence', {
        accessTokenFactory: () => user.token
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start() // returns a Promise : either conn successfully established or errored
      .catch(error => console.log(error)); // if error then we catch error and log it.

    this.hubConnection.on("UserOnline", userId => {
      this.onlineUsers.update(users => [...users, userId])
      this.toast.success(userId + ' has connected');
    });

    this.hubConnection.on("UserOffline", userId => {
      this.toast.info(userId + ' has disconnected');
      this.onlineUsers.update(users => users.filter(x => x !== userId));
    });

    this.hubConnection.on("GetOnlineUsers", userIds => {
      this.onlineUsers.set(userIds);
    });

    this.hubConnection.on('NewMessageReceived', (message : Message) => {
      this.toast.info(message.senderDisplayName + ' has sent you a message', 
        10000, message.senderImageUrl, `/members/${message.senderId}/messages`)
    });
  }
  stopHubConnection() {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      this.hubConnection.stop().catch(error => console.log(error));

    }
  }

}
