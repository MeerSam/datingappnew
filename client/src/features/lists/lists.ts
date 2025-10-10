import { Component, inject, OnInit, signal } from '@angular/core';
import { LikesService } from '../../core/services/likes-service';
import { LikesParams, Member } from '../../types/member';
import { MemberCard } from "../members/member-card/member-card";
import { Paginator } from "../../shared/paginator/paginator";
import { PaginatedResult } from '../../types/pagination';

@Component({
  selector: 'app-lists',
  imports: [MemberCard, Paginator],
  templateUrl: './lists.html',
  styleUrl: './lists.css'
})
export class Lists implements OnInit {
  private likesService = inject(LikesService);
  // protected members = signal<Member[]>([]); //g Paginated members
  protected paginatedMembers = signal<PaginatedResult<Member> | null>(null);
  protected predicate = 'liked';

  protected likesParams = new LikesParams();
  // array for the tabs with objects
  tabs = [
    { label: 'Liked', value: 'liked' },
    { label: 'Liked me', value: 'likedBy' },
    { label: 'Mutual', value: 'mutual' },
  ]


  ngOnInit(): void {
    this.loadLikes();
  }


  setPredicate(predicate: string) {
    if (predicate !== this.predicate) {
      this.predicate = predicate;
      this.likesParams.pageNumber = 1;
      this.loadLikes();
    }

  }


  loadLikes() {
    this.likesParams.predicate = this.predicate;
    this.likesService.getLikes(this.likesParams).subscribe({
      next: result => {
        // console.log(result);
        this.paginatedMembers.set(result);
      }

    })

  }
  onPageChange(event: { pageNumber: number; pageSize: number; }) {
    this.likesParams.pageNumber = event.pageNumber;
    this.likesParams.pageSize = event.pageSize;
    this.loadLikes();
  }
}
