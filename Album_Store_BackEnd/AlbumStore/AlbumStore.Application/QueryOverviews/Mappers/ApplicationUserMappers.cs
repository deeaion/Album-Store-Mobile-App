using AlbumStore.Application.Models;
using AlbumStore.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlbumStore.Application.QueryProjections.Mappers
{
    public static  class ApplicationUserMappers
    {
        public static IQueryable<ApplicationUserDto> ProjectToDto(this IQueryable<ApplicationUser> query) => query.Select(u => new ApplicationUserDto
        {
            DisplayName = u.DisplayName,
            Email = u.Email,
            FirstName = u.FirstName,
            Id = u.Id,
            LastName = u.LastName,
            Roles = u.UserRoles.Select(ur => ur.Role.Name).ToArray(),
         
        });
    }
}
