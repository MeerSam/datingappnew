using System;

namespace API.Interfaces;

public interface IUnitOfWork
{
    IMemberRepository MemberRepository {get;}

    IMessageRepository MessageRepository {get;}
    
    ILikesRepository LikesRepository {get;}

    Task<bool> Complete(); // saving changes handled in this method
    // responsible for save all changes regarless of the Repository that updated 

    bool HasChanges(); //check the Entity Framework change tracker to see if there are any changes before 
    // we go ahead and attempt to save something


}
