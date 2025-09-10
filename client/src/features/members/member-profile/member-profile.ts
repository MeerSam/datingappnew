import { Component, HostListener, inject, OnDestroy, OnInit, signal, ViewChild, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EditableMember, Member } from '../../../types/member';
import { DatePipe } from '@angular/common';
import { MemberService } from '../../../core/services/member-service';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastService } from '../../../core/services/toast-service';
import { AccountService } from '../../../core/services/account-service';

@Component({
  selector: 'app-member-profile',
  imports: [DatePipe, FormsModule],
  templateUrl: './member-profile.html',
  styleUrl: './member-profile.css'
})
export class MemberProfile implements OnInit, OnDestroy {

  @ViewChild('editForm') editForm?: NgForm; // parent component (MemberProfile) gets access to the editForm-Form using ViewChild() 
  @HostListener('window:beforeunload', ['$event']) notify($event:BeforeUnloadEvent){
    if (this.editForm?.dirty){
      $event.preventDefault();
      
    }
  }
  // private route = inject(ActivatedRoute); // not using this for data['member']
  protected memberService = inject(MemberService);
  private toast = inject(ToastService)
  private accountService = inject(AccountService);
  // protected member = signal<Member | undefined>(undefined); // not using this for data['member']
  protected editableMember: EditableMember ={
    displayName: '',
    description: '',
    city: '',
    country: '',
  }; 
  ngOnInit(): void {
    // //  now instead of getting member from route resolvers data['member'] use the member service.
    // this.route.parent?.data.subscribe(data => {
    //   this.member.set(data['member'])
    // })

    // this.member()?.displayName to this.memberService.member()?.displayName
    this.editableMember = {
      displayName: this.memberService.member()?.displayName || '',
      description: this.memberService.member()?.description || '',
      city: this.memberService.member()?.city || '',
      country: this.memberService.member()?.country || '',
    }    
  }
  /* 
  Another router feature it's called a resolver.
  We can use our router to go and fetch the data and then it's available when our router is activated.
  Or we should say it's available before our route is activated.
  So when we go to a route we're going to use this resolver to resolve the data.And then it's going to be available inside our router. */


  updateProfile() {
    if (!this.memberService.member()) return;
    // ... spread operator : which will give us all the properties of this.member() and this.editableMember Objects 
    const updatedMember = { ...this.memberService.member(), ...this.editableMember }
    // console.log(updatedMember);
    this.memberService.updateMember(this.editableMember).subscribe({
      next: () => {
        const currentUser = this.accountService.currentUser();
        if( currentUser && updatedMember.displayName !== currentUser?.displayName){
          currentUser.displayName = updatedMember.displayName;
          this.accountService.setCurrentUser(currentUser);
        }
        this.toast.success('Profile updated successfully');
        this.memberService.editMode.set(false);
        this.memberService.member.set(updatedMember as Member) //as Member removes the typesript 
        this.editForm?.reset(updatedMember);
      }
    });
    //.editForm?.reset with updated member values :  is done to reset the forms dirty flag to to set to false 
    // otherwise it will keep giving us confirmation message. so we need to reset it to move to other parts
  }

  ngOnDestroy(): void {
    if (this.memberService.editMode) {
      console.log('resetting editmode to false... current value', this.memberService.editMode())
      this.memberService.editMode.set(false);

    }
  }
}
