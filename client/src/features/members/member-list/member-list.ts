import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MemberService } from '../../../core/services/member-service';
import { filter, Observable } from 'rxjs';
import { Member, MemberParams } from '../../../types/member';
import { AsyncPipe } from '@angular/common';
import { MemberCard } from "../member-card/member-card";
import { PaginatedResult } from '../../../types/pagination';
import { Paginator } from "../../../shared/paginator/paginator";
import { FilterModal } from '../filter-modal/filter-modal';

@Component({
  selector: 'app-member-list',
  imports: [MemberCard, Paginator, FilterModal], //AsyncPipe
  templateUrl: './member-list.html',
  styleUrl: './member-list.css'
})
export class MemberList implements OnInit {
  @ViewChild('filterModal') modal!: FilterModal;

  // here we will use async pipe to work with observable 
  //instead of subscribe as before

  private memberService = inject(MemberService);
  // protected members$: Observable<Member[]>;
  // protected paginatedMembers$?: Observable<PaginatedResult<Member>>;
  protected paginatedMembers = signal<PaginatedResult<Member> | null>(null);


  //And conventionally when we're setting a property to be an observable (members$), then we can use a dollar and 
  // give this a type of observable of type member array. 
  protected memberParams = new MemberParams();
  private updatedParams = new MemberParams(); // this is not two way : only updates after we've submitted it to the API

  constructor (){
    const filters = localStorage.getItem('filters');
    if (filters){
      this.memberParams =JSON.parse(filters);
      this.updatedParams = JSON.parse(filters);
    }
  }

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers() {
    // this.paginatedMembers$ = this.memberService.getMembers(this.pageNumber, this.pageSize); // for this to work need to import AsyncPipe
    this.memberService.getMembers(this.memberParams).subscribe({
      next: result => {
        this.paginatedMembers.set(result);
      }
    });

  }

  onPageChange(event: { pageNumber: number; pageSize: number; }) {
    this.memberParams.pageNumber = event.pageNumber;
    this.memberParams.pageSize = event.pageSize;
    this.loadMembers();
  }

  openModal() {
    this.modal.open();
  }

  onClose() {
    console.log('Modal closed');
  }

  onFilterChange(data: MemberParams) {
    console.log('Modal submitted data :  ', data);
    // the ...data creates a shallow copy and the below this.updatedParams =  {...data};  
    //is done so that we only set the filter display message when we actually submit
    this.memberParams = {...data};
    this.updatedParams =  {...data}; 
    this.loadMembers();

  }

  resetFilters() {
    console.log('resetFilters', this.updatedParams );
    this.memberParams = new MemberParams();
    this.updatedParams = new MemberParams();
    console.log('after resetFilters', this.updatedParams );

    this.loadMembers();

  }
  get displayMessage(): string {
    const defaultParam = new MemberParams();

    const filters: string[] = [];
    if (this.updatedParams.gender) {
      filters.push(this.updatedParams.gender + 's');
    } else {
      filters.push('Males, Females');
    }
    if (this.updatedParams.minAge !== defaultParam.minAge ||
      this.updatedParams.maxAge !== defaultParam.maxAge)
      filters.push(`ages ${this.updatedParams.minAge} - ${this.updatedParams.maxAge}`)

    filters.push(this.updatedParams.orderBy === 'lastActive' ? 'Recently active' : 'Newest members');

    return (filters.length > 0 ? `Selected: ${filters.join(' | ') }`: 'All members');
  }

}
