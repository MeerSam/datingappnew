import { Component, inject } from '@angular/core';
import { MemberService } from '../../../core/services/member-service';
import { Observable } from 'rxjs';
import { Member } from '../../../types/member';
import { AsyncPipe } from '@angular/common';
import { MemberCard } from "../member-card/member-card";

@Component({
  selector: 'app-member-list',
  imports: [AsyncPipe, MemberCard],
  templateUrl: './member-list.html',
  styleUrl: './member-list.css'
})
export class MemberList {

  // here we will use async pipe to work with observable 
  //instead of subscribe as before

  private memberService =inject(MemberService);
  protected members$: Observable<Member[]>;
  //And conventionally when we're setting a property to be an observable (members$), then we can use a dollar and 
  // give this a type of observable of type member array.

  constructor(){
    this.members$ = this.memberService.getMembers(); // for this to work need to import AsyncPipe
  }
}
