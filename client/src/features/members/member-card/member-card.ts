import { Component, computed, inject, input } from '@angular/core';
import { Member } from '../../../types/member';
import { RouterLink } from '@angular/router';
import { AgePipe } from '../../../core/pipes/age-pipe';
import { LikesService } from '../../../core/services/likes-service';
import { PresenceService } from '../../../core/services/presence-service';

@Component({
  selector: 'app-member-card',
  imports: [RouterLink, AgePipe],
  templateUrl: './member-card.html',
  styleUrl: './member-card.css'
})
export class MemberCard {

  private likesService = inject(LikesService);
  private presenceService = inject(PresenceService);

  // this is going to be  a child component of member list and
  //  we will receive member data  from memberlist

  //member will be an input signal property received from memberlist

  member = input.required<Member>();

  protected hasLiked = computed(() => this.likesService.likeIds().includes(this.member().id));
  protected isOnline = computed(() => this.presenceService.onlineUsers().includes(this.member().id))
  //callback func : this.presenceService.onlineUsers().includes(this.member().id)

  toggleLike(event: Event){
    event.stopPropagation();
    this.likesService.toggleLike(this.member().id);
    // // moving this to the like-service.ts 
    // .subscribe({
    //   next: ()=>{
    //     if(this.hasLiked()){
    //       this.likeService.likeIds.update(ids=> ids.filter(x=> x !== this.member().id))
    //     } else{
    //       this.likeService.likeIds.update(ids => [...ids, this.member().id])
    //     }
    //   }
    // });
  };

}
