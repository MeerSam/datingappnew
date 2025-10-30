using System.Text;
using API.Data;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using API.Middleware;
using API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddDbContext<AppDbContext>(opt =>
{
    opt.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddCors();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IPhotoService, PhotoService>();
builder.Services.AddScoped<IMemberRepository, MemberRepository>();
builder.Services.AddScoped<IMessageRepository, MessageRepository>();
builder.Services.AddScoped<ILikesRepository, LikesRepository>();
builder.Services.AddScoped<LogUserActivity>();
builder.Services.Configure<CloudinarySettings>(builder.Configuration.GetSection("CloudinarySettings"));
builder.Services.AddIdentityCore<AppUser>(opt =>
{
    opt.Password.RequireNonAlphanumeric = false;
    opt.User.RequireUniqueEmail = true;
})
.AddRoles<IdentityRole>()
.AddEntityFrameworkStores<AppDbContext>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    var tokenKey = builder.Configuration["TokenKey"] ?? throw new Exception("Token key not found -Program.cs");
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenKey)),
        ValidateIssuer = false,
        ValidateAudience = false
    };

});
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
//builder.Services.AddOpenApi(); // removed as it is not used in the current context

builder.Services.AddAuthorizationBuilder()
.AddPolicy("RequireAdminRole", policy => policy.RequireRole("Admin"))
.AddPolicy("ModeratePhotoRole", policy => policy.RequireRole("Admin", "Moderator"));

var app = builder.Build();

// Configure the HTTP request pipeline.
// if (app.Environment.IsDevelopment())
// {
//     app.MapOpenApi();
// }

//app.UseHttpsRedirection(); 
app.UseMiddleware<ExceptionMiddleware>(); // Midleware 1 In first out lkast
app.UseCors(x => x
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
            .WithOrigins("https://localhost:4200", "http://localhost:4200"));
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

//Seed data
using var scope = app.Services.CreateScope();
var services = scope.ServiceProvider;
try
{
    var context = services.GetRequiredService<AppDbContext>();
    var userManager = services.GetRequiredService<UserManager<AppUser>>();
    // migrating the database in code 
    //creates database if it does not already exists

    await context.Database.MigrateAsync();
    // Since we used static method we have access  to Seedusers method
    await Seed.SeedUsers(userManager); // userManger
    
}
catch (Exception ex)
{
    var logger = services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "An error occured during the migration");

    throw;
}

app.Run();
