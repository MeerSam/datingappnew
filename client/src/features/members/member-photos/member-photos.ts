import { Component, inject, OnInit, signal } from '@angular/core';
import { MemberService } from '../../../core/services/member-service';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Member, Photo } from '../../../types/member';
// import { AsyncPipe } from '@angular/common';
import { ImageUpload } from "../../../shared/image-upload/image-upload";
import { AccountService } from '../../../core/services/account-service';
import { User } from '../../../types/user';
import { StarButton } from "../../../shared/star-button/star-button";
import { DeleteButton } from "../../../shared/delete-button/delete-button";

@Component({
  selector: 'app-member-photos',
  imports: [ImageUpload, StarButton, DeleteButton], //AsyncPipe, 
  templateUrl: './member-photos.html',
  styleUrl: './member-photos.css'
})
export class MemberPhotos implements OnInit {
  protected memberService = inject(MemberService);
  private route = inject(ActivatedRoute);
  protected accountService = inject(AccountService);
  // protected photos$?:Observable<Photo[]>;// changed to Signal
  protected photos = signal<Photo[]>([]);// changed to Signal from Observable
  protected loading = signal(false);

  // constructor() {
  //   //moved to OnInit  
  // }
  ngOnInit(): void {
    console.log('editmode()= ', this.memberService.editMode());
    const memberId = this.route.parent?.snapshot.paramMap.get('id');
    if (memberId) {
      this.memberService.getMemberPhotos(memberId).subscribe({
        next: photos => this.photos.set(photos)
      }); // for this to work need to import AsyncPipe
    }
  }

  onUploadImage(file: File) {
    this.loading.set(true);
    this.memberService.uploadPhoto(file).subscribe({
      next: photo => {
        this.memberService.editMode.set(false);
        this.loading.set(false);
        this.photos.update(photos => [...photos, photo]) //... spread operator existing array of photos  and add also the new photo to the array

        if (!this.memberService.member()?.imageUrl) {
          this.setMainLocalPhoto(photo)
        }
      },
      error: error => {
        console.log('Error uploading image: ', error);
        this.loading.set(false);
      }
    })
  }

  setMainPhoto(photo: Photo) {
    this.memberService.setMainPhoto(photo).subscribe({
      next: () => { 
        this.setMainLocalPhoto(photo)
      }
    })

  }


  deletePhoto(photoId: number) {
    this.memberService.deletePhoto(photoId).subscribe({
      next: () => {
        this.photos.update(photos => photos.filter(x => x.id !== photoId))
      }
    })

  }

  private setMainLocalPhoto(photo: Photo){
    const currentUser = this.accountService.currentUser();
        if (currentUser) currentUser.imageUrl = photo.url;
        this.accountService.setCurrentUser(currentUser as User);
        this.memberService.member.update(member => ({
          ...member, imageUrl: photo.url
        }) as Member) //From this we'll take the existing properties of the member...member  and we'll set the image URL to be the photo.url 
  }

  // get photoMocks() {
  //   return Array.from({ length: 20, }, (_, i) => ({
  //     url: '/user.png'
  //   }))
  // }

}
