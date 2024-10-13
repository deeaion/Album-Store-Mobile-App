using AlbumStore.Domain.Repositories;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AlbumStore.Persistence.Repositories;

namespace AlbumStore.Persistence.Bootstrap
{
    public  static class ServiceBuilderExtensions
    {
        public static void RegisterRepositories(this IServiceCollection services)
        {
            services.AddTransient(typeof(IRepository<>), typeof(Repository<>));
            services.AddTransient(typeof(IUserRepository), typeof(UserRepository));
        }
    }
}
