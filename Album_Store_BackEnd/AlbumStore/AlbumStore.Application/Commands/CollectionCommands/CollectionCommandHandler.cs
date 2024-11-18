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
        if (request.CollectionItem.Id != Guid.Empty &&request.CollectionItem.ProductId!=null &&request.CollectionItem.ProductId!=Guid.Empty && collectionItems.Any(c => c.ProductId == request.CollectionItem.ProductId))
        {
            return CommandResponse.Failed(new[] { "This product is already in your collection!" });
        }
        /*
         * public string ImageBase64 { get; set; }     // Base64-encoded image data
           public string ContentType { get; set; }     // MIME type, e.g., "image/jpeg"
           public string FileName { get; set; }        // Optional file name
         */
        Image image= new Image { Id=Guid.NewGuid(),Data = Convert.FromBase64String(request.CollectionItem.Image.ImageBase64), ContentType = request.CollectionItem.Image.ContentType, FileName = request.CollectionItem.Image.FileName };
        _imageRepository.Add(image);
        await _imageRepository.SaveChangesAsync(cancellationToken);
        CollectionItem collectionItem = new CollectionItem
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ProductId = request.CollectionItem.ProductId,
            ImageId = image.Id,
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
