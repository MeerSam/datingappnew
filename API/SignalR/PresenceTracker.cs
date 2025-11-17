using System;
using System.Collections.Concurrent;
using Microsoft.Extensions.Configuration.UserSecrets;

namespace API.SignalR;

public class PresenceTracker
{
    // since each user can have multiple connnection : mobile, browser on computer
    //  <outer dict {key :UserID , value : {Inner dict Key : connectionID , value: byte} }
    //  byte: smallest thing to save inside dict its not meaning full in our case, 

    private static readonly ConcurrentDictionary<string,
    ConcurrentDictionary<string, byte>> OnlinesUsers = new();
    //ConcurrentDictionary : is a thread safe collection of key value pairs that can be accessed by multiple threads concurrently.


    public Task UserConnected(string userId, string connectionId)
    {
        // we only care abt  the inner dict key which is connectionID 
        // that is why the inner value is 0 the minimum byte that can be saved 
        var connections = OnlinesUsers.GetOrAdd(userId, _ =>
        new ConcurrentDictionary<string, byte>());
        connections.TryAdd(connectionId, 0);
        return Task.CompletedTask;

    }
    public Task UserDisconnected(string userId, string connectionId)
    {
        if (OnlinesUsers.TryGetValue(userId, out var connections))
        {
            connections.TryRemove(connectionId, out _);
            if (connections.IsEmpty)
            {
                OnlinesUsers.TryRemove(userId, out _);
            }
        }
        return Task.CompletedTask;
    }
    public Task<string[]> GetOnlineUsers()
    {
        // returns string of all online users' userids 
        return Task.FromResult(OnlinesUsers.Keys.OrderBy(k => k).ToArray());

    }
    
    public static Task<List<string>>  GetConnectionsForUser(string userId)
    {
        // making it a static method to use this directly without creating a instance of the PresenceTracker class
        if (OnlinesUsers.TryGetValue(userId, out var connections))
        {
            return Task.FromResult(connections.Keys.ToList());
        }
        return Task.FromResult(new List<string>());
    }

}
