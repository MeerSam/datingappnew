import { Component, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RegisterCreds, User } from '../../../types/user';
import { AccountService } from '../../../core/services/account-service';

@Component({
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  //another way to receive data from parent component: Input Signal /Input decorator
  // memberFromHome = input.required<User[]>(); 
  cancelRegister  = output<boolean>();
  protected creds = {} as RegisterCreds;
  private accountService = inject(AccountService);

  register(){
    console.log(this.creds);
    this.accountService.register(this.creds).subscribe({
      next: response => {
        console.log(response);
        this.cancel();
      },
      error: err =>{
        console.log(err);
      }
    })

  }

  cancel(){
    console.log('cancelled');
    this.cancelRegister.emit(false);
  }

}
