using System;
using API.Data;
using API.Extensions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;

namespace API.Helpers;

public class LogUserActivity : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var resultContext = await next();
        //check if its authenticated request 
        if (context.HttpContext.User.Identity?.IsAuthenticated != true) return;

        var memberId = resultContext.HttpContext.User.GetMemberId();

        // to get hold of in here is our dbcontext and we cannot inject anything into this particular method.
        // So we're going to use the service locator pattern to get hold of our dbcontext.
        var dbcontext = resultContext.HttpContext.RequestServices
            .GetRequiredService<AppDbContext>();

        await dbcontext.Members
        .Where(x => x.Id == memberId)
        .ExecuteUpdateAsync(setters => setters.SetProperty(x => x.LastActive, DateTime.UtcNow)); // fires and makes changes immediately not wait as done in DbContext.SaveChanges().
        // this has to be aDDED AS SERVICE 

    }
}
