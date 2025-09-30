import { Component, computed, input, model, output } from '@angular/core';

@Component({
  selector: 'app-paginator',
  imports: [],
  templateUrl: './paginator.html',
  styleUrl: './paginator.css'
})
export class Paginator {
  //But input properties are not writable signals.So we need to receive something. 
  // But because we're going to use this in the Paginator template, we also need it to be writable.
  // And we do have a special signal that we can use that achieves that.It's both an input and it's writable and it's called the model signal, 
  // and we'll give this an initial value of just one.
  pageNumber = model(1);
  pageSize = model(10);
  totalCount = input(0);
  totalPages = input(0);

  pageChange= output<{pageNumber: number, pageSize: number}>();
  pageSizeOptions = input([5,10,20,50]);

  lastItemIndex =  computed(() => {
    return Math.min(this.pageNumber() * this.pageSize(), this.totalCount())
  })




  onPageChange(newPage?: number, pageSize?: EventTarget | null){
    console.log('this.pageNumber=', this.pageNumber());
    if (newPage) {
        this.pageNumber.set(newPage)
    } else if (this.pageNumber > this.totalPages) {
    this.pageNumber.set(1) ;
    }
    // console.log('this.pageNumber=', this.pageNumber());
    // console.log('newPage : ',newPage);
    // console.log('totalPages : ',this.totalPages());
    if(pageSize) {
      const size = Number((pageSize as HTMLSelectElement).value)
      this.pageSize.set(size);
    };

    this.pageChange.emit({
      pageNumber : this.pageNumber(),
      pageSize : this.pageSize()

    })
  }

  

}
