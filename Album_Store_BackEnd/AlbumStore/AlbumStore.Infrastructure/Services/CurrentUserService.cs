using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using AlbumStore.Common.Identity;
using AlbumStore.Domain.Entities;
using Microsoft.AspNetCore.Http;

namespace AlbumStore.Infrastructure.Services;

public class CurrentUserService(IHttpContextAccessor httpContextAccessor,
    UserManager<ApplicationUser> userManager) : ICurrentUserService
{
    public async Task<CurrentUser> GetCurrentUser()
    {
        if (!httpContextAccessor.HttpContext.User.Identity.IsAuthenticated)
            return null;

        ApplicationUser user = await userManager.FindByIdAsync(httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier).Value);

        return user == null || user.IsDisabledByAdmin
            ? null
            : new CurrentUser()
            {
                UserId = user.Id,
            };
    }
}