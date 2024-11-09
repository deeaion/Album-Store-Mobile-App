using AlbumStore.Api.Controllers.Base;
using AlbumStore.Application.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using AlbumStore.Application.Commands.ProductCommands;
using AlbumStore.Application.Filtering;
using AlbumStore.Application.Models;
using AlbumStore.Application.Queries.ProductQueries;
using AlbumStore.Application.QueryProjections;
using AlbumStore.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.SignalR;
using AlbumStore.Infrastructure.WebSockets;
using Newtonsoft.Json;

namespace AlbumStore.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProductController : BaseController
{
    private readonly IHubContext<AlbumStoreHub> _hubContext;

    public ProductController(IHubContext<AlbumStoreHub> hubContext)
    {
        _hubContext = hubContext;
    }

    [HttpPost("")]
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ProducesResponseType(typeof(CommandResponse), (int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductCommand productCommand)
    {
        CommandResponse commandResponse = await Mediator.Send(productCommand, new CancellationToken());
        if (commandResponse.IsValid)
        {
            var productNotification = new
            {
                Type = "ProductAdded",
                Message = "A new product has been added",
                ProductName = productCommand.ProductDto.Name
            };
            string notificationMessage = JsonConvert.SerializeObject(productNotification);

            // Send the notification message to all connected clients via SignalR
            await _hubContext.Clients.All.SendAsync("ReceiveMessage", notificationMessage);

            return Ok(commandResponse);
        }

        return BadRequest(commandResponse);
    }

    [HttpGet("{id}")]
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ProducesResponseType(typeof(ProductDto), (int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> GetProduct(Guid id)
    {
        ProductDto productDto = await Mediator.Send(new GetProductQuery { Id = id }, new CancellationToken());
        if (productDto == null)
            return NotFound();

        return Ok(productDto);
    }

    [HttpPut()]
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ProducesResponseType(typeof(CommandResponse), (int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> UpdateProduct([FromBody] UpdateProductCommand updateProductCommand)
    {
        CommandResponse commandResponse = await Mediator.Send(updateProductCommand, new CancellationToken());
        if (commandResponse == null)
        {
            return NotFound();
        }
        if (commandResponse.IsValid)
            return Ok(commandResponse);
        return BadRequest(commandResponse);
    }

    [HttpDelete("{id}")]
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ProducesResponseType(typeof(CommandResponse), (int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    public async Task<IActionResult> DeleteProduct([FromRoute] Guid id)
    {
        CommandResponse<ProductDeletedDto> commandResponse = await Mediator.Send(new DeleteProductCommand { Id = id },
            new CancellationToken());
        // Notify clients that have put as favorite the product
        if (commandResponse.IsValid)
        {
            var productNotification = new
            {
                Type = "ProductDeleted",
                Message = "A product in your wishlist was removed from our site",
                ProductName = commandResponse.Result.Name
            };

            string notificationMessage = JsonConvert.SerializeObject(productNotification);

            // Send the notification message to all connected clients via SignalR
            var usersToNotify = commandResponse.Result.UsersWhoFavoritedIt;
            Console.WriteLine("Users who are:");

            foreach (var VARIABLE in usersToNotify)
            {
                Console.WriteLine(VARIABLE);
            }
            foreach (var userId in usersToNotify)
            {
                var connections = AlbumStoreHub.GetConnectionsForUser(userId);
                if (connections.Any())
                {
                    foreach (var connectionId in connections)
                    {
                        await _hubContext.Clients.Client(connectionId).SendAsync("ReceiveMessage", notificationMessage);
                    }
                }
                else
                {
                    Console.WriteLine($"No active connections found for user: {userId}");
                }
            }
            return Ok(commandResponse);
        }

        return BadRequest(commandResponse);
    }


    [HttpGet("")]
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ProducesResponseType(typeof(List<ProductOverview>), (int)HttpStatusCode.OK)]
    public async Task<CollectionResponse<ProductOverview>> GetProducts([FromQuery] GetFilteredProductsQueries query)
    {
        return await Mediator.Send(query, new CancellationToken());
    }
    // get all genres
    [HttpGet("Genres")]
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ProducesResponseType(typeof(List<string>), (int)HttpStatusCode.OK)]
    public async Task<CollectionResponse<string>> GetGenres()
    {
        return await Mediator.Send(new GetProductsGenresQuery(), new CancellationToken());
    }
    // add product to favorite
    [HttpPost("Favorite")]
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ProducesResponseType(typeof(CommandResponse), (int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    public async Task<IActionResult> AddFavoriteProduct([FromBody] AddFavoriteProductCommand addFavoriteProductCommand)
    {
        CommandResponse commandResponse = await Mediator.Send(addFavoriteProductCommand, new CancellationToken());
        if (commandResponse.IsValid)
            return Ok(commandResponse);

        return BadRequest(commandResponse);
    }
    // remove product from favorite
    [HttpDelete("Favorite")] 
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ProducesResponseType(typeof(CommandResponse), (int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    public async Task<IActionResult> RemoveFavoriteProduct([FromBody] RemoveFavoriteProductCommand removeFavoriteProductCommand)
    {
        CommandResponse commandResponse = await Mediator.Send(removeFavoriteProductCommand, new CancellationToken());
        if (commandResponse.IsValid)
            return Ok(commandResponse);

        return BadRequest(commandResponse);
    }

}
