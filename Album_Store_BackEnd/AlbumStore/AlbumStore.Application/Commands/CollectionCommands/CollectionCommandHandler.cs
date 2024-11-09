using AlbumStore.Application.Common;
using AlbumStore.Common.Identity;
using AlbumStore.Domain.Entities;
using AlbumStore.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AlbumStore.Application.Commands.CollectionCommands;

public class CollectionCommandHandler
(IRepository<CollectionItem> _collectionItemRepository,
    IRepository<Image> _imageRepository,
    IRepository<Product> _productRepository,
    IRepository<ApplicationUser> _userRepository,
    ICurrentUserService _currentUserService
    ) :
    IRequestHandler<CreateCollectionItemCommand, CommandResponse>,
    IRequestHandler<DeleteCollectionItemCommand, CommandResponse>
{
    public async Task<CommandResponse> Handle(CreateCollectionItemCommand request, CancellationToken cancellationToken)
    {
        string userId = (await _currentUserService.GetCurrentUser()).UserId;
        List<CollectionItem> collectionItems = await _collectionItemRepository.Query(c => c.UserId == userId).ToListAsync();
        if (collectionItems.Any(c => c.ProductId == request.CollectionItem.ProductId))
        {
            return CommandResponse.Failed(new[] { "This product is already in your collection!" });
        }
        CollectionItem collectionItem = new CollectionItem
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ProductId = request.CollectionItem.ProductId,
            ImageId = request.CollectionItem.ImageId,
            Title = request.CollectionItem.Title,
            Artist = request.CollectionItem.Artist
        };
        _collectionItemRepository.Add(collectionItem);
        ApplicationUser user = await _userRepository.Query(u => u.Id == userId).FirstOrDefaultAsync();
        if (user != null)
        {
            user.CollectionItems.Add(collectionItem);
        }
        await _collectionItemRepository.SaveChangesAsync(cancellationToken);
        await _userRepository.SaveChangesAsync(cancellationToken);
        return CommandResponse.Ok();
    }

    public async Task<CommandResponse> Handle(DeleteCollectionItemCommand request, CancellationToken cancellationToken)
    {

        string userId = (await _currentUserService.GetCurrentUser()).UserId;
        CollectionItem collectionItem = await _collectionItemRepository.Query(c => c.UserId == userId && c.Id == request.Id).FirstOrDefaultAsync();
        if (collectionItem == null)
        {
            return CommandResponse.Failed(new[] { "This product is not in your collection!" });
        }
        _collectionItemRepository.Remove(collectionItem);
        await _collectionItemRepository.SaveChangesAsync(cancellationToken);
        return CommandResponse.Ok();
    }
}
