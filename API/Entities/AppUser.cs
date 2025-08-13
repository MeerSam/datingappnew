using System;

namespace API.Entities;

public class AppUser
{
    // Guid : Globally Unique Ids
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public required string DisplayName { get; set; }

    public string? ImageUrl { get; set; }
    public required string Email { get; set; }

    public required byte[] PasswordHash { get; set; }

    public required byte[] PasswordSalt { get; set; }
    //nav prop 

    public Member Member { get; set; } = null!;

}
