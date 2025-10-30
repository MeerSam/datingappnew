using System;
using Microsoft.AspNetCore.Identity;

namespace API.Entities;

public class AppUser : IdentityUser
{
    // Guid : Globally Unique Ids
    //  removing Id, Email, PasswordHash properties since we're deriving them from IdentityUser
    // public string Id { get; set; } = Guid.NewGuid().ToString();
    // public required string Email { get; set; }
    // public required byte[] PasswordHash { get; set; }
    // public required byte[] PasswordSalt { get; set; }

    public required string DisplayName { get; set; }

    public string? ImageUrl { get; set; }

    public string? RefreshToken { get; set; }

    public DateTime? RefreshTokenExpiry { get; set; }

    //navigation prop 
    public Member Member { get; set; } = null!;

}
