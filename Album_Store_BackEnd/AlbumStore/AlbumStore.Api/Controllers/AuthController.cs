using AlbumStore.Api.Controllers.Base;
using AlbumStore.Application.Commands.AuthCommands;
using AlbumStore.Application.Common;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using MediatR;

namespace AlbumStore.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : BaseController
    {
        public AuthController()
        {
        }
        [AllowAnonymous]
        [HttpPost("Register")]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(CommandResponse), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> Register(UserRegistrationCommand userRegistrationCommand)
        {
            CommandResponse commandResponse = await Mediator.Send(userRegistrationCommand);

            return commandResponse.IsValid ? Ok(commandResponse) : BadRequest(commandResponse);
        }

        [HttpPost("Login")]
        [ProducesResponseType(typeof(CommandResponse<UserLoginCommandResponse>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(CommandResponse), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> Login(UserLoginCommand userLoginCommand)
        {
            CommandResponse<UserLoginCommandResponse> commandResponse = await Mediator.Send(userLoginCommand);

            return commandResponse.IsValid ? Ok(commandResponse) : BadRequest(commandResponse);
        }


        private void SetTokenCookie(string token)
        {
            CookieOptions cookieOptions = new CookieOptions
            {
                HttpOnly = false,
                Secure = false, // Not Secure for local development (since frontend is HTTP)
                SameSite = SameSiteMode.Lax, // Needed for cross-origin requests
                Expires = DateTime.UtcNow.AddHours(1)
            };
            Response.Cookies.Append("auth_token", token, cookieOptions);
        }

        [HttpPost("Logout")]
        public async Task<IActionResult> Logout()
        {
            Response.Cookies.Append("auth_token", "", new CookieOptions
            {
                Expires = DateTime.UtcNow.AddDays(-1),
                HttpOnly = true,
                Secure = false,
                SameSite = SameSiteMode.Lax
            });

            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

            return Ok(new { message = "Logout successful" });
        }
    }
}

