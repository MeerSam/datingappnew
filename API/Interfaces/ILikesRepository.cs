using System;
using API.Entities;
using API.Helpers;

namespace API.Interfaces;

public interface ILikesRepository
{
    // define contract here 

    Task<MemberLike?> GetMemberLike(string sourceMemberId, string targetMemberId); //returns single member like.
    Task<PaginatedResult<Member>> GetMemberLikes(LikesParams likesParam);
    //predicate will define what kind of list we want : List of Current User Likes, of User Liked By or mutual likes
    //removed string predicate, string memberId, as params added to LikesParam
    Task<IReadOnlyList<string>> GetCurrentMemberLikeIds(string memberId);
    // returns list of Ids of the members the current User has liked.

    void DeleteLike(MemberLike like);

    void AddLike(MemberLike like);

    // Task<bool> SaveAllChanges();// implemnted Using IUnitOfWork


}
