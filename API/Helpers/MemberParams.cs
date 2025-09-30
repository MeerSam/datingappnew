using System;

namespace API.Helpers;

public class MemberParams : PagingParams
{
    //deriving from PagingParams:  that means that our member params includes all of the properties we've specified inside the paging params.

    public string? Gender { get; set; }
    public string? CurrentMemberId { get; set; } // to filter out the current member: logged in member

    public int MinAge { get; set; } = 18;

    public int MaxAge { get; set; } = 100;

    public string OrderBy { get; set; } = "lastActive";

}
