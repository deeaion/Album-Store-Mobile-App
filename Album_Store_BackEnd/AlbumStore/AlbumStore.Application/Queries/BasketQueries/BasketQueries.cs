using AlbumStore.Application.Common;
using AlbumStore.Application.Models;

namespace AlbumStore.Application.Queries.BasketQueries;

public class GetBasketQuery : BaseRequest<BasketDto>
{
}

public class GetProductBasketQuery : BaseRequest<ProductBasketDto>
{
    public string Id { get; set; }
}
