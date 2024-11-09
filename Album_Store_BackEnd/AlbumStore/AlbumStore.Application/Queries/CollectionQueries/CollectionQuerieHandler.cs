using AlbumStore.Application.Common;
using AlbumStore.Application.Models;
using AlbumStore.Common.Identity;
using AlbumStore.Domain.Entities;
using AlbumStore.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AlbumStore.Application.Queries.CollectionQueries;

public class CollectionQuerieHandler(
    IRepository<CollectionItem> collectionRepository,
    IRepository<ApplicationUser> repository,
    ICurrentUserService _userService) :
    IRequestHandler<GetCollectionItemsQuery, CollectionResponse<CollectionItemDto>>,
    IRequestHandler<GetCollectionItem, CollectionItemDto>
{
    public async Task<CollectionResponse<CollectionItemDto>> Handle(GetCollectionItemsQuery request,
        CancellationToken cancellationToken)
    {
        var userId = (await _userService.GetCurrentUser()).UserId;
        var collectionItemsQuery = collectionRepository.Query(c => c.UserId == userId).Include(
            c => c.Image);
        var totalNumberOfItems = await collectionItemsQuery.CountAsync(cancellationToken);
        List<CollectionItemDto> items = collectionItemsQuery.Select(c => new CollectionItemDto
        {
            Id = c.Id,
            ProductId = c.ProductId,
            ImageId = c.ImageId,
            Title = c.Title,
            Image = new ImageDto
            {

                ImageBase64 = c.Image != null ? Convert.ToBase64String(c.Image.Data) : null,
                ContentType = c.Image.ContentType,
                FileName = c.Image.FileName
            },
            Artist = c.Artist
        }).ToList();
        return new CollectionResponse<CollectionItemDto>(items, totalNumberOfItems);
    }

    public async Task<CollectionItemDto> Handle(GetCollectionItem request, CancellationToken cancellationToken)
    {

        var collectionItem = collectionRepository.Query(c => c.Id == request.Id).Include(c => c.Image).FirstOrDefault();
        if (collectionItem == null)
        {
            return await Task.FromResult<CollectionItemDto>(null);
        }

        return await Task.FromResult(new CollectionItemDto
        {
            Id = collectionItem.Id,
            ProductId = collectionItem.ProductId,
            ImageId = collectionItem.ImageId,
            Title = collectionItem.Title,
            Image = new ImageDto
            {
                ImageBase64 = collectionItem.Image != null ? Convert.ToBase64String(collectionItem.Image.Data) : null,
                ContentType = collectionItem.Image.ContentType,
                FileName = collectionItem.Image.FileName
            },
            Artist = collectionItem.Artist
        });

    }
}
