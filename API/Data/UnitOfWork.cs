using System;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class UnitOfWork(AppDbContext context) : IUnitOfWork
{
    // # 237 LAZY INITIALZE THE REPOSITORIES: So they're only created when they're first accessed.

    private IMemberRepository? _memberRepository;  //properties
    private IMessageRepository? _messageRepository;  //properties
    private ILikesRepository? _likesRepository;  //properties

    public IMemberRepository MemberRepository => _memberRepository 
        ??= new MemberRepository(context);// ??= if the _memberRepository is null create new

    public IMessageRepository MessageRepository => _messageRepository 
        ??= new MessageRepository(context);

    public ILikesRepository LikesRepository => _likesRepository 
        ??= new LikesRepository(context);

    public async Task<bool> Complete()
    {
        /*which repository those changes took place in. We're using the same complete method.

        So either all of the changes work or all of the changes get rolled back.*/
        try
        {
            return await context.SaveChangesAsync() > 0;
        }
        catch (DbUpdateException ex)
        {
            
            throw new Exception("An error occured while saving changes", ex);
        }
    }

    public bool HasChanges()
    {
        return context.ChangeTracker.HasChanges();
    }
}
