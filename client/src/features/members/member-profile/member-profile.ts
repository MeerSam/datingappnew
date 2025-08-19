import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Member } from '../../../types/member';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-member-profile',
  imports: [DatePipe],
  templateUrl: './member-profile.html',
  styleUrl: './member-profile.css'
})
export class MemberProfile implements OnInit {
    private route = inject(ActivatedRoute);
    protected member = signal<Member | undefined>(undefined);


  ngOnInit(): void {
    this.route.parent?.data.subscribe(data => {
      this.member.set(data['member'])
    })
  }
/* 
Another router feature it's called a resolver.
We can use our router to go and fetch the data and then it's available when our router is activated.
Or we should say it's available before our route is activated.
So when we go to a route we're going to use this resolver to resolve the data.And then it's going to be available inside our router. */



}
