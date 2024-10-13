using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AlbumStore.Application.Common;
using AlbumStore.Application.Filtering;
using AlbumStore.Application.QueryProjections;

namespace AlbumStore.Application.Queries.ProductQueries;
public class GetFilteredProductsQueries : BaseRequest<CollectionResponse<ProductOverview>>
{
    public int Skip { get; set; }
    public int Take { get; set; }
    public string? SortBy { get; set; }
    public string? SortOrder { get; set; }
    public string? Search { get; set; }
    public string? ArtistName
    {
        get;
        set;
    }
    public string? Genre
    {
        get;
        set;
    }
    public Guid? ArtistId
    {
        get;
        set;
    }

}
public class GetProductQuery : BaseRequest<ProductDto>
{
    public Guid Id { get; set; }
}
