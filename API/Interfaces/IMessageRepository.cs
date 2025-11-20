using System;
using API.DTOs;
using API.Entities;
using API.Helpers;

namespace API.Interfaces;

public interface IMessageRepository
{
    void AddMessage(Message message);

    void DeleteMessage(Message message);

    Task<Message?> GetMessage(string messageId);

    Task<PaginatedResult<MessageDto>> GetMessagesForMember(MessageParams messageParams);

    Task<IReadOnlyList<MessageDto>> GetMessageThread(string currentMemberId, string recipientId);

    // Task<bool> SaveAllAsync();// implemnted Using IUnitOfWork

    /*track the members of a group inside a signalR hub (one user can make connections from 
        multiple devices  : each of those is going to have their own unique connection.). 
        Each user , as long as at least one connection for that user is inside that group,
            then we're going to consider them to be online for message read purposes. 
    */
    void AddGroup(Group group);
    Task RemoveConnection(string connectionId);
    Task<Group?> GetMessageGroup(string groupName);
    Task<Group?> GetGroupForConnection(string connectionId);

    Task<Connection?> GetConnection(string connectionId);



}
