using AlbumStore.Api.Controllers.Base;
using AlbumStore.Application.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using AlbumStore.Application.Commands.ProductCommands;
using AlbumStore.Application.Filtering;
using AlbumStore.Application.Queries.ProductQueries;
using AlbumStore.Application.QueryProjections;
using MediatR;

namespace AlbumStore.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProductController : BaseController
{
    [HttpPost("")]
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ProducesResponseType(typeof(CommandResponse), (int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductCommand productCommand)
    {
        CommandResponse commandResponse = await Mediator.Send(productCommand, new CancellationToken());
        if (commandResponse.IsValid)
            return Ok(commandResponse);

        return BadRequest(commandResponse);
    }

    [HttpGet("{id}")]
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
        CommandResponse commandResponse = await Mediator.Send(new DeleteProductCommand { Id = id },
            new CancellationToken());
        if (commandResponse.IsValid)
            return Ok(commandResponse);

        return BadRequest(commandResponse);
    }

    [HttpGet("")]
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ProducesResponseType(typeof(List<ProductOverview>), (int)HttpStatusCode.OK)]
    public async Task<CollectionResponse<ProductOverview>> GetProducts([FromQuery] GetFilteredProductsQueries query)
    {
        return await Mediator.Send(query, new CancellationToken());
    }

}


