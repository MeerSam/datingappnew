

using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace API.Entities;

public class Member
{
    public string Id { get; set; } = null!;
    public DateOnly DateOfBirth { get; set; }
    public string? ImageUrl { get; set; }
    public required string DisplayName { get; set; }
    public DateTime Created { get; set; } = DateTime.UtcNow;
    public DateTime LastActive { get; set; } = DateTime.UtcNow;
    public required string Gender { get; set; }
    public string? Description { get; set; }
    public required string City { get; set; }
    public required string Country { get; set; }

    //Navigation property
    //We'll be able to navigate from our member object in Entity Framework to the user, because it's going to be related.
    [JsonIgnore]
    public List<Photo> Photos { get; set; } = [];


    //And because we don't want to return this information when we return a list of members, we're also going 
    // to use the [JsonIgnore] property on these navigation properties.
    [JsonIgnore]
    public List<MemberLike> LikedByMembers { get; set; } = [];

    [JsonIgnore]
    public List<MemberLike> LikedMembers { get; set; } = [];

    [JsonIgnore]
    public List<Message> MessagesSent { get; set; } = [];

    [JsonIgnore]
    public List<Message> MessagesReceived { get; set; } = [];


    [JsonIgnore]
    [ForeignKey(nameof(Id))]
    public AppUser User { get; set; } = null!;



}
