using AlbumStore.Application.Common;
using AlbumStore.Application.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlbumStore.Application.Queries.AccountQueries
{

    public class GetLoggedInUserQuery : BaseRequest<ApplicationUserDto>
    {
    }

    public class GetUsersByRoleQuery : BaseRequest<CollectionResponse<ApplicationUserDto>>
    {
        public string Role { get; set; }
    }
}
