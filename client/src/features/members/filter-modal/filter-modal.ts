import { Component, ElementRef, model, output, ViewChild } from '@angular/core';
import { MemberParams } from '../../../types/member';
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-filter-modal',
  imports: [FormsModule],
  templateUrl: './filter-modal.html',
  styleUrl: './filter-modal.css'
})
export class FilterModal {
  @ViewChild('filterModal') modalRef!: ElementRef<HTMLDialogElement>; //template reference variable.

  closeModal =output();
  submitData =output<MemberParams>();
  // memberParams = new MemberParams(); // we'll  use model type  property as this will clear filters from the Select filter component
  memberParams = model(new MemberParams());// model is input/writable

  constructor(){
    const filters = localStorage.getItem('filters'); 
    if (filters) { 
      this.memberParams.set(JSON.parse(filters)); 
    }
  }

  open(){
    console.log('filter modal open() : ' , this.memberParams());
    const filters = localStorage.getItem('filters'); 
    if (filters) { 
      this.memberParams.set(JSON.parse(filters)); 
    }
    this.modalRef.nativeElement.showModal(); //  this is native JavaScript functionality that works with HTML dialog elements.
  }

  close() {
    this.modalRef.nativeElement.close();
    this.closeModal.emit(); // not emitting anything This is really just a notification going up to the parent to say the modal has been closed.
  }
  
  submit() {
    this.submitData.emit(this.memberParams());
    this.close();
  }

  onMinAgeChange(){
    if (this.memberParams().minAge < 18) this.memberParams().minAge =18; 

  }

  onMaxAgeChange(){
    if(this.memberParams().maxAge < this.memberParams().minAge){
      this.memberParams().maxAge = this.memberParams().minAge
    }
  }

}
