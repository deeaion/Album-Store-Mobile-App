using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using AlbumStore.Common.Identity;
using AlbumStore.Infrastructure.RequestBehaviors;
using AlbumStore.Infrastructure.Services;


namespace AlbumStore.Infrastructure.Bootstrap
{
    public static class ServiceBuilderExtensions
    {
        public static void RegisterInfrastructureComponents(this IServiceCollection services)
        {
            services.AddTransient(typeof(IPipelineBehavior<,>), typeof(CurrentUserBehavior<,>));
            services.AddTransient(typeof(IPipelineBehavior<,>), typeof(RequestValidationBehavior<,>));

            services.AddScoped<ICurrentUserService, CurrentUserService>();
        }
    }
}
