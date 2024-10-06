using Qubiz.CareerManagement.Application.Services;

namespace Qubiz.CareerManagement.Application.Bootstrap;

public static class ServiceBuilderExtensions
{
    public static void RegisterApplicationServices(this IServiceCollection services)
    {
        services.AddSingleton<IJwtTokenService, JwtTokenService>();
    }
}
