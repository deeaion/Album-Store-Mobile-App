using System.Net;
using AlbumStore.Api.Controllers.Base;
using AlbumStore.Application.Commands.CollectionCommands;
using AlbumStore.Application.Common;
using AlbumStore.Application.Models;
using AlbumStore.Application.Queries.CollectionQueries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AlbumStore.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CollectionController : BaseController
{
    [HttpPost("")]
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ProducesResponseType(typeof(CommandResponse), (int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    public async Task<IActionResult> CreateCollectionItem([FromBody] CreateCollectionItemCommand command)
    {
        CommandResponse response = await Mediator.Send(command, new CancellationToken());
        if (response.IsValid)
        {
            return Ok(response);
        }
        return BadRequest(response);
    }

    [HttpGet("{id}")]
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ProducesResponseType(typeof(CollectionItemDto), (int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> GetCollectionItem(Guid id)
    {

        CollectionItemDto response = await Mediator.Send(new GetCollectionItem() { Id = id }, new CancellationToken());
        if (response == null)
        {
            return NotFound();
        }
        return Ok(response);
    }



    [HttpGet("")]
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ProducesResponseType(typeof(CollectionResponse<CollectionItemDto>), (int)HttpStatusCode.OK)]
    public async Task<CollectionResponse<CollectionItemDto>> GetCollectionItems([FromQuery] GetCollectionItemsQuery query)
    {
        return await Mediator.Send(query, new CancellationToken());
    }

    [HttpDelete("{id}")]
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ProducesResponseType(typeof(CommandResponse), (int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> DeleteCollectionItem(Guid id)
    {
        CommandResponse response = await Mediator.Send(new DeleteCollectionItemCommand() { Id = id }, new CancellationToken());
        if (response.IsValid)
        {
            return Ok(response);
        }
        return NotFound(response);
    }
}
