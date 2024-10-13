using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AlbumStore.Application.Common;
using AlbumStore.Application.Models;

namespace AlbumStore.Application.Queries.BandQueries
{
  public class GetBandQuery : BaseRequest<BandDto>
    {
        public Guid Id { get; set; }
    }
  public class GetBandsQuery : BaseRequest<CollectionResponse<BandDto>>
    {
     
    }
}
