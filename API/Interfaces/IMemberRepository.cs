using System;
using API.Entities;
using API.Helpers;

namespace API.Interfaces;

public interface IMemberRepository
{

    //create signature for the methods that will be implemnted
    void Update(Member member);
    // Task<bool> SaveAllAsync(); // implemnted Using IUnitOfWork
    Task<PaginatedResult<Member>> GetMembersAsync(MemberParams memberParams);
    Task<Member?> GetMemberByIdAsync(string id);
    Task<IReadOnlyList<Photo>> GetPhotosForMemberAsync(string memberId);

    Task<Member?> GetMemberForUpdateAsync(string id);

}
