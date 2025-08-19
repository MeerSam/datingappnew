import { Component, inject, OnInit, signal } from '@angular/core';
// import { MemberService } from '../../../core/services/member-service';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
// import { AsyncPipe } from '@angular/common';
import { filter, Observable } from 'rxjs';
import { Member } from '../../../types/member'; 
import { AgePipe } from '../../../core/pipes/age-pipe';

@Component({
  selector: 'app-member-detailed',
  imports: [RouterLink,RouterLinkActive, RouterOutlet, AgePipe],
  templateUrl: './member-detailed.html',
  styleUrl: './member-detailed.css'
})
//AsyncPipe, removed from imports
export class MemberDetailed  implements OnInit{
  

  // private memberService = inject(MemberService);
  private route = inject(ActivatedRoute);
  private router =inject(Router);
  // protected member$?: Observable<Member>; // we are not using the member-service anymore
  //instead member resolver so : following
  protected member = signal<Member | undefined>(undefined);
  protected title = signal<string|undefined>('Profile');
  

  ngOnInit(): void {
    // this.member$ = this.loadMember();
    this.route.data.subscribe({
      next: data => this.member.set(data['member'])
    });
    this.title.set(this.route.firstChild?.snapshot?.title);
    // getting the Page Title from app.routes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe({
      next: () => {
        this.title.set(this.route.firstChild?.snapshot.title)
      }
    })
  }
/* 
  loadMember(){
    // the id here in params must match app.route.ts path: "members/:id"
    const id = this.route.snapshot.paramMap.get('id');
    if(!id) return ;
    return this.memberService.getMember(id);

  } */

}
