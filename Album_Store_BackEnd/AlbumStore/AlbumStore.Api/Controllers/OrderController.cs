using AlbumStore.Api.Controllers.Base;
using AlbumStore.Application.Commands.OrderCommands;
using AlbumStore.Application.Common;
using AlbumStore.Application.Models;
using AlbumStore.Application.Queries.OrderQueries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace AlbumStore.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : BaseController
    {

        [HttpPost("")]
        [Authorize(AuthenticationSchemes = "Bearer")]
        [ProducesResponseType(typeof(CommandResponse), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderCommand orderCommand)
        {
            CommandResponse commandResponse = await Mediator.Send(orderCommand, new CancellationToken());
            if (commandResponse.IsValid)
            {
                return Ok(commandResponse);
            }

            return BadRequest(commandResponse);
        }

        [HttpGet("{id}")]
        [Authorize(AuthenticationSchemes = "Bearer")]
        [ProducesResponseType(typeof(OrderDto), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> GetOrder(Guid id)
        {
            OrderDto orderDto = await Mediator.Send(new GetOrderQuery { Id = id }, new CancellationToken());
            if (orderDto == null)
            {
                return NotFound();
            }
            return Ok(orderDto);
        }



        [HttpGet("")]
        [Authorize(AuthenticationSchemes = "Bearer")]
        [ProducesResponseType(typeof(CollectionResponse<OrderDto>), (int)HttpStatusCode.OK)]
        public async Task<CollectionResponse<OrderDto>> GetOrdersForUser([FromQuery] GetOrdersQuery query)
        {
            return await Mediator.Send(query, new CancellationToken());
        }
    }
}
