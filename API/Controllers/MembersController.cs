using System.Security.Claims;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
//using Microsoft.EntityFrameworkCore;


/* Use this Controller for : 
IPhotoService : upload an image to Cloudinary. also be saving it into our members table as well as the photos table.
depending on whether it is the first time they've uploaded an image, 
then we'd also need to set the member's image URL property and also the user as well. */

namespace API.Controllers
{
    [Authorize]
    public class MembersController(IUnitOfWork uow,
    IPhotoService photoService) : BaseApiController
    {
        // Reminder that we're using conventions for the name of the controller.
        // So controller has to be spelled accurately in order that we can use this as a route parameter 
        //  ../api/members
        [HttpGet]//localhost:5001/api/members
        public async Task<ActionResult<IReadOnlyList<Member>>> GetMembers([FromQuery] MemberParams memberParams)
        {
            // Injecting AppDbContext as ->   MembersController(AppDbContext context)
            // Changed to IMemberRepository
            //Task<ActionResult<IReadOnlyList<AppUser>>>
            // var members = await context.Users.ToListAsync();
            // return members;

            // return await uow.MemberRepository.GetMembersAsync(); // gives error so we wrap in OK()
            memberParams.CurrentMemberId = User.GetMemberId();
            return Ok(await uow.MemberRepository.GetMembersAsync(memberParams));

        }

        [HttpGet("{id}")] //localhost:5001/api/members/bob-id
        public async Task<ActionResult<Member>> GetMember(string id)
        {
            // var member = await context.Users.FindAsync(id);

            var member = await uow.MemberRepository.GetMemberByIdAsync(id);
            if (member == null) return NotFound();
            return member;

        }

        [HttpGet("{id}/photos")]//localhost:5001/api/members/bob-id

        public async Task<ActionResult<IReadOnlyList<Photo>>> GetMemberPhotos(string id)
        {
            return Ok(await uow.MemberRepository.GetPhotosForMemberAsync(id));

        }

        [HttpPut] // localhost:5001/api/members
        // Update :Now an update is an http put request, and we don't need to take any parameters inside here 
        // because we're going to be able to get the ID of the user because they're going to need to authenticate to this controller.
        // So we're going to be able to get their user ID or their member ID from the token that they send up as part of authenticating to this request.
        public async Task<ActionResult> UpdateMember(MemberUpdateDto memberUpdateDto)
        {
            // var memberId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            // if (memberId == null) return BadRequest("Oops - no id found in token");

            var memberId = User.GetMemberId();

            var member = await uow.MemberRepository.GetMemberForUpdateAsync(memberId);

            if (member == null) return BadRequest("Could not get a member");

            member.DisplayName = memberUpdateDto.DisplayName ?? member.DisplayName;
            member.Description = memberUpdateDto.Description ?? member.Description;
            member.City = memberUpdateDto.City ?? member.City;
            member.Country = memberUpdateDto.Country ?? member.Country;
            member.User.DisplayName = memberUpdateDto.DisplayName ?? member.User.DisplayName;
            uow.MemberRepository.Update(member); //optional

            if (await uow.Complete()) return NoContent(); // return nocontent since its a update
            return BadRequest("Failed to update member"); // in case if the save is unsuccesfull return badreq
        }

        [HttpPost("add-photo")] // /api/members/add-photo
        public async Task<ActionResult<Photo>> AddPhoto([FromForm] IFormFile file)
        {
            //  file will not come through body but [FromForm] to tell our API controller where to go looking for
            var memberId = User.GetMemberId();
            var member = await uow.MemberRepository.GetMemberForUpdateAsync(memberId);

            if (member == null) return BadRequest("Could not get a member to add photos");

            var result = await photoService.UploadPhotoAsync(file);

            if (result.Error != null) return BadRequest(result.Error.Message);

            var photo = new Photo
            {
                Url = result.SecureUrl.AbsoluteUri,
                PublicId = result.PublicId,
                MemberId = memberId
            };

            if (member.ImageUrl == null)
            {
                member.ImageUrl = photo.Url;
                member.User.ImageUrl = photo.Url;
            }

            member.Photos.Add(photo);

            if (await uow.Complete()) return photo;

            return BadRequest("Problem adding Photo");
        }

        [HttpPut("set-main-photo/{photoId}")]
        public async Task<ActionResult> SetMainPhoto(int photoId)
        {
            var member = await uow.MemberRepository.GetMemberForUpdateAsync(User.GetMemberId());

            if (member == null) return BadRequest("Cannot get a member from token");

            var photo = member.Photos.SingleOrDefault(x => x.Id == photoId);

            if (member.ImageUrl == photo?.Url || photo == null)
            {
                return BadRequest("Cannot set this as main image");
            }

            member.ImageUrl = photo.Url;
            member.User.ImageUrl = photo.Url;


            if (await uow.Complete()) return NoContent(); // return nocontent since its a update

            return BadRequest("Problem setting main photo"); // in case if the save is unsuccesfull return bad req
        }

        [HttpDelete("delete-photo/{photoId}")]

        public async Task<ActionResult> DeletePhoto(int photoId)
        {
            var member = await uow.MemberRepository.GetMemberForUpdateAsync(User.GetMemberId());

            if (member == null) return BadRequest("Could not get a member to delete  photos");

            var photo = member.Photos.SingleOrDefault(x => x.Id == photoId);

            if (member.ImageUrl == photo?.Url || photo == null)
            {
                return BadRequest("This photo cannot be deleted");
            }

            if (photo.PublicId != null)
            {
                // this exists in Cloudinary and we need to delete from here
                var result = await photoService.DeletePhotoAsync(photo.PublicId);
                if (result.Error != null) return BadRequest(result.Error.Message);

            }

            member.Photos.Remove(photo);
            if (await uow.Complete()) return Ok();

            return BadRequest("Problem deleting the photo"); // in case if the save is unsuccesfull return bad req
        }


    }
}
