import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  // services are both injectable and singleton  So they're instantiated when our angular application starts.
  constructor(){
    this.createToastContainer();
  }

  private createToastContainer() {
      if (!document.getElementById('toast-container')){
        const container = document.createElement('div');
        container.id ='toast-container';
        container.className = 'toast toast-bottom toast-end';
        document.body.appendChild(container);
      }
  }
  private createToastElement(message: string, alertClass: string, duration =5000){
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return  ;

    const toast = document.createElement('div');
    toast.classList.add('alert', alertClass, 'shadow-lg');
    //  `Back ticks allows us to use template strings Javascript + normal strings'
    toast.innerHTML = `
    <span>${message}</span>
    <button class="ml-4 btn btn-sm btn-ghost" >x</button>
    `
    toast.querySelector('button')?.addEventListener('click' , ()=> {
      toastContainer.removeChild(toast);
    });

    toastContainer.append(toast);
    // close the toast after the set duration
    setTimeout(() => {
      if (toastContainer.contains(toast)) {
        toastContainer.removeChild(toast);
      }
    }, duration);

  }

  success(message:string, duration?:number){
    this.createToastElement(message, 'alert-success', duration);
  }

  error(message:string, duration?:number){
    this.createToastElement(message, 'alert-error', duration);
  }

  warning(message:string, duration?:number){
    this.createToastElement(message, 'alert-warning', duration);
  }

  info(message:string, duration?:number){
    this.createToastElement(message, 'alert-info', duration);
  }

}
