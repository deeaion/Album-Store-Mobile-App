using AlbumStore.Application.Common;
using AlbumStore.Application.Models;
using AlbumStore.Application.Queries.AccountQueries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using AlbumStore.Api.Controllers.Base;

namespace AlbumStore.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : BaseController
    {
        public AccountController()
        {

        }

        [HttpGet]
        [Authorize(AuthenticationSchemes = "Bearer")]
        [ProducesResponseType(typeof(ApplicationUserDto), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(CommandResponse), (int)HttpStatusCode.BadRequest)]
        public async Task<ApplicationUserDto> GetLoggedInUser()
        {
            ApplicationUserDto commandResponse =
                await Mediator.Send(new GetLoggedInUserQuery());

            return commandResponse;
        }

        [HttpGet("GetUsersByRole/{role}")]
        [Authorize(AuthenticationSchemes = "Bearer")]
        [ProducesResponseType(typeof(ApplicationUserDto), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(CommandResponse), (int)HttpStatusCode.BadRequest)]
        public async Task<CollectionResponse<ApplicationUserDto>> GetLoggedInUserRole([FromRoute] string role)
            => await Mediator.Send(new GetUsersByRoleQuery() { Role = role });
    }
}
