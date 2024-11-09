using AlbumStore.Application.Common;
using AlbumStore.Application.Models;

namespace AlbumStore.Application.Queries.OrderQueries;

public class GetOrderQuery : BaseRequest<OrderDto>
{
    public Guid Id { get; set; }
}

public class GetOrdersQuery : BaseRequest<CollectionResponse<OrderDto>>
{

}
