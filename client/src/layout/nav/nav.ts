import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../core/services/account-service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastService } from '../../core/services/toast-service';

@Component({
  selector: 'app-nav',
  imports: [FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './nav.html',
  styleUrl: './nav.css'
})
export class Nav {
  protected accountService = inject(AccountService)
  private router = inject(Router);
  private toast = inject(ToastService);
  protected creds: any = {}
  //protected loggedIn = signal(false)
  
  login() {
    console.log('Login method called'); 
    this.accountService.login(this.creds).subscribe(
      {
        next: () => {
          //this.loggedIn.set(true);
          this.router.navigateByUrl('/members');
          this.toast.success('Logged In successfully');
          this.creds = {};
          //  result -> () console.log(result);
        }, 
        error: error => { 
          this.toast.error(error.error);
        } , 
        complete: () =>   console.log('Completed the http request')
      });
  }

  logout(){
    console.log("Logout initiated");
    // this.loggedIn.set(false);
    this.accountService.logout();
  }
   
}
