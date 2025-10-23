import { Component, computed, effect, ElementRef, inject, input, OnInit, signal, ViewChild } from '@angular/core';
import { MessageService } from '../../../core/services/message-service';
import { Message } from '../../../types/message';
import { AccountService } from '../../../core/services/account-service';
import { MemberService } from '../../../core/services/member-service';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TimeAgoPipe } from '../../../core/pipes/time-ago-pipe';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-member-messages',
  imports: [DatePipe, TimeAgoPipe, FormsModule], //FormsModule: for two way binding and ngModel
  templateUrl: './member-messages.html',
  styleUrl: './member-messages.css'
})
export class MemberMessages implements OnInit {
  // this compenent will ahve a Live messaging functionality where is the other user messages 
  // we will need to see it right away annd not the cached value.
  @ViewChild('messageEndRef') messageEndRef!: ElementRef; // using ! - overriding the warning of possible null
  // when the component  constructed it will be null
  private memberService = inject(MemberService);
  private messageService = inject(MessageService);
  protected messages = signal<Message[]>([]);
  protected messageContent = '';

  constructor() {
    // since zonless angular we need to use effect from angular core : Once registered during compoent creation at constructor 
    // a side effect when a components currentMessages value changes. to scroll to the bottom
    effect(() => {
      const currentMessages = this.messages();
      if (currentMessages.length > 0) {
        this.scrollToBottom();
      }
    })
  }

  ngOnInit(): void {
    this.loadMessageThread();
  }

  loadMessageThread() {
    // const memberId = this.route.parent?.snapshot.paramMap.get('id'); 
    const memberId = this.memberService.member()?.id;
    if (memberId) {
      this.messageService.getMessageThread(memberId).subscribe({
        next: response => {
          this.messages.set(response.map(message => ({
            ...message,
            currentUserSender: message.senderId != memberId
          })))
        },
        // complete : () => this.scrollToBottom() // in theory if we were using normal angular with zone based detection, then 
        // this method would be executed and we would scroll to the bottom. 
        // But we're not going to see that behavior using that approach because we don't have zone based change detection.
      });
    }
  }

  sendMessage() {
    const recipientId = this.memberService.member()?.id;
    if (!recipientId) return;
    this.messageService.sendMessage(recipientId, this.messageContent).subscribe({
      next: message => {
        this.messages.update(messages => {
          message.currentUserSender = true;
          return [...messages, message]
        })
        this.messageContent = '';
      },

    })
  }

  scrollToBottom() {
    // we can just wrap this in a set timeout.And set timeout is going to delay the execution of this
    // until after the current JavaScript call stack has been cleared.
    setTimeout(() => {
      if (this.messageEndRef) {
        this.messageEndRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }
    })
  }
}
