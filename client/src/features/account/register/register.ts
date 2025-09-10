import { Component, inject, input, OnInit, output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { RegisterCreds, User } from '../../../types/user';
import { AccountService } from '../../../core/services/account-service';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [ ReactiveFormsModule, JsonPipe], // FormsModule removed
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register implements OnInit {

  private accountService = inject(AccountService);

  //another way to receive data from parent component: Input Signal /Input decorator
  // memberFromHome = input.required<User[]>(); 
  cancelRegister  = output<boolean>();
  protected creds = {} as RegisterCreds;
  protected registerForm : FormGroup = new FormGroup({}); // {} object

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(){
    this.registerForm = new FormGroup({
      email:  new FormControl('janedoe@test.com', [Validators.required, Validators.email]),
      displayName: new FormControl('',Validators.required),
      password: new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(8)]),
      confirmPassword: new FormControl('', [Validators.required, this.matchValues('password')])
    });
    this.registerForm.controls['password'].valueChanges.subscribe(() => {
      this.registerForm.controls['confirmPassword'].updateValueAndValidity();
    });
  }

  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null  => { 
      const parent = control.parent ; //control.parent  is the formGroup

      if (!parent ) return null;
      const matchValue = parent.get(matchTo)?.value;
      return control.value === matchValue? null : {passwordMismatch: true}

    }
  }
  register(){
    console.log(this.registerForm.value);
    // console.log(this.creds);
    // this.accountService.register(this.creds).subscribe({
    //   next: response => {
    //     console.log(response);
    //     this.cancel();
    //   },
    //   error: err =>{
    //     console.log(err);
    //   }
    // })

  }

  cancel(){
    console.log('cancelled');
    this.cancelRegister.emit(false);
  }

}
