using System;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Primitives;

namespace API.SignalR;

[Authorize]
public class MessageHub(IMessageRepository messageRepository
         , IMemberRepository memberRepository
         , IHubContext<PresenceHub> presenceHub) : Hub
{
    /* The way that we'll approach this is we'll send up the user ID of the other user 
    as part of the query string parameters when we initialize the connection to this particular hub.*/
    public override async Task OnConnectedAsync()
    {
        // we need to access httpContext:  
        // inside Hub we have access to Hub.Context but via Hub.Context we can also get access to HttpContext
        var httpContext = Context.GetHttpContext(); // initial negotiation takes place   HttpRequesr to setup SignalR connection
        var otherUser = httpContext?.Request?.Query["userId"].ToString() ?? throw new HubException("Other user not found");

        // Create a group to ensure that the messaging is private between the two users that are connected to this hub. 

        var groupName = GetGroupName(GetUserId(), otherUser);

        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        await AddToGroup(groupName);

        var messages = await messageRepository.GetMessageThread(GetUserId(), otherUser);

        await Clients.Group(groupName).SendAsync("ReceiveMessageThread", messages);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        //as soon as the client disconnects from SignalR, they'll automatically be removed from that group. 
        // That connection ID will be removed from this group that we're creating.
        await messageRepository.RemoveConnection(Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }
    public async Task SendMessage(CreateMessageDto createMessageDto)
    {
        // SignalR allows us to call functions (SendMessage) inside .Net from the client browser.
        var sender = await memberRepository.GetMemberByIdAsync(GetUserId());
        var recipient = await memberRepository.GetMemberByIdAsync(createMessageDto.RecipientId);

        if (sender == null || recipient == null || sender.Id == createMessageDto.RecipientId)
            throw new HubException("Cannot send this message");

        var message = new Message
        {
            SenderId = sender.Id,
            RecipientId = recipient.Id,
            Content = createMessageDto.Content,

        };
        var groupName = GetGroupName(sender.Id, recipient.Id);
        var group = await messageRepository.GetMessageGroup(groupName);

        // check if user in Group
        var userInGroup = group != null && group.Connections.Any(x => x.UserId == message.RecipientId);
        if (userInGroup)
        {
            message.DateRead = DateTime.UtcNow;
        }

        messageRepository.AddMessage(message);

        if (await messageRepository.SaveAllAsync())
        {
            await Clients.Group(groupName).SendAsync("NewMessage", message.ToDto());
            // # notify the recipient that they have received a new message
            

            var connections = await PresenceTracker.GetConnectionsForUser(recipient.Id);
            if (!userInGroup && connections.Count> 0 && connections != null)
            {
                // if they are connected to the group but they are online
                await presenceHub.Clients.Clients(connections).SendAsync("NewMessageReceived", message.ToDto());
            }
        }

    }

    private async Task<bool> AddToGroup(string groupName)
    {
        /* when we connect to our message hub, 
        we want to add the user to the group and persist that in our database.*/
        var group = await messageRepository.GetMessageGroup(groupName);
        var connection = new Connection(Context.ConnectionId, GetUserId());

        if (group == null)
        {
            group = new Group(groupName);
            messageRepository.AddGroup(group);
        }
        group.Connections.Add(connection);
        return await messageRepository.SaveAllAsync();
    }

    private static string GetGroupName(string? caller, string? otherUser)
    {
        /* create a group name based on the user IDs and we always want it to return the same groupname,
        regardless of which order they connect to the hub. 
        So we'll need to sort this into alphabetical order effectively so that we always return the same group name.*/

        var stringComparer = string.CompareOrdinal(caller, otherUser) < 0;

        return stringComparer ? $"{caller}-{otherUser}" : $"{otherUser}-{caller}";
    }


    private string GetUserId()
    {
        // to handle null ref warning created a helper method
        return Context.User?.GetMemberId() ?? throw new HubException("Cannot get member id");
    }
}
