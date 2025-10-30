import { Directive, inject, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { AccountService } from '../../core/services/account-service';

/* So effectively we're going to use the view container to create or provide some HTML effectively, which
is going to be visible in the Dom. So long as the user meets the conditions specified in the app has role.*/
@Directive({
  selector: '[appHasRole]'
})
export class HasRole implements OnInit {
  
  @Input() appHasRole: string[] = [];
  private accountService = inject(AccountService);
  private viewContainerRef = inject(ViewContainerRef); //So it specifies what the user is going to see in the browser. in this container
  private templateRef = inject(TemplateRef);

  ngOnInit(): void {
     if(this.accountService.currentUser()?.roles?.some(r => this.appHasRole.includes(r))){
      this.viewContainerRef.createEmbeddedView(this.templateRef);
     } else{
      this.viewContainerRef.clear();
     }
  }

  
}
