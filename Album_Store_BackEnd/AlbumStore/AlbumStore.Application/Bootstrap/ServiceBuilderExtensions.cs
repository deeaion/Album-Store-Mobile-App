using AlbumStore.Application.Interfaces;
using AlbumStore.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace AlbumStore.Application.Bootstrap;

public static class ServiceBuilderExtensions
{
    public static void RegisterApplicationServices(this IServiceCollection services)
    {
        services.AddSingleton<IJwtTokenService, JwtTokenService>();
    }
}
