using AlbumStore.Api.Controllers.Base;
using AlbumStore.Application.Commands.BasketCommands;
using AlbumStore.Application.Common;
using AlbumStore.Application.Models;
using AlbumStore.Application.Queries.BasketQueries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace AlbumStore.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BasketController : BaseController
    {
        [HttpPost("")]
        [Authorize(AuthenticationSchemes = "Bearer")]
        [ProducesResponseType(typeof(CommandResponse), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> CreateProductBasket([FromBody] CreateProductBasketCommand basketCommand)
        {
            CommandResponse commandResponse = await Mediator.Send(basketCommand, new CancellationToken());
            if (commandResponse.IsValid)
            {
                return Ok(commandResponse);
            }

            return BadRequest(commandResponse);
        }

        [HttpGet("{id}")]
        [Authorize(AuthenticationSchemes = "Bearer")]
        [ProducesResponseType(typeof(ProductBasketDto), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> GetBasketProduct(Guid id)
        {
            ProductBasketDto productBasketDto = await Mediator.Send(new GetProductBasketQuery { Id = id.ToString() }, new CancellationToken());
            if (productBasketDto == null)
            {
                return NotFound();
            }
            return Ok(productBasketDto);
        }

        [HttpPut()]
        [Authorize(AuthenticationSchemes = "Bearer")]
        [ProducesResponseType(typeof(CommandResponse), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> UpdateBasketProduct([FromBody] UpdateProductBasketCommand updateProductCommand)
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
        public async Task<IActionResult> DeleteProductFromBasket([FromRoute] Guid id)
        {
            CommandResponse commandResponse = await Mediator.Send(new DeleteProductBasketCommand { Id = id.ToString() }, new CancellationToken());
            if (commandResponse.IsValid)
                return Ok(commandResponse);
            return BadRequest(commandResponse);
        }


        [HttpGet("")]
        [Authorize(AuthenticationSchemes = "Bearer")]
        [ProducesResponseType(typeof(BasketDto), (int)HttpStatusCode.OK)]
        public async Task<BasketDto> GetBasketForUser([FromQuery] GetBasketQuery query)
        {
            return await Mediator.Send(query, new CancellationToken());
        }
    }
}
