import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../core/services/account-service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastService } from '../../core/services/toast-service';
import { themes } from '../theme';
import { BusyService } from '../../core/services/busy-service';
import { HasRole } from '../../shared/directives/has-role';

@Component({
  selector: 'app-nav',
  imports: [FormsModule, RouterLink, RouterLinkActive, HasRole],
  templateUrl: './nav.html',
  styleUrl: './nav.css'
})
export class Nav implements OnInit {

  protected accountService = inject(AccountService)
  private router = inject(Router);
  private toast = inject(ToastService);
  protected busyService = inject(BusyService)
  protected creds: any = {}
  protected selectedTheme = signal<string>(localStorage.getItem('theme') || 'light');
  protected themes = themes;
 //protected loggedIn = signal(false)

  ngOnInit(): void {
    document.documentElement.setAttribute('data-theme', this.selectedTheme());
  }

  handleSelectTheme(theme: string) {
    this.selectedTheme.set(theme);
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    // closing dropdown after the theme selected
    const elem = document.activeElement as HTMLDivElement;
    if (elem) elem.blur();
  }

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
        },
        complete: () => console.log('Completed the http request')
      });
  }

  logout() {
    console.log("Logout initiated");
    // this.loggedIn.set(false);
    this.accountService.logout();
  }

}
