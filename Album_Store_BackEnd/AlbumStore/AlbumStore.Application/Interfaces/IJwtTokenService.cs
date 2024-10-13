using AlbumStore.Domain.Entities;

namespace AlbumStore.Application.Interfaces;

public interface IJwtTokenService
{
    string CreateToken(ApplicationUser user, string[] roles);
}