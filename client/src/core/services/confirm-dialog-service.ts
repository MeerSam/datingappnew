import { Injectable } from '@angular/core';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {

  private dialogComponent?: ConfirmDialog; // 

  // no need for constructor

  register(component: ConfirmDialog){
    this.dialogComponent = component;
  }

  confirm(message :string) : Promise<boolean>{
    if (! this.dialogComponent){
      throw new Error('confirm dialog component is not registered')
    }
    return this.dialogComponent.open(message);
  }
  
}
