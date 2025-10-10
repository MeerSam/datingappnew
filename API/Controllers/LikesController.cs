 /* 
 create a method inside here to toggle. And it's kind of got a dual purpose really because we're going to be creating a like if they don't already

like the user.And we're going to be deleting a like if they do already like the user and they hit this method.
  */

using System;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

//localhost:5001/api/likes
public class LikesController(ILikesRepository likesRepository) : BaseApiController
{
    [HttpPost("{targetMemberId}")]
    public async Task<ActionResult> ToggleLike(string targetMemberId)
    {
        var sourceMemberId = User.GetMemberId();

        if (sourceMemberId == targetMemberId) return BadRequest("You cannot like yourself");

        var existingLike = await likesRepository.GetMemberLike(sourceMemberId, targetMemberId);

        if (existingLike == null)
        {
            var like = new MemberLike
            {
                SourceMemberId = sourceMemberId,
                TargetMemberId = targetMemberId
            };
            likesRepository.AddLike(like);

        }
        else
        {
            likesRepository.DeleteLike(existingLike);
        }

        if (await likesRepository.SaveAllChanges()) return Ok();

        return BadRequest("Failed to update like");

    }

    [HttpGet("list")]
    public async Task<ActionResult<IReadOnlyList<string>>> GetCurrentMemberLikeIds()
    {
        return Ok(await likesRepository.GetCurrentMemberLikeIds(User.GetMemberId()));

    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResult<Member>>> GetCurrentMemberLikes(
        [FromQuery] LikesParams likesParams)
    {
        // string predicate remoived as param  
        likesParams.MemberId = User.GetMemberId();
        
        var members = await likesRepository.GetMemberLikes(likesParams);

        return Ok(members);
        
    }

}
