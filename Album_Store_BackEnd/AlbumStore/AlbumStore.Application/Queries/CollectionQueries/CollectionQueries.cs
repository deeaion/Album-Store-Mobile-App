using AlbumStore.Application.Common;
using AlbumStore.Application.Models;

namespace AlbumStore.Application.Queries.CollectionQueries;


public class GetCollectionItemsQuery : BaseRequest<CollectionResponse<CollectionItemDto>>
{

}

public class GetCollectionItem : BaseRequest<CollectionItemDto>
{
    public Guid Id { get; set; }
}