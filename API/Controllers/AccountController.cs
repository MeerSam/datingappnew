using System;
using System.Security.Cryptography;
using System.Text;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

public class AccountController(UserManager<AppUser> userManager, ITokenService tokenService) : BaseApiController
{
    // Reminder that we're using conventions for the name of the controller.
    // So controller has to be spelled accurately in order that we can use this as a route parameter 
    //  ../api/account/..    
    //replacing AppDbContext context:  UserManager
    [HttpPost("register")] // /api/account/register

    public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
    {

        // if (await EmailExists(registerDto.Email)) return BadRequest("Email Taken"); //removed: aspnet-identity
        // var hmac = new HMACSHA512();//removed: aspnet-identity
        var user = new AppUser
        {
            DisplayName = registerDto.DisplayName,
            Email = registerDto.Email,
            UserName = registerDto.Email, // as per Identity rule we need to have username
            // // removed : provided by dotnet identity
            // PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDto.Password)),
            // PasswordSalt = hmac.Key,

            Member = new Member
            {
                DisplayName = registerDto.DisplayName,
                Gender = registerDto.Gender,
                City = registerDto.City,
                Country = registerDto.Country,
                DateOfBirth = registerDto.DateOfBirth
            }

        };
        var result = await userManager.CreateAsync(user, registerDto.Password);

        if (!result.Succeeded)
        {
            foreach (var error in result.Errors)
            {
                // So we'll access model states, part of our controller 
                // that we have access to & then we can add the model error.
                ModelState.AddModelError("identity", error.Description);
            }
            return ValidationProblem();
        }

        await userManager.AddToRoleAsync(user, "Member");
        // context.Users.Add(user);
        // await context.SaveChangesAsync();
        await SetRefreshTokenCookie(user);

        return await user.ToDto(tokenService);
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
    {
        // overriding x.Email warning about Email being null with !
        // var user = await context.Users.SingleOrDefaultAsync(x => x.Email!.ToLower() == loginDto.Email.ToLower());

        var user = await userManager.FindByEmailAsync(loginDto.Email);

        if (user == null) return Unauthorized("Invalid creadentials entered (email)");
        /* using var hmac = new HMACSHA512(user.PasswordSalt);
        var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDto.Password));
        for (var i = 0; i < computedHash.Length; i++)
        {
            if (computedHash[i] != user.PasswordHash[i]) return Unauthorized("Invalid Username or Password");
        } */

        var result = await userManager.CheckPasswordAsync(user, loginDto.Password);
        if (!result)
        {
            return Unauthorized("Invalid Username or Password");
        }


        // moved to extension
        await SetRefreshTokenCookie(user);
        
        return await user.ToDto(tokenService);
    }
    /* private async Task<bool> EmailExists(string email)
    {
        // overriding x.Email warning about Email being null with !
        return await context.Users.AnyAsync(x => x.Email!.ToLower() == email.ToLower());
    } */
    [HttpPost("refresh-token")]
    public async Task<ActionResult<UserDto>> RefreshToken()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (refreshToken == null) return NoContent();

        var user = await userManager.Users
            .FirstOrDefaultAsync(x => x.RefreshToken == refreshToken
            && x.RefreshTokenExpiry > DateTime.UtcNow);

        if (user == null) return Unauthorized();
        
        await SetRefreshTokenCookie(user);
        
        return await user.ToDto(tokenService);

    }

    private async Task SetRefreshTokenCookie(AppUser user)
    {
        var refreshToken = tokenService.GenerateRefreshToken();
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7); //make it a long live token
        await userManager.UpdateAsync(user);

        var cookieOptions = new CookieOptions
        {
            HttpOnly = true, //this cookie is not accessible from any kind of JavaScript, including our own client application.
            // We will not be able to get access to this cookie client side.
            Secure = true, // only sent over https and not over http
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(7)
        };

        Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);

    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<ActionResult> Logout()
    {
        await userManager.Users
            .Where(x=> x.Id == User.GetMemberId())
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(x => x.RefreshToken,  _=> null)
                .SetProperty(x => x.RefreshTokenExpiry , _=> null));

        Response.Cookies.Delete("refreshToken");

        return Ok();
    }

}
