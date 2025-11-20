using System;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class LikesRepository(AppDbContext context) : ILikesRepository
{
    // C# 12 allows constructor to be speciafied as above 
    // - It means the class takes a constructor parameter context of type AppDbContext,
    //  and this parameter is available throughout the class (like a field)

    public void AddLike(MemberLike like)
    {
        context.Likes.Add(like);
    }

    public void DeleteLike(MemberLike like)
    {
        context.Likes.Remove(like);
    }

    /// <summary>
    /// Takes the Current member's Id as Input.
    /// </summary>
    /// <param name="memberId">Takes the Current member's Id</param>
    /// <returns>Returns list of memberIds that are like by current member</returns>
    public async Task<IReadOnlyList<string>> GetCurrentMemberLikeIds(string memberId) 
    {
        return await context.Likes
        .Where(x => x.SourceMemberId == memberId)
        .Select(x => x.TargetMemberId) // projecting using select
        .ToListAsync();
    }

    public async Task<MemberLike?> GetMemberLike(string sourceMemberId, string targetMemberId)
    {
        return await context.Likes
            .FindAsync(sourceMemberId, targetMemberId);

    }

    /// <summary>Returns a list of members based on the predicate: liked, liked by others, or mutually liked.</summary>
    /// <param name="predicate">"liked", "likeBy", or default for mutual likes</param>
    /// <param name="memberId">The ID of the current member</param>
    /// <returns>List of matching members based on predicate</returns>
    public async Task<PaginatedResult<Member>> GetMemberLikes(LikesParams likesParam)
    {
        // changed from IReadOnlyList to PaginatedResult
        // predicate 'liked' : Members who are Liked by the member (memberId). 
        // predicate 'likedBy' : Members Who liked the member (memberId)
        // predicate 'mutual': Members liked each other by (memberId)
        //removed string predicate, string memberId,  as parameters
        var query = context.Likes.AsQueryable();
        IQueryable<Member> result;
        switch (likesParam.Predicate)
        {
            case "liked":
                result = query
                    .Where(x => x.SourceMemberId == likesParam.MemberId)
                    .Select(x => x.TargetMember);
                break;

            // return await query
            //        .Where(x => x.SourceMemberId == memberId)
            //        .Select(x => x.TargetMember)
            //        .ToListAsync();

            case "likedBy":
                result = query
                    .Where(x => x.TargetMemberId == likesParam.MemberId)
                    .Select(x => x.SourceMember);
                break;
                // return await context.Likes
                // .Where(x => x.TargetMemberId == memberId)
                // .Select(x => x.SourceMember);
                // .ToListAsync();
            default:
                var likeIds = await GetCurrentMemberLikeIds(likesParam.MemberId);
                result = query
                    .Where(x => x.TargetMemberId == likesParam.MemberId && likeIds.Contains(x.SourceMemberId))
                    .Select(x => x.SourceMember);
                    break;

                // return await context.Likes
                //     .Where(x => x.TargetMemberId == memberId
                //     && likeIds.Contains(x.SourceMemberId))
                //     .Select(x => x.SourceMember)
                //     .ToListAsync();

        }

        return  await Paginationhelper.CreateAsync(result,
        likesParam.PageNumber, likesParam.PageSize);;
    }
    // Moved to IUnitofWork repository
    // public async Task<bool> SaveAllChanges()
    // {
    //     return await context.SaveChangesAsync() > 0;
    // }
}
