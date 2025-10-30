using System;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Interfaces;

namespace API.Extensions;

public static class AppUserExtensions
{
    // because this class is an extention we made it static 
    //meaning we do not need to create an instance of it and can directly use it 
    // note: cannot use dependency injection therefore  the TokenService was passed as parameter

    public static async Task<UserDto> ToDto(this AppUser user, ITokenService tokenService)
    { 
        return new UserDto
        {
            Id = user.Id,
            Email = user.Email!,
            DisplayName = user.DisplayName,
            ImageUrl = user.ImageUrl,
            Token = await tokenService.CreateToken(user)
        }; 
    }
}
