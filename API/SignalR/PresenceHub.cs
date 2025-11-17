using System;
using System.Security.Claims;
using API.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR;

[Authorize]
public class PresenceHub(PresenceTracker presenceTracker) : Hub
{
    /*we need to effectively listen for these events (1) When a user comes online and (2) when a user disconnects from our signalR Hub 
     these method names ("UserOnline" & "UserOffline") here have to match exactly with what we're using on the client (see presence-service.ts). */
    public override async Task OnConnectedAsync()
    {
        await presenceTracker.UserConnected(GetUserId(), Context.ConnectionId);
        await Clients.Others.SendAsync("UserOnline", GetUserId()); //Context.User?.FindFirstValue(ClaimTypes.Email) replaced by GetUserId()
                                                                   // return base.OnConnectedAsync();

        // when the user first connects to this, then we'll send them back a list of currently online users.
        var currentUsers = await presenceTracker.GetOnlineUsers();
        // the instructor used Clients.All but suggested we use Clients.Caller
        await Clients.Caller.SendAsync("GetOnlineUsers", currentUsers);

    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await presenceTracker.UserDisconnected(GetUserId(), Context.ConnectionId);
        await Clients.Others.SendAsync("UserOffline", GetUserId()); // sending back the Users UserId


        var currentUsers = await presenceTracker.GetOnlineUsers();
        // when the user disconnects from hub, then we'll send list of Online Users to connected Clients.
        await Clients.All.SendAsync("GetOnlineUsers", currentUsers);

        await base.OnDisconnectedAsync(exception);
    }

    private string GetUserId()
    {
        // to handle null ref warning created a helper method
        return Context.User?.GetMemberId() ?? throw new HubException("Cannot get member id");
    }
}
