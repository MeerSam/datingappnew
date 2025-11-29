import { Component, inject, Input, signal } from '@angular/core';
import { Register } from '../account/register/register';
import { User } from '../../types/user';
import { AccountService } from '../../core/services/account-service';

@Component({
  selector: 'app-home',
  imports: [Register],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  //One way to receive data from parent component: @input decorator or  Input Signal -> we used in register component
  // @Input({required:true}) membersFromApp:User[] = []; //@input decorator
  protected registerMode =signal(false);
  protected accountService = inject(AccountService);
  
  showRegister(value: boolean){
    this.registerMode.set(value);
  } 
}
