import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { RegisterCreds, User } from '../../../types/user';
import { AccountService } from '../../../core/services/account-service';
import { JsonPipe } from '@angular/common';
import { TextInput } from "../../../shared/text-input/text-input";
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule,  TextInput], // JsonPipe,  FormsModule removed  
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  private accountService = inject(AccountService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  //another way to receive data from parent component: Input Signal /Input decorator
  // memberFromHome = input.required<User[]>(); 
  cancelRegister = output<boolean>();
  protected creds = {} as RegisterCreds;
  protected credentialsForm: FormGroup; //  since we cannot use it = new FormGroup({}); // {} object
  protected profileForm: FormGroup;
  protected currentStep = signal(1);
  protected validationErrors = signal<string[]>([]);


  constructor() {
    // new FormGroup replaced with this.fb.group
    // new FormControl( ) replaced with [] example: new FormControl('', [Validators.required, Validators.email]),
    this.credentialsForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      displayName: ['', Validators.required],
      password: ['', [Validators.required,
      Validators.minLength(4),
      Validators.maxLength(8)]],
      confirmPassword: ['', [Validators.required, this.matchValues('password')]]
    });

    this.profileForm = this.fb.group({
      gender: ['male', Validators.required],
      dateOfBirth: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required]

    });
    this.credentialsForm.controls['password'].valueChanges.subscribe(() => {
      this.credentialsForm.controls['confirmPassword'].updateValueAndValidity();
    });
  }

  // ngOnInit(): void {
  //   this.initializeForm();
  // }

  // initializeForm(){
  // moved to constructor
  // }

  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const parent = control.parent; //control.parent  is the formGroup

      if (!parent) return null;
      const matchValue = parent.get(matchTo)?.value;
      return control.value === matchValue ? null : { passwordMismatch: true }

    }
  }

  nextStep() {

    if (this.credentialsForm.valid) {
      this.currentStep.update(prevStep => prevStep + 1);
    }

  }

  prevStep() {
    this.currentStep.update(prevStep => prevStep - 1);
  }

  getMaxDate() {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 18);
    return today.toISOString().split('T')[0];

  }
  register() { 
    if (this.profileForm.valid && this.credentialsForm.valid) { 
      const formData = { ...this.credentialsForm.value, ...this.profileForm.value };
      // console.log('Form Data: ', formData);       
      this.accountService.register(formData).subscribe({
        next: () => {
          this.router.navigateByUrl('/members'); 
          // this.cancel(); // And because at this point we destroy the home component, we don't need to use this dot cancel here either.
        },
        error: err => {
          console.log(err);
          this.validationErrors.set(err);
        }
      })


    }

  }

  cancel() {
    console.log('cancelled');
    this.cancelRegister.emit(false);
  }

}
