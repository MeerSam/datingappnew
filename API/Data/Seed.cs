using System;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using API.DTOs;
using API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class Seed
{
    /*When it comes to our users from this point forward: ASP.net identity  we don't need to use the app Dbcontext.
    AppDbContext context -> replaced with (UserManager<AppUser> userManager)
    when it comes to identity, what we're going to use from this point forwards is the user manager,*/
    public static async Task SeedUsers(UserManager<AppUser> userManager)
    {
        // this method executes on every app restart
        // so we check if data exists then we return
        if (await userManager.Users.AnyAsync()) return;

        var memberData = await File.ReadAllTextAsync("Data/UserSeedData.json");

        var members = JsonSerializer.Deserialize<List<SeedUserDto>>(memberData);

        if (members == null)
        {
            Console.WriteLine("No Members in seed data");
            return;
        }


        foreach (var member in members)
        {
            // we need to work on password Hash
            // using var hmac = new HMACSHA512(); // removed since using ASPNET IDENTITY

            var user = new AppUser
            {
                Id = member.Id,
                Email = member.Email,
                UserName = member.Email, // must be in for AspNET Identity
                DisplayName = member.DisplayName,
                ImageUrl = member.ImageUrl,
                // PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes("Pa$$w0rd")),
                // PasswordSalt = hmac.Key,
                Member = new Member
                {
                    Id = member.Id,
                    DisplayName = member.DisplayName,
                    Description = member.Description,
                    DateOfBirth = member.DateOfBirth,
                    ImageUrl = member.ImageUrl,
                    Gender = member.Gender,
                    City = member.City,
                    Country = member.Country,
                    LastActive = member.LastActive,
                    Created = member.Created,
                }
            };

            user.Member.Photos.Add(new Photo
            {
                Url = member.ImageUrl!,
                MemberId = member.Id
            });

            // context.Users.Add(user); //// removed since using ASPNET IDENTITY
            var result = await userManager.CreateAsync(user, "Pa$$w0rd");

            if (!result.Succeeded)
            {
                Console.WriteLine(result.Errors.First().Description);
            }
            await userManager.AddToRoleAsync(user, "Member");
        }

        // await context.SaveChangesAsync(); //// removed since using ASPNET IDENTITY

        //create admin role users after members are created
        var admin = new AppUser
        {
            UserName = "admin@test.com",
            Email = "admin@test.com",
            DisplayName = "Admin"
        };
        var resultAdmin = await userManager.CreateAsync(admin, "Pa$$w0rd");
        if (!resultAdmin.Succeeded)
        {
            Console.WriteLine(resultAdmin.Errors.First().Description);
        }
        await userManager.AddToRolesAsync(admin, ["Admin", "Moderator"]);
    }

}
