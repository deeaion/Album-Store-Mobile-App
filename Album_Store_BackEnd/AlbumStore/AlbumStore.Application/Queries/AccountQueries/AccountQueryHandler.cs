using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AlbumStore.Application.Common;
using AlbumStore.Application.Models;
using AlbumStore.Application.QueryProjections.Mappers;
using AlbumStore.Domain.Entities;
using AlbumStore.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AlbumStore.Application.Queries.AccountQueries
{
    public class AccountQueryHandler(IRepository<ApplicationUser> userRepository) :
        IRequestHandler<GetLoggedInUserQuery, ApplicationUserDto>,
        IRequestHandler<GetUsersByRoleQuery, CollectionResponse<ApplicationUserDto>>
    {
        public async Task<ApplicationUserDto> Handle(GetLoggedInUserQuery request, CancellationToken cancellationToken)
        {
            return await userRepository.Query(u => u.Id == request.User.UserId).ProjectToDto().FirstOrDefaultAsync(cancellationToken);
        }

        public async Task<CollectionResponse<ApplicationUserDto>> Handle(GetUsersByRoleQuery request, CancellationToken cancellationToken)
        {
            List<ApplicationUserDto> UserList = await userRepository
                .Query(u => u.UserRoles.Any(role => role.Role.NormalizedName == request.Role))
                .ProjectToDto().ToListAsync(cancellationToken);
            return new CollectionResponse<ApplicationUserDto>(UserList, UserList.Count);
        }
    }
}
