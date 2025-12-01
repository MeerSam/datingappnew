using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using API.Entities;
using API.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace API.Services;

public class TokenService(IConfiguration config,UserManager<AppUser> userManager): ITokenService
{
    public async Task<string> CreateToken(AppUser user)
    {
        var tokenKey = config["TokenKey"] ?? throw new Exception("Cannot get token key");
        // if this returns after the ?? 
        if (tokenKey.Length <= 64)
        {
            throw new Exception("The token key length to be >= 64 characters");

        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenKey));
        // key is used for signing the token
        // SymmetricSecurityKey used for encrypt and decrypt info

        var claims = new List<Claim>
        {
            new(ClaimTypes.Email, user.Email!),
            new(ClaimTypes.NameIdentifier, user.Id)

        };

        var roles = await userManager.GetRolesAsync(user);

        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = creds
        }; // changed from AddMinutes(7) in order to keep the JWT longer 

        var tokenHandler = new JwtSecurityTokenHandler();

        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);

    }

    public string GenerateRefreshToken()
    {
        // store this refresh token which is going to be a long live token 
        // along with our user objects in the database and 
        // return it to the client browser as a cookie, an HTTP only secure cookie.

        var randomBytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(randomBytes);

    }
}
