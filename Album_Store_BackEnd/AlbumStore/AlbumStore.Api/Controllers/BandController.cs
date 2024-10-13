using AlbumStore.Application.Common;
using AlbumStore.Application.Models;
using AlbumStore.Application.Queries.ProductQueries;
using AlbumStore.Application.QueryProjections;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using AlbumStore.Application.Queries.BandQueries;
using AlbumStore.Application.Filtering;
using AlbumStore.Api.Controllers.Base;

namespace AlbumStore.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BandController :BaseController
    {
        public BandController()
        {
        }
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(BandDto), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> BandDto(Guid id)
        {
            BandDto bandDto = await Mediator.Send(new GetBandQuery { Id = id }, new CancellationToken());
            if (bandDto == null)
                return NotFound();
            return Ok(bandDto);
         
        }
        [HttpGet("")]
        [Authorize(AuthenticationSchemes = "Bearer")]
        [ProducesResponseType(typeof(CollectionResponse<BandDto>), (int)HttpStatusCode.OK)]
        public async Task<CollectionResponse<BandDto>> GetBands([FromQuery] GetBandsQuery query)
        {
            return await Mediator.Send(query, new CancellationToken());
        }
    }
}
