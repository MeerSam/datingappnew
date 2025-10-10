import { Component, computed, inject, input } from '@angular/core';
import { Member } from '../../../types/member';
import { RouterLink } from '@angular/router';
import { AgePipe } from '../../../core/pipes/age-pipe';
import { LikesService } from '../../../core/services/likes-service';

@Component({
  selector: 'app-member-card',
  imports: [RouterLink, AgePipe],
  templateUrl: './member-card.html',
  styleUrl: './member-card.css'
})
export class MemberCard {

  private likeService = inject(LikesService);

  // this is going to be  a child component of member list and
  //  we will receive member data  from memberlist

  //member will be an input signal property received from memberlist

  member = input.required<Member>();

  protected hasLiked = computed(()=> this.likeService.likeIds().includes(this.member().id));

  toggleLike(event: Event){
    event.stopPropagation();
    this.likeService.toggleLike(this.member().id).subscribe({
      next: ()=>{
        if(this.hasLiked()){
          this.likeService.likeIds.update(ids=> ids.filter(x=> x !== this.member().id))
        } else{
          this.likeService.likeIds.update(ids => [...ids, this.member().id])
        }
      }
    })
  };

}
