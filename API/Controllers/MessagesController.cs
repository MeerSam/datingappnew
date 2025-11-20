using System;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Metadata;

namespace API.Controllers;
// Reminder that we're using conventions for the name of the controller.
// So controller has to be spelled accurately in order that we can use this as a route parameter 
//  ../api/messages
public class MessagesController(IUnitOfWork uow ) : BaseApiController
{
    // we need to derive from the base API controller And also we need to inject inside here the message repository.
    [HttpPost]

    public async Task<ActionResult<MessageDto>> CreateMessage(CreateMessageDto createMessageDto)
    {
        var sender = await uow.MemberRepository.GetMemberByIdAsync(User.GetMemberId());
        var recipient = await uow.MemberRepository.GetMemberByIdAsync(createMessageDto.RecipientId);

        if (sender == null || recipient == null || sender.Id == createMessageDto.RecipientId) return BadRequest("Cannot send this message");

        var message = new Message
        {
            SenderId = sender.Id,
            RecipientId = recipient.Id,
            Content = createMessageDto.Content,

        };
        uow.MessageRepository.AddMessage(message);

        if (await uow.Complete()) return message.ToDto();

        return BadRequest("Failed to send message");

    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResult<MessageDto>>> GetMessagesByContainer(
        [FromQuery] MessageParams messageParams)
    {
        // foreach (var claim in User.Claims)
        // {
        //     Console.WriteLine($"{claim.Type}: {claim.Value}");
        // }

        messageParams.MemberId = User.GetMemberId();

        return await uow.MessageRepository.GetMessagesForMember(messageParams);

    }

    [HttpGet("thread/{recipientId}")]

    public async Task<ActionResult<IReadOnlyList<MessageDto>>> GetMessageThread(string recipientId)
    {
        return Ok(await uow.MessageRepository.GetMessageThread(User.GetMemberId(), recipientId));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteMessage(string id)
    {
        // The metod should not delete the message unless the sender and receiver have both deleted 


        var memberId = User.GetMemberId();

        var message = await uow.MessageRepository.GetMessage(id);

        if (message == null) return BadRequest("Cannot delete this message");

        if (message.SenderId != memberId  && message.RecipientId != memberId)
            return BadRequest("You cannot delete this message");

        if (message.SenderId == memberId) message.SenderDeleted = true;
        if (message.RecipientId == memberId) message.RecipientDeleted = true;

        // using patern matching with property pattren  : new feature in C# (ver 8)
        if (message is { SenderDeleted: true, RecipientDeleted: true })
        {
            uow.MessageRepository.DeleteMessage(message);
        }

        if (await uow.Complete()) return Ok();

        return BadRequest("Problem deleting message");
    }

}
