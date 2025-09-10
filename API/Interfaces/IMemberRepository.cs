using System;
using API.Entities;

namespace API.Interfaces;

public interface IMemberRepository
{

    //create signature for the methods that will be implemnted
    void Update(Member member);
    Task<bool> SaveAllAsync();
    Task<IReadOnlyList<Member>> GetMembersAsync();
    Task<Member?> GetMemberByIdAsync(string id);
    Task<IReadOnlyList<Photo>> GetPhotosForMemberAsync(string memberId);

    Task<Member?> GetMemberForUpdateAsync(string id);

}
