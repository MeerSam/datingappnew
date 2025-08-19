import { Component, input } from '@angular/core';
import { Member } from '../../../types/member';
import { RouterLink } from '@angular/router';
import { AgePipe } from '../../../core/pipes/age-pipe';

@Component({
  selector: 'app-member-card',
  imports: [RouterLink, AgePipe],
  templateUrl: './member-card.html',
  styleUrl: './member-card.css'
})
export class MemberCard {

  // this is going to be  a child component of member list and
  //  we will receive member data  from memberlist

  //member will be an input signal property received from memberlist

  member = input.required<Member>();

}
