import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-star-button',
  imports: [],
  templateUrl: './star-button.html',
  styleUrl: './star-button.css'
})
export class StarButton {
 disabled = input<boolean>(false); //input : if we're loading from parent (member photo) component 
 selected = input<boolean>(false); //input : if photo selected from parent (member photo) component 
 clicked = output<Event>();  // for the button clicked
 


 onClick(event: Event){
  this.clicked.emit(event);
 }

}
