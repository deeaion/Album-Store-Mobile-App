using AlbumStore.Application.Common;
using AlbumStore.Application.Models;

namespace AlbumStore.Application.Commands.CollectionCommands;

public class CreateCollectionItemCommand : BaseRequest<CommandResponse>
{
    public CollectionItemDto CollectionItem { get; set; }
}

public class DeleteCollectionItemCommand : BaseRequest<CommandResponse>
{
    public Guid Id { get; set; }
}
