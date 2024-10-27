using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AlbumStore.Application.Common;
using AlbumStore.Application.Filtering;
using AlbumStore.Application.QueryProjections;
using AlbumStore.Application.QueryProjections.Mappers;
using AlbumStore.Common.Helpful;
using AlbumStore.Common.Identity;
using AlbumStore.Domain.Entities;
using AlbumStore.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AlbumStore.Application.Queries.ProductQueries
{
    public class ProductQueryHandler(IRepository<Product> productRepository,ICurrentUserService service) :
        IRequestHandler<GetFilteredProductsQueries, CollectionResponse<ProductOverview>>,
        IRequestHandler<GetProductQuery, ProductDto>,
        IRequestHandler<GetProductsGenresQuery, CollectionResponse<string>>
    {
        public async Task<CollectionResponse<ProductOverview>> Handle(GetFilteredProductsQueries request, CancellationToken cancellationToken)
        {
            IQueryable<Product> query = productRepository.Query();
            query = query.ApplyFilter(request);
            int totalNumberOfItems= await query.CountAsync(cancellationToken);
            //to overview
            String currentUserId = (await service.GetCurrentUser()).UserId;
            IQueryable<ProductOverview> productOverviews = query.ToProductOverview(currentUserId);
            //add sort and pagination
            productOverviews = productOverviews.SortAndPaginate(
                !string.IsNullOrEmpty(request.SortBy) ? request.SortBy : "artist",
                !string.IsNullOrEmpty(request.SortOrder) ? request.SortOrder : "asc",
                request.Skip,
                request.Take);
            List<ProductOverview> productOverviewsList = await productOverviews.ToListAsync(cancellationToken);
     
            return new CollectionResponse<ProductOverview>(productOverviewsList, totalNumberOfItems);
        }

        public async Task<ProductDto> Handle(GetProductQuery request, CancellationToken cancellationToken)
        {
            String currentUserId = (await service.GetCurrentUser()).UserId;
            

            ProductDto? productDto =await productRepository.Query(p=>p.Id == request.Id)
                .Select(p => new ProductDto
                {
                  Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    Price = p.Price,
                    Genre = p.Genre.ToString(),
                    BandId = p.BandId,
                    BandName = p.Band.Name,
                    Artists = p.Artists.Select(a => new ArtistDto
                    {
                        Id = a.Id,
                        Name = a.Name
                    }).ToList(),
                    BaseImageUrl = p.BaseImageUrl,
                    ProductVersions = p.ProductVersions.Select(pv => new ProductVersionDto
                    {
                        Id = pv.Id,
                        Version = pv.Version,
                        Description = pv.Description,
                        ImageUrl = pv.ImageUrl,
                        Price = pv.Price,
                        ProductId = pv.ProductId
                    }).ToList(),
                    IsFavorited = p.UsersWhoLikeThisProduct.Any(u => u.Id == currentUserId)

                }).FirstOrDefaultAsync(cancellationToken);
            return productDto;
        }

        public Task<CollectionResponse<string>> Handle(GetProductsGenresQuery request, CancellationToken cancellationToken)
        {
            List<string> genres= Enum.GetNames(typeof(Genre)).ToList();
            return Task.FromResult(new CollectionResponse<string>(genres, genres.Count));
        }
    }
}
